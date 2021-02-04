const router = require("express").Router({ mergeParams: true });
const { Op } = require("sequelize");
const { Receipt, Item, ItemizedTransaction, User } = require("../db/models");
import { API_KEY } from "../secrets";
const API_URL = `https://vision.googleapis.com/v1/images:annotate?key=${API_KEY}`;
module.exports = router;

/* 
- get base64 from frontend
- send base64 to cloud vision -> receive receipt data
- send receipt to function -> function parses data
- use data to create new receipt object
	- use data to create new item objects
- res.json back receipt and items 
*/

async function callGoogleVisionAsync(image) {
  const body = {
    requests: [
      {
        image: {
          content: image,
        },
        features: [
          {
            type: "DOCUMENT_TEXT_DETECTION",
          },
        ],
      },
    ],
  };

  const response = await fetch(API_URL, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
  const result = await response.json();
  // console.log('callGoogleVisionAsync -> result', result);

  return result.responses[0].textAnnotations[0].description;
}

function parseReceiptData(receiptText) {
  const receipt = {};
  const items = []; // array of item objects
}

// API/RECEIPTS/
router.post("/", async (req, res, next) => {
  try {
    const receiptData = await callGoogleVisionAsync(req.body.base64);
    console.log("IT IS WORKING IN THE BACKEND\n", receiptData);

    // make sequelize objects
    res.json(receiptData);
  } catch (err) {
    next(err);
  }
});

/*
Takes in a receipt ID and returns the receipt with nested models (Creditor, Items, Itemized transactions, Debtors)
*/
router.get("/:receiptId", async (req, res, next) => {
  try {
    const receipt = await Receipt.findByPk(+req.params.receiptId, {
      attributes: [["id", "receiptId"], "total"],
      include: [
        {
          model: Item,
          attributes: [["id", "itemId"], "name", "price", "quantity"],
          include: [
            {
              model: ItemizedTransaction,
              attributes: [
                ["id", "itemizedTransactionId"],
                "amountOwed",
                "paid",
              ],
              include: {
                model: User,
                as: "debtor",
                attributes: [["id", "debtorId"], "fullName"],
              },
            },
          ],
        },
        {
          model: User,
          as: "creditor",
          attributes: [["id", "creditorId"], "fullName"],
        },
      ],
    });
    res.json(receipt);
  } catch (err) {
    console.log(err);
    next(err);
  }
});

/*
Takes in a receipt ID and settles the debt on that receipt for a logged in user (settling debt means changing itemized transaction to paid = true)
*/
router.put("/:receiptId/settle", async (req, res, next) => {
  try {
    console.log("Settling for user: ", req.user.id);
    //look up receipt where id matches user and paid is false
    const receipt = await Receipt.findByPk(+req.params.receiptId, {
      include: [
        {
          model: Item,
          include: [
            {
              model: ItemizedTransaction,
              where: {
                debtorId: req.user.id,
                paid: false,
              },
            },
          ],
        },
        {
          model: User,
          as: "creditor",
        },
      ],
    });

    if (!receipt) next(new Error("No receipt found"));

    // check that items were found
    if (receipt.items.length) {
      //loop over every item
      for (let i = 0; i < receipt.items.length; i++) {
        let currentItem = receipt.items[i];
        // check if item has itemizedTransactions
        if (currentItem.itemizedTransactions.length) {
          // loop over itemized transactions
          for (let j = 0; j < currentItem.itemizedTransactions.length; j++) {
            let currentItemizedTransaction =
              currentItem.itemizedTransactions[j];
            // check that debtor id matches the user
            if (currentItemizedTransaction.debtorId === req.user.id) {
              // set status of transaction to paid
              await currentItemizedTransaction.update({ paid: true });
              console.log(
                "Updated itemized transaction: ",
                currentItemizedTransaction.id,
                " for user: ",
                req.user.id
              );
            }
          }
        }
      }
    } else {
      // If there are no items found that match criteria
      res.status(400).send("No outstanding debts found for that receipt");
      return;
    }

    res.send("success");
  } catch (err) {
    console.log(err);
    next(err);
  }
});
