const express = require('express');
const { Server } = require('socket.io');
const http = require('http');
require('./routes/carts');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

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
