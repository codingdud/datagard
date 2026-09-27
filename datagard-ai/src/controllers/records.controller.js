const fabric = require('../services/fabric.service');
const { asyncHandler } = require('../utils/helpers');

exports.getRecord = asyncHandler(async (req, res) => res.json(await fabric.getRecord(req.params.id)));
