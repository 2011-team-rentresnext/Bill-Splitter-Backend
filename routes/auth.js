const router = require('express').Router()
const {User, ItemizedTransaction} = require('../db/models')
module.exports = router

router.post('/login', async (req, res, next) => {
  try {
    console.log('login route')
    const user = await User.findOne({
      where: {email: req.body.email.toLowerCase()},
    })
    if (!user) {
      console.log('No such user found:', req.body.email)
      res.status(401).send('Wrong username and/or password')
    } else if (!user.correctPassword(req.body.password)) {
      console.log('Incorrect password for user:', req.body.email)
      res.status(401).send('Wrong username and/or password')
    } else {
      req.login(user, async (err) => {
        if (err) next(err)
        else {
          let debts = await ItemizedTransaction.findAll({
            where: {
              debtorId: user.id,
              paid: false,
            },
          })
          user.dataValues.hasOutstandingDebts = !!debts.length
          res.json(user)
        }
      })
    }
  } catch (err) {
    throw err
  }
})

router.post('/signup', async (req, res, next) => {
  try {
    req.body.email = req.body.email.toLowerCase()
    const user = await User.create(req.body)
    req.login(user, (err) => (err ? next(err) : res.json(user)))
  } catch (err) {
    if (err.name === 'SequelizeUniqueConstraintError') {
      res.status(401).send('User already exists')
    } else {
      next(err)
    }
  }
})

router.post('/logout', (req, res) => {
  req.logout()
  req.session.destroy()
  res.redirect('/')
})

router.get('/me', (req, res) => {
  res.json(req.user)
})
