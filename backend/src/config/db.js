import pkg from 'pg'
import env from '../env/env.js'

const { Pool } = pkg

const pool = new Pool({
    connectionString: env.databaseUrl,
    ssl: {
        rejectUnauthorized: false,
    },
})

export const query = (text, params) => pool.query(text, params)