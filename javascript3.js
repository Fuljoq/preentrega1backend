// Archivo: routes/carts.js
const express = require('express');
const router = express.Router();
const fs = require('fs').promises;

const CARTS_FILE = './data/carts.json';
const PRODUCTS_FILE = './data/products.json';

// Leer carritos desde el archivo
async function getCarts() {
  try {
    const data = await fs.readFile(CARTS_FILE, 'utf-8');
    return JSON.parse(data);
  } catch {
    return [];
  }
}

// Guardar carritos en el archivo
async function saveCarts(carts) {
  await fs.writeFile(CARTS_FILE, JSON.stringify(carts, null, 2));
}

// Leer productos desde el archivo
async function getProducts() {
  try {
    const data = await fs.readFile(PRODUCTS_FILE, 'utf-8');
    return JSON.parse(data);
  } catch {
    return [];
  }
}

// Obtener los productos de un carrito por ID
router.get('/:summonerId', async (req, res) => {
  const { summonerId } = req.params;
  const carts = await getCarts();
  const cart = carts.find(c => c.summonerId === summonerId);

  if (!cart) {
    return res.status(404).json({ error: 'Carrito no encontrado' });
  }

  res.json(cart.products);
});

// Agregar un producto al carrito
router.post('/:summonerId/product/:productId', async (req, res) => {
  const { summonerId, productId } = req.params;

  const carts = await getCarts();
  const products = await getProducts();

  // Validar que el carrito exista
  let cart = carts.find(c => c.summonerId === summonerId);
  if (!cart) {
    cart = { summonerId, products: [] };
    carts.push(cart);
  }

  // Validar que el producto exista
  const product = products.find(p => p.id === productId);
  if (!product) {
    return res.status(404).json({ error: 'Producto no encontrado' });
  }

  // Buscar el producto en el carrito
  const productInCart = cart.products.find(p => p.product === productId);

  if (productInCart) {
    productInCart.quantity += 1;
  } else {
    cart.products.push({ product: productId, quantity: 1 });
  }

  await saveCarts(carts);
  res.status(201).json(cart);
});

module.exports = router;

