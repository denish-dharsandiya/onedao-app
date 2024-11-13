const express = require('express');
const { createProduct, getProducts, updateProduct, deleteProduct, getProductDetails } = require('../controllers/productController');
const authenticate = require('../middlewares/authMiddleware');

const router = express.Router();

router.post('/', authenticate, createProduct);
router.get('/', authenticate,getProducts);
router.put('/:id', authenticate, updateProduct);
router.delete('/:id', authenticate, deleteProduct);
router.get('/:id', authenticate, getProductDetails);

module.exports = router;
