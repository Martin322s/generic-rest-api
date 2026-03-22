const router = require('express').Router();
const authController = require('./controllers/authController');
const resourceController = require('./controllers/resourceController');
const docsController = require('./controllers/docsController');

router.use('/users', authController);
router.use('/api', resourceController);
router.use('/docs', docsController);

module.exports = router;