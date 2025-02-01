const express = require('express');
const fs = require('fs').promises;
const router = express.Router();

const PRODUCTS_FILE = './data/products.json';

async function getProducts() {
  try {
    const data = await fs.readFile(PRODUCTS_FILE, 'utf-8');
    return JSON.parse(data);
  } catch {
    return [];
  }
}

async function saveProducts(products) {
  await fs.writeFile(PRODUCTS_FILE, JSON.stringify(products, null, 2));
}

module.exports = (io) => {
  router.get('/', async (req, res) => {
    const products = await getProducts();
    res.render('products', { products });
  });

  router.post('/', async (req, res) => {
    const { title, description, code, price, stock, category, thumbnails } = req.body;

    if (!title || !description || !code || !price || !stock || !category) {
      return res.status(400).json({ error: 'Faltan campos obligatorios' });
    }

    const products = await getProducts();
    const newProduct = {
      id: `prod-${Date.now()}`,
      title,
      description,
      code,
      price,
      stock,
      category,
      thumbnails: thumbnails || [],
      status: true,
    };

    products.push(newProduct);
    await saveProducts(products);

    io.emit('productAdded', newProduct);
    res.status(201).json(newProduct);
  });

  router.delete('/:id', async (req, res) => {
    const { id } = req.params;
    let products = await getProducts();
    const productIndex = products.findIndex(p => p.id === id);

    if (productIndex === -1) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }

    const deletedProduct = products.splice(productIndex, 1)[0];
    await saveProducts(products);

    io.emit('productDeleted', deletedProduct);
    res.status(200).json(deletedProduct);
  });

  return router;
};