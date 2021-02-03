const router = require("express").Router({ mergeParams: true });
const { Op } = require("sequelize");
const Test = require("../db/test");
module.exports = router;

// /api/users/search?name=<NAME>
router.get("/search", async (req, res, next) => {
  try {
    console.log("HEY GURL");
    console.log(req.query);
    if (req.query.name) {
      console.log(req.query.name);
      let users = await Test.findAll({
        where: { name: { [Op.iLike]: `${req.query.name}%` } },
      });
      res.json(users);
    }
  } catch (err) {
    next(err);
  }
});

// /api/users/
router.post("/", async (req, res, next) => {
  try {
    
    console.log(req.body);
    const newUser = await Test.create(req.body);
    res.json(newUser);
  } catch (error) {
    next(error);
  }
});
