import dotenv from 'dotenv'
dotenv.config()

const config = {
    port: process.env.PORT,
    frontendUrl: process.env.FRONTEND_ORIGIN_URL,
    databaseUrl: process.env.DATABASE_URL,
    JWTSecret: process.env.JWT_SECRET,
    JWTExpiresIn: process.env.JWT_EXPIRES_IN,
}
console.log(config)

export default config