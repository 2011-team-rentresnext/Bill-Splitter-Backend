"use strict";
const db = require("../db");
const { User, Item, Receipt, ItemizedTransaction } = require("../db/models");
const faker = require("faker");

async function seed() {
  await db.sync({ force: true });
  console.log("db synced!");

  /* --------------------users---------------------------*/
  const usersCreated = [];

  const createFakeUser = () => {
    const firstName = faker.name.firstName();
    const lastName = faker.name.lastName();
    return {
      firstName,
      lastName,
      isAdmin: false,
      email: `${firstName}.${lastName}${
        faker.internet.email().match(/@.+/)[0]
      }`,
      password: faker.internet.password(),
      phoneNumber: faker.phone.phoneNumberFormat(),
    };
  };

  for (let i = 0; i < 100; i++) {
    const user = createFakeUser();
    if (i < 4) console.log(user.email, user.password);
    usersCreated.push(User.create(user));
  }

  const users = await Promise.all(usersCreated);
  console.log("fullName", users[0].fullName);

  // user for dummy receipt
  const jerryFake = await User.create({
    firstName: "Jerry",
    lastName: "fake",
    isAdmin: false,
    email: `jerry.fake@gmail.com`,
    password: "123",
    phoneNumber: faker.phone.phoneNumberFormat(),
  });

  /* --------------------receipts---------------------------*/

  const receipts = [];
  for (let i = 0; i < 50; i++) {
    const user = users[i];
    const receipt = await Receipt.create({
      creditorId: user.id,
      total: Math.floor(Math.random() * 15000),
    });
    receipts.push(receipt);
  }

  // receipt for testing dummy receipt
  const dummyReceipt = await Receipt.create({
    creditorId: jerryFake.id,
    total: 9163,
  });

  /* --------------------items---------------------------*/

  const items = [];

  for (const receipt of receipts) {
    const randNum = Math.random() * 10;
    for (let i = 0; i < randNum; i++) {
      const item = await Item.create({
        receiptId: receipt.id,
        name: faker.lorem.words(),
        price: Math.ceil(Math.random() * 5000),
        quantity: Math.ceil(Math.random() * 5),
      });
      items.push(item);
    }
  }

  const dummyReceiptItems = [
    {
      name: "meatloaf",
      price: 2487,
      quantity: 1,
    },
    {
      name: "chicken",
      price: 1922,
      quantity: 1,
    },
    {
      name: "salmon",
      price: 3127,
      quantity: 1,
    },
    {
      name: "risotto",
      price: 1982,
      quantity: 1,
    },
    {
      name: "coffee",
      price: 867,
      quantity: 1,
    },
    {
      name: "beer",
      price: 700,
      quantity: 1,
    },
  ];

  for (let i = 0; i < dummyReceiptItems.length; i++) {
    await Item.create({ ...dummyReceiptItems[i], receiptId: dummyReceipt.id });
  }

  /* --------------------itemizedTransactions---------------------------*/

  const itemizedTransactions = [];

  for (let i = 0; i < items.length / 3; i++) {
    const item = items[Math.floor(Math.random() * items.length)];
    const itemizedTransaction = await ItemizedTransaction.create({
      debtorId: Math.ceil(Math.floor(Math.random() * 50 + 50)),
      itemId: item.id,
      amountOwed: item.price,
      paid: [false, true][Math.floor(Math.random() * 2)],
    });
    itemizedTransactions.push(itemizedTransaction);
  }

  console.log(`seeded ${users.length} users`);
  console.log(`seeded ${receipts.length} receipts`);
  console.log(`seeded ${items.length} items`);
  console.log(`seeded ${itemizedTransactions.length} itemizedTransactions`);
  console.log(`seeded successfully`);
}

// We've separated the `seed` function from the `runSeed` function.
// This way we can isolate the error handling and exit trapping.
// The `seed` function is concerned only with modifying the database.
async function runSeed() {
  console.log("seeding...");
  try {
    await seed();
  } catch (err) {
    console.error(err);
    process.exitCode = 1;
  } finally {
    console.log("closing db connection");
    await db.close();
    console.log("db connection closed");
  }
}

// Execute the `seed` function, IF we ran this module directly (`node seed`).
// `Async` functions always return a promise, so we can use `catch` to handle
// any errors that might occur inside of `seed`.
if (module === require.main) {
  runSeed();
}

// we export the seed function for testing purposes (see `./seed.spec.js`)
module.exports = seed;
