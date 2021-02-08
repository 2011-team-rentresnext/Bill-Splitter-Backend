const router = require('express').Router({ mergeParams: true });
module.exports = router;

router.use('/users', require('./users'));
router.use('/auth', require('./auth'));
router.use('/receipts', require('./receipts'));
