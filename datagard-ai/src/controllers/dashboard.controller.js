const fabric = require('../services/fabric.service');
const { asyncHandler } = require('../utils/helpers');

exports.getDashboard = asyncHandler(async (_req, res) => res.json(await fabric.getDashboardMetrics()));
