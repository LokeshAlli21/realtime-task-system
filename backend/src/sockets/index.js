import { Server } from 'socket.io'
import { registerHandler } from './handlers.js';
import { socketAuthMiddleware } from '../middlewares/socket.auth.middleware.js'

let io;

export const initSocket = (server) => {
    io = new Server(server, {
        cors: {
            origin: '*', // later FRONTEND_ORIGIN_URL
            credentials: true,
        },
    })

    io.use(socketAuthMiddleware)

    io.on('connection', (socket) => {
        registerHandler(socket, io)
    })

    console.log('Socket.IO initialized')
}

export const getIO = () => {
    if(!io){
        throw new Error('Socket not initialized!')
    }
    return io
}