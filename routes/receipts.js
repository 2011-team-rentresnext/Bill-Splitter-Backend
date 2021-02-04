const router = require("express").Router({ mergeParams: true });
const { Op } = require("sequelize");
const { Receipt, Item, ItemizedTransaction, User } = require("../db/models");
module.exports = router;

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
