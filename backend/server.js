import http from 'http'
import app from './src/app.js'
import { Server } from 'socket.io'
import env from './src/env/env.js'

const PORT = env.port|| 5000

const server = http.createServer(app)

const io = new Server(server, {
    cors: {
        origin: '*', // has to restrict later
        methods: ['get', 'post']
    }
})

io.on('connection', (socket) => {
    console.log('New client connected: ', socket.id)

    socket.on('disconnect', () => {
        console.log('Client disconnected: ', socket.id)
    })
})

server.listen(PORT, () => {
    console.log(`server running on port ${PORT}`)
    console.log('http://localhost:5000/')
})