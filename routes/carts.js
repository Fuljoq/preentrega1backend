const express = require('express');
const fs = require('fs').promises;
const router = express.Router();

const CARTS_FILE = './data/carts.json';
const PRODUCTS_FILE = './data/products.json';

async function getCarts() {
  try {
    const data = await fs.readFile(CARTS_FILE, 'utf-8');
    return JSON.parse(data);
  } catch {
    return [];
  }
}

async function saveCarts(carts) {
  await fs.writeFile(CARTS_FILE, JSON.stringify(carts, null, 2));
}

async function getProducts() {
  try {
    const data = await fs.readFile(PRODUCTS_FILE, 'utf-8');
    return JSON.parse(data);
  } catch {
    return [];
  }
}

router.get('/:cartId', async (req, res) => {
  const { cartId } = req.params;
  const carts = await getCarts();
  const cart = carts.find(c => c.id === cartId);

  if (!cart) {
    return res.status(404).json({ error: 'Carrito no encontrado' });
  }

  res.json(cart.products);
});

router.post('/:cartId/product/:productId', async (req, res) => {
  const { cartId, productId } = req.params;
  const carts = await getCarts();
  const products = await getProducts();

  let cart = carts.find(c => c.id === cartId);
  if (!cart) {
    cart = { id: cartId, products: [] };
    carts.push(cart);
  }

  const product = products.find(p => p.id === productId);
  if (!product) {
    return res.status(404).json({ error: 'Producto no encontrado' });
  }

  const productInCart = cart.products.find(p => p.id === productId);
  if (productInCart) {
    productInCart.quantity++;
  } else {
    cart.products.push({ id: productId, quantity: 1 });
  }

  await saveCarts(carts);
  res.status(201).json(cart);
});

module.exports = router;
