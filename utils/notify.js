const nodemailer = require('nodemailer')
const {User} = require('../db/models')

async function sendEmail(user, text, html) {
  let transporter = nodemailer.createTransport({
    host: 'mail.ee',
    port: 587,
    auth: {
      user: 'split@mail.ee',
      pass: process.env.EMAIL_PASS,
    },
    tls: {
      rejectUnauthorized: false,
    },
  })

  const mailOptions = {
    from: '"SLICED APP" <split@mail.ee>',
    to: user.dataValues.email,
    subject: 'Payment Requested',
    text,
    html,
  }

  await transporter.sendMail(mailOptions, (err, info) => {
    if (err) {
      return console.log(err)
    }
    console.log('Email preview:', info)
  })
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

const createEmail = (user, items) => {
  const totalPrice = getTotal(items)

  const text = `Hello ${user.dataValues.firstName} ${user.dataValues.lastName},\n\nYour payment of ${totalPrice} is requested to cover your recent meal.\n\nPlease use the Sliced App to complete the payment at your earliest convenience.\nThank you!`

  const html = `<div style="font-size: 12px; font-family: Arial;">
	<p>Hello ${user.dataValues.firstName} ${user.dataValues.lastName},<p>
	<br>
	<p>Your payment of ${totalPrice} is requested to cover your recent meal.</p>
	<p>Please use the Sliced App to complete the payment at your earliest convenience.</p>
	<br>
	<p>Thank you!</p>
	</div>`

  return [text, html]
}

const notify = async (users) => {
  for (let id in users) {
    const items = users[id]
    const user = await User.findOne({
      where: {id},
    })
    const [text, html] = createEmail(user, items)
    await sendEmail(user, text, html)
  }
}

module.exports = notify
