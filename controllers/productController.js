const pool = require('../db');
const responseHandler = require('../utils/responseHandler');

const createProduct = async (req, res) => {
  const { name, description, price } = req.body;
  const userId = req.user.userId;

  if (!name || typeof name !== 'string' || name.trim().length === 0) {
    return responseHandler(res, false, 'Name is required and must be a non-empty string.', null, 400);
  }

  if (!price || isNaN(price) || parseFloat(price) <= 0) {
    return responseHandler(res, false, 'Price must be a positive numeric value.', null, 400);
  }

  if (!userId || isNaN(userId)) {
    return responseHandler(res, false, 'User ID must be a valid numeric value.', null, 400);
  }

  try {
    const result = await pool.query(
      'INSERT INTO products (name, description, price, user_id) VALUES ($1, $2, $3, $4) RETURNING *',
      [name, description, parseFloat(price), parseInt(userId)]
    );
    return responseHandler(res, true, 'Product created successfully.', result.rows[0], 201);
  } catch (err) {
    return responseHandler(res, false, 'Error creating product.', { error: err.message }, 500);
  }
};

const getProducts = async (req, res) => {
  const { page = 1, limit = 10, sortBy = 'price', order = 'asc' } = req.query;

  try {
    const result = await pool.query(
      `SELECT * FROM products ORDER BY ${sortBy} ${order} LIMIT $1 OFFSET $2`,
      [limit, (page - 1) * limit]
    );
    if (result.rows.length === 0) {
      return responseHandler(res, false, 'No products found.', null, 404);
    }
    return responseHandler(res, true, 'Products retrieved successfully.', result.rows, 200);
  } catch (err) {
    return responseHandler(res, false, 'Error fetching products.', { error: err.message }, 500);
  }
};

const updateProduct = async (req, res) => {
  const { id } = req.params;
  const { name, description, price } = req.body;
  const userId = req.user.userId;

  if (!name || typeof name !== 'string' || name.trim().length === 0) {
    return responseHandler(res, false, 'Name is required and must be a non-empty string.', null, 400);
  }

  if (!price || isNaN(price) || parseFloat(price) <= 0) {
    return responseHandler(res, false, 'Price must be a positive numeric value.', null, 400);
  }

  if (!userId || isNaN(userId)) {
    return responseHandler(res, false, 'User ID must be a valid numeric value.', null, 400);
  }

  try {
    const result = await pool.query(
      'UPDATE products SET name = $1, description = $2, price = $3 WHERE id = $4 AND user_id = $5 RETURNING *',
      [name, description, parseFloat(price), id, parseInt(userId)]
    );

    if (result.rowCount === 0) {
      return responseHandler(res, false, 'Product not found or unauthorized.', null, 404);
    }
    return responseHandler(res, true, 'Product updated successfully.', result.rows[0], 200);
  } catch (err) {
    return responseHandler(res, false, 'Error updating product.', { error: err.message }, 500);
  }
};

const deleteProduct = async (req, res) => {
  const { id } = req.params;
  const userId = req.user.userId;

  if (!id || isNaN(id)) {
    return responseHandler(res, false, 'Product ID must be a valid numeric value.', null, 400);

  }

  if (!userId || isNaN(userId)) {
    return responseHandler(res, false, 'User ID must be a valid numeric value.', null, 400);
  }

  try {
    const result = await pool.query('DELETE FROM products WHERE id = $1 AND user_id = $2 RETURNING *', [id, userId]);

    if (result.rowCount === 0) {
      return responseHandler(res, false, 'Product not found or unauthorized.', null, 404);
    }
    return responseHandler(res, true, 'Product deleted successfully.', null, 200);
  } catch (err) {
    return responseHandler(res, false, 'Error deleting product.', { error: err.message }, 500);
  }
};

const getProductDetails = async (req, res) => {
  const productId = req.params.id;

  if (!productId || isNaN(productId)) {
    return responseHandler(res, false, 'Product ID must be a valid numeric value.', null, 400);
  }

  try {
    const result = await pool.query('SELECT * FROM products WHERE id = $1', [productId]);
    const product = result.rows[0];

    
    if (!product) {
      return responseHandler(res, false, 'Product not found.', null, 404);
    }
    return responseHandler(res, true, 'Product details retrieved successfully.', product, 200);
  } catch (err) {
    return responseHandler(res, false, 'Error retrieving product details.', { error: err.message }, 500);
  }
};

module.exports = { createProduct, getProducts, updateProduct, deleteProduct, getProductDetails };
