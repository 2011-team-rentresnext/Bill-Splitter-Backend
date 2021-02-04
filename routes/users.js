const router = require("express").Router({ mergeParams: true });
const { Op } = require("sequelize");
const User = require("../db/models/user");
module.exports = router;

// /api/users/search?name=<NAME>
router.get("/search", async (req, res, next) => {
  try {
    if (req.query.name) {
      console.log(req.query.name);
      let users = await User.findAll({
        where: {
          [Op.or]: [
            { firstName: { [Op.iLike]: `%${req.query.name}%` } },
            { lastName: { [Op.iLike]: `%${req.query.name}%` } },
          ],
        },
      });
      res.json(users);
    }
  } catch (err) {
    next(err);
  }
});
