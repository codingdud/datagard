const decisions = require('../services/decision.service');
const { asyncHandler } = require('../utils/helpers');

exports.list = asyncHandler(async (req, res) => res.json(await decisions.listDecisions(req.query)));
exports.getOne = asyncHandler(async (req, res) => res.json(await decisions.getDecision(req.params.id)));
