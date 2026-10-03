const express = require('express');
const { protect, authorize } = require('../middleware/authMiddleware');

const { getMovements } = require('../controllers/movementController');
const {
  getDashboardAnalytics,
  getInventoryReport,
  getMovementReport,
  getRfidReport
} = require('../controllers/reportController');
const {
  getUsers,
  createUser,
  updateUser,
  deleteUser
} = require('../controllers/userController');
const { getActivityLogs } = require('../controllers/activityController');

// Movement Router
const movementRouter = express.Router();
movementRouter.use(protect);
movementRouter.get('/', getMovements);

// Report Router
const reportRouter = express.Router();
reportRouter.use(protect);
reportRouter.get('/dashboard', getDashboardAnalytics);
reportRouter.get('/inventory', getInventoryReport);
reportRouter.get('/movement', getMovementReport);
reportRouter.get('/rfid', getRfidReport);

// User Router
const userRouter = express.Router();
userRouter.use(protect);
userRouter.get('/', authorize('Admin'), getUsers);
userRouter.post('/', authorize('Admin'), createUser);
userRouter.put('/:id', authorize('Admin'), updateUser);
userRouter.delete('/:id', authorize('Admin'), deleteUser);

// Activity Router
const activityRouter = express.Router();
activityRouter.use(protect);
activityRouter.get('/', getActivityLogs);

module.exports = {
  movementRouter,
  reportRouter,
  userRouter,
  activityRouter
};
