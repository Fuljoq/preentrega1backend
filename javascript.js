// Archivo principal: server.js
const express = require('express');
const fs = require('fs').promises;
const { v4: uuidv4 } = require('uuid'); // Para generar IDs únicos
const app = express();

// Middlewares
app.use(express.json());

// Routers
const productsRouter = require('./routes/products');
app.use('/api/products', productsRouter);

// Puerto de escucha
const PORT = 8080;
app.listen(PORT, () => {
  console.log(`Servidor escuchando en el puerto ${PORT}`);
});

// Archivo de rutas: routes/products.js
const express = require('express');
const router = express.Router();
const fs = require('fs').promises;

// Ruta del archivo JSON de productos
const productsFile = './data/products.json';

// Función auxiliar para leer productos
async function readProducts() {
  try {
    const data = await fs.readFile(productsFile, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    return [];
  }
}

// Función auxiliar para escribir productos
async function writeProducts(products) {
  await fs.writeFile(productsFile, JSON.stringify(products, null, 2));
}

// Ruta GET /
router.get('/', async (req, res) => {
  const { limit } = req.query;
  const products = await readProducts();

  if (limit) {
    return res.json(products.slice(0, Number(limit)));
  }

  res.json(products);
});

// Ruta GET /:pid
router.get('/:pid', async (req, res) => {
  const { pid } = req.params;
  const products = await readProducts();

  const product = products.find(p => p.id === pid);

  if (!product) {
    return res.status(404).json({ error: 'Producto no encontrado' });
  }

  res.json(product);
});

// Ruta POST /
router.post('/', async (req, res) => {
  const { title, description, code, price, stock, category, thumbnails, status = true } = req.body;

  // Validación de campos obligatorios
  if (!title || !description || !code || !price || !stock || !category) {
    return res.status(400).json({ error: 'Todos los campos son obligatorios, excepto thumbnails' });
  }

  const products = await readProducts();

  // Generar nuevo producto
  const newProduct = {
    id: uuidv4(), // ID único
    title,
    description,
    code,
    price,
    stock,
    category,
    thumbnails: thumbnails || [],
    status
  };

  products.push(newProduct);
  await writeProducts(products);

  res.status(201).json(newProduct);
});

module.exports = router;

// Archivo de datos inicial: data/products.json
[]
