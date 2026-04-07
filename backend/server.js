import http from 'http'
import app from './src/app.js'
import env from './src/env/env.js'
import { initSocket } from './src/sockets/index.js'

const PORT = env.port|| 5000

const server = http.createServer(app)

initSocket(server)

server.listen(PORT, () => {
    console.log(`server running on port ${PORT}`)
    console.log('http://localhost:5000/')
})