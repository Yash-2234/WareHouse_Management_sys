const { ActivityLog } = require('../models/Warehouse');

// @desc    Get activity logs
// @route   GET /api/activity
// @access  Private
const getActivityLogs = async (req, res, next) => {
  try {
    const limit = Number(req.query.limit) || 100;
    const logs = await ActivityLog.find()
      .sort({ timestamp: -1 })
      .limit(limit);

    res.json({
      success: true,
      count: logs.length,
      logs
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getActivityLogs
};
