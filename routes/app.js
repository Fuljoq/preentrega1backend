const express = require('express');
const path = require('path');
const http = require('http');
const { Server } = require('socket.io');
const exphbs = require('express-handlebars');
const productsRouter = require('./routes/products');
const cartsRouter = require('./routes/carts');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.engine('handlebars', exphbs());
app.set('view engine', 'handlebars');
app.set('views', path.join(__dirname, 'views'));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

app.use('/api/products', productsRouter(io));
app.use('/api/carts', cartsRouter);

app.get('/', (req, res) => res.render('home'));
app.get('/realtimeproducts', (req, res) => res.render('realTimeProducts'));

const PORT = 8080;
server.listen(PORT, () => console.log(`Servidor escuchando en el puerto ${PORT}`));

