const nodemailer = require('nodemailer')
const {User} = require('../db/models')

async function main() {
  let testAccount = await nodemailer.createTestAccount()

  let transporter = nodemailer.createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    secure: false,
    auth: {
      user: testAccount.user, // generated ethereal user
      pass: testAccount.pass, // generated ethereal password
    },
  })

  let info = await transporter.sendMail({
    from: '"Bill Slicer" <foo@example.com>',
    to: 'stickysorbet@gmail.com',
    subject: 'Payment requested',
    text: 'Hello world?', // plain text body
    html: '<b>Hello world?</b>', // html body
  })

  console.log('PREVIEW URL', nodemailer.getTestMessageUrl(info))
}

const getTotal = (items) => {
  let totalPrice = items.reduce((total, item) => {
    return total + item.price
  }, 0)

  // tedious string formatting
  totalPrice = totalPrice.toString().split('')
  totalPrice.unshift('$')
  totalPrice.splice(-2, 0, '.')
  totalPrice = totalPrice.join('')

  return totalPrice
}

const createEmail = (items) => {
  main()
  const totalPrice = getTotal(items)
  console.log(totalPrice)
}

const emailNotif = async (users) => {
  // users = {id: items}
  for (let id in users) {
    const user = await User.findOne({
      where: {id},
    })
    const email = createEmail(users[id])
    console.log('OOGA WOOGA\n', user)
  }
}

/* 
an item { itemId: 536, price: 1900 }
an item { itemId: 537, price: 2300 }
an item { itemId: 538, price: 2800 }
an item { itemId: 539, price: 2500 }
OOGA WOOGA
 user {
  dataValues: {
    id: 104,
    firstName: 'boogie',
    lastName: 'woogie',
    isAdmin: null,
    phoneNumber: null,
    email: 'boog@woog.com',
    password: '37d01f1ddb546d30ba8c90c20a6a273ac43fa530bd8110592462dd003e7c39ac',
    salt: 'SNnAyQ5M/PGUTDY+R3XwLQ==',
    googleId: null,
    createdAt: 2021-02-10T19:36:20.152Z,
    updatedAt: 2021-02-10T19:36:20.152Z
  },
	*/

module.exports = {emailNotif}
