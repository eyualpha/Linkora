const getPagination = (req, defaultLimit = 20, maxLimit = 100) => {
  const page = Math.max(1, parseInt(req.query.page, 10) || 1);
  const limit = Math.min(
    maxLimit,
    Math.max(1, parseInt(req.query.limit, 10) || defaultLimit)
  );
  const skip = (page - 1) * limit;
  return { page, limit, skip };
};

const paginatedResponse = (data, total, page, limit) => ({
  data,
  pagination: {
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit) || 1,
  },
});

module.exports = { getPagination, paginatedResponse };
