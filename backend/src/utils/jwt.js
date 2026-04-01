import jwt from 'jsonwebtoken'
import env from '../env/env.js'

export const generateToken = (payload) => {
    return jwt.sign(
        payload,
        env.JWTSecret,
        {
            expiresIn: env.JWTExpiresIn || '1d',
        }
    )
}

export const verifyToken = (token) => {
    return jwt.verify(token, env.JWTSecret)
}