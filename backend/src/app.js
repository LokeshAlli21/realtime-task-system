import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'

dotenv.config()

const app = express()

app.use(cors({
    origin: process.env.FRONTEND_URL || '*',
    credentials: true
}))

app.use(express.json())

// health check route
app.get('/', (req, res) => {
    res.send('API is running..')
})

export default app