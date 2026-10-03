const express = require('express');
const router = express.Router();
const {
  getTags,
  getTagById,
  registerTag,
  updateTag,
  deleteTag,
  scanRFID,
  getScans
} = require('../controllers/rfidController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect);

router.get('/', getTags);
router.get('/scans', getScans);
router.get('/:id', getTagById);
router.post('/scan', scanRFID);
router.post('/match', scanRFID);
router.post('/', authorize('Admin', 'Warehouse Manager'), registerTag);
router.put('/:id', authorize('Admin', 'Warehouse Manager'), updateTag);
router.delete('/:id', authorize('Admin'), deleteTag);

module.exports = router;
