import express from 'express'
import cors from 'cors'
import {query} from './config/db.js'
import env from './env/env.js'

const app = express()

app.use(cors({
    origin: env.frontendUrl || '*',
    credentials: true
}))

app.use(express.json())

app.get('/test-db', async (req, res) => {
    try {
        const result = await query('SELECT NOW()')
        
        res.json({
            success: true,
            time: result.rows[0]
        })
    } catch (err) {
        console.error(err)
        res.status(500).json({error: 'DB connection failed'})
    }
})

// health check route
app.get('/', (req, res) => {
    res.send('API is running..')
})

export default app