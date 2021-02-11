const router = require('express').Router({mergeParams: true})
const {Op} = require('sequelize')
const User = require('../db/models/user')
module.exports = router

// /api/users/search?name=<NAME>
/*
Takes in a name (search term) and searches for users in the DB that match that name, returns an array of users matching the search term
*/
router.get('/search', async (req, res, next) => {
  try {
    if (req.query.name) {
      let users = await User.findAll({
        where: {
          [Op.or]: [
            {firstName: {[Op.iLike]: `%${req.query.name}%`}},
            {lastName: {[Op.iLike]: `%${req.query.name}%`}},
          ],
        },
      })
      res.json(users)
    }
  } catch (err) {
    next(err)
  }
})
