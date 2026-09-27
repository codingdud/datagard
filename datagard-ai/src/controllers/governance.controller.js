const fabric = require('../services/fabric.service');
const { asyncHandler } = require('../utils/helpers');

exports.getPillars = asyncHandler(async (_req, res) => res.json(await fabric.getPillars()));

// 200 when Fabric answers, 503 (via the error handler) when it does not.
exports.health = asyncHandler(async (_req, res) => res.json(await fabric.getHealth()));
