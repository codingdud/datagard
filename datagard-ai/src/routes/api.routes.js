const { Router } = require('express');
const dashboard = require('../controllers/dashboard.controller');
const records = require('../controllers/records.controller');
const reviews = require('../controllers/reviews.controller');
const decisions = require('../controllers/decisions.controller');
const governance = require('../controllers/governance.controller');

const router = Router();

router.get('/health', governance.health);
router.get('/dashboard', dashboard.getDashboard);

router.get('/reviews', reviews.list);
router.post('/reviews/:id/approve', reviews.approve);
router.post('/reviews/:id/reject', reviews.reject);
router.post('/reviews/:id/edit', reviews.edit);

router.get('/records/:id', records.getRecord);

router.get('/decisions', decisions.list);
router.get('/decisions/:id', decisions.getOne);

router.get('/governance/pillars', governance.getPillars);

module.exports = router;
