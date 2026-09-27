const reviews = require('../services/review.service');
const { asyncHandler } = require('../utils/helpers');

exports.list = asyncHandler(async (req, res) => res.json(await reviews.listReviews(req.query)));
exports.approve = asyncHandler(async (req, res) => res.json(await reviews.approveReview(req.params.id, req.body)));
exports.reject = asyncHandler(async (req, res) => res.json(await reviews.rejectReview(req.params.id, req.body)));
exports.edit = asyncHandler(async (req, res) => res.json(await reviews.editReview(req.params.id, req.body)));
