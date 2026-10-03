const express = require('express');
const router = express.Router();
const {
  getInventory,
  stockIn,
  stockOut,
  transferInventory,
  adjustInventory
} = require('../controllers/inventoryController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect);

router.get('/', getInventory);
router.post('/stock-in', stockIn);
router.post('/stock-out', stockOut);
router.post('/transfer', transferInventory);
router.post('/adjust', authorize('Admin', 'Warehouse Manager'), adjustInventory);

module.exports = router;
