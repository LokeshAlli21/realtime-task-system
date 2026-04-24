import express from 'express'
import cors from 'cors'
import {query} from './config/db.js'
import env from './env/env.js'
import authRouter from './routes/auth.routes.js'
import loggerMiddleware from './middlewares/logger.middleware.js'
import userRouter from './routes/user.routes.js'
import taskRouter from './routes/task.routes.js'
import activityRoutes from './routes/activity.routes.js'

const app = express()

// app.use(cors({
//     origin: env.frontendUrl || '*',
//     credentials: true
// }))
app.use(cors({
  origin: env.frontendUrl,
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));
app.options("*", cors());

app.use(express.json())

app.use(loggerMiddleware)

app.get('/api/test-db', async (req, res) => {
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

app.use('/api/auth/', authRouter)
app.use('/api/users', userRouter)
app.use('/api/tasks', taskRouter)
app.use('/api/activities', activityRoutes)

export default app