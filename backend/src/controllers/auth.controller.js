import { query } from "../config/db.js"
import { comparePassword, hashPassword } from '../utils//hash.js'
import { generateToken } from '../utils/jwt.js'

export const signup = async (req, res, next) => {
    try {
        const { name , email, password } = req.body

        if(!name || !email || !password){
            return res.status(400).json({
                success: false,
                message: 'All fields are required!',
            })
        }

        const existingUser = await query(
            'select id from users where email = $1',
            [email]
        )

        if(existingUser.rows.length > 0){
            return res.status(409).json({
                success: false,
                message: 'User already exists!'
            })
        }

        const password_hash = await hashPassword(password)

        const result = await query(
            `insert into users (name, email, password_hash)
            values ($1, $2, $3)
            returning id, name, email`,
            [name, email, password_hash]
        )

        const user = result.rows[0]

        const token = generateToken({
            id: user.id,
            email: user.email,
        })

        return res.status(201).json({
            success: true,
            massage: 'User registered successfully',
            token, 
            user,
        })

    } catch (err) {
        next(err)
    }
}

export const login = async (req, res, next) => {
    try {
        const {email, password} = req.body

        if(!email || !password){
            return res.status(400).json({
                success: false,
                message: 'Email and password are required!'
            })
        }

        const result = await query(
            'select * from users where email = $1 and is_deleted = false',
            [email]
        )

        if(result.rows.length === 0){
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials!'
            })
        }

        const user = result.rows[0]

        const isMatch = await comparePassword(
            password,
            user.password_hash
        )

        if(!isMatch){
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials!'
            })
        }

        const token = generateToken({
            id: user.id,
            emaill: user.email,
        })

        return res.status(200).json({
            success: true, 
            message: 'Login successful.',
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
            },
        })
    } catch (error) {
        next(error)
    }
}