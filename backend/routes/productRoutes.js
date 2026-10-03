const express = require('express');
const router = express.Router();
const {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct
} = require('../controllers/productController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect);

router.get('/', getProducts);
router.get('/:id', getProductById);
router.post('/', authorize('Admin', 'Warehouse Manager'), createProduct);
router.put('/:id', authorize('Admin', 'Warehouse Manager'), updateProduct);
router.delete('/:id', authorize('Admin'), deleteProduct);

module.exports = router;
