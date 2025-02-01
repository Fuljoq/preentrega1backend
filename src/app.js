const express = require('express');
const { Server } = require('socket.io');
const http = require('http');
const path = require('path');
const exphbs = require('express-handlebars');
const productsRouter = require('./routes/products');
const cartsRouter = require('./routes/carts');
const realtimeProductsRouter = require('./routes/realtimeproducts');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.engine('hbs', exphbs({ extname: 'hbs', defaultLayout: 'main', layoutsDir: path.join(__dirname, 'views', 'layout') }));
app.set('view engine', 'hbs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

app.use('/products', productsRouter(io));
app.use('/carts', cartsRouter(io));
app.use('/realtimeproducts', realtimeProductsRouter(io));

io.on('connection', (socket) => {
    console.log('Nuevo cliente conectado');

    socket.emit('mensaje', 'Conexión establecida con el servidor');

    socket.on('actualizarProductos', (productos) => {
        console.log('Lista de productos recibida:', productos);
        io.emit('productosActualizados', productos);
    });

    socket.on('disconnect', () => {
        console.log('Cliente desconectado');
    });
});

const PORT = 8080;
server.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});