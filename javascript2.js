// Archivo: routes/products.js
const express = require('express');
const router = express.Router();
const fs = require('fs').promises;

const PRODUCTS_FILE = './data/products.json';

// Leer productos desde el archivo
async function getProducts() {
  try {
    const data = await fs.readFile(PRODUCTS_FILE, 'utf-8');
    return JSON.parse(data);
  } catch {
    return [];
  }
}

// Guardar productos en el archivo
async function saveProducts(products) {
  await fs.writeFile(PRODUCTS_FILE, JSON.stringify(products, null, 2));
}

// Listar todos los productos
router.get('/', async (req, res) => {
  const { limit } = req.query;
  const products = await getProducts();

  if (limit) {
    return res.json(products.slice(0, parseInt(limit, 10)));
  }

  res.json(products);
});

// Obtener un producto por ID
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  const products = await getProducts();
  const product = products.find(item => item.id === id);

  if (!product) {
    return res.status(404).json({ error: 'Producto no encontrado' });
  }

  res.json(product);
});

// Crear un nuevo producto
router.post('/', async (req, res) => {
  const { title, description, code, price, stock, category, thumbnails, status } = req.body;

  if (!title || !description || !code || !price || !stock || !category) {
    return res.status(400).json({ error: 'Faltan campos obligatorios' });
  }

  const products = await getProducts();
  const newProduct = {
    id: `prod-${Date.now()}`, // Generación simple de ID
    title,
    description,
    code,
    price,
    stock,
    category,
    thumbnails: thumbnails || [],
    status: status !== undefined ? status : true,
  };

  products.push(newProduct);
  await saveProducts(products);

  res.status(201).json(newProduct);
});

module.exports = router;

