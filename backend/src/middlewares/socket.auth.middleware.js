import { verifyToken } from "../utils/jwt.js"

export const socketAuthMiddleware = (socket, next) => {
    try {
        const token = socket.handshake.auth?.token
        if(!token){
            return next(new Error('Authentication error: No token is provided!'))
        }
        const decoded = verifyToken(token)
        socket.user = decoded
        socket.userId = decoded.id
        next()
    } catch (error) {
        console.error(error)
        return next(new Error('Authentication error: Invalid token!'))
    }
}