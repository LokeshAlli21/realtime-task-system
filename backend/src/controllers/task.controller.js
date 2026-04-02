import { query } from '../config/db.js'

const allowedStatus = ['todo', 'in_progress', 'done']

export const createTask = async (req, res, next) => {
    try {
        const { title, description, status, assigned_to }  = req.body
        if(!title){
            return res.status(400).json({
                success: false,
                message: 'Title is required!'
            })
        }
        const taskStatus = status || 'todo'

        if(!allowedStatus.includes(taskStatus)){
            return res.status(400).json({
                success: false,
                message: 'Invalid status value!'
            })
        }
        const created_by = req.user.id

        const result = await query(
            `insert into tasks (title, description, status, created_by, assigned_to)
            values ($1, $2, $3, $4, $5)
            returning *`,
            [title, description || null, status, created_by, assigned_to || null]
        )

        return res.status(201).json({
            success: true,
            message: 'Task is created.',
            task: result.rows[0],
        })

    } catch (error) {
        next(error)
    }
}

export const getAllTasks = async (req, res, next) => {
    try {
        const { status, assigned_to } = req.query
        let baseQuery = `select * from tasks where is_deleted = false `
        let values = []
        let index = 1

        if(status){
            if(!allowedStatus.includes(status)){
                return res.status(400).json({
                    success: false,
                    message: 'Invalid status filter!'
                })
            }

            baseQuery += ` and status = $${index}`
            values.push(status)
            index++
        }

        if(assigned_to){
            baseQuery += ` and assigned_to = $${index}`
            values.push(assigned_to)
            index++
        }

        // latest first
        baseQuery += ` order by created_at desc`

        const result = await query(baseQuery, values)

        return res.status(200).json({
            success: true,
            count: result.rows.length,
            tasks: result.rows
        })

    } catch (error) {
        next(error)
    }
}

export const updateTask = async (req, res, next) => {
    try {
        const { id } = req.params
        const { title, description, status, assigned_to } = req.body

        const existing = await query(
            `select * from tasks where id = $1 and is_deleted = false`,
            [id]
        )

        if(existing.rows.length === 0){
            return res.status(404).json({
                success: false,
                message: 'Task not found!'
            })
        }

        const task = existing.rows[0]

        if(
            task.created_by !== req.user.id &&
            task.assigned_to !== req.user.id
        ){
            return res.status(403).json({
                success: false,
                message: 'Not authorized to updated this task!'
            })
        }

        if(status && !allowedStatus.includes(status)){
            return res.status(400).json({
                success: false,
                message: 'Invalid status'
            })
        }

        const result = await query(
            `UPDATE tasks SET
                title = COALESCE($1, title),
                description = COALESCE($2, description),
                status = COALESCE($3, status),
                assigned_to = COALESCE($4, assigned_to),
                updated_at = NOW()
             WHERE id = $5
             RETURNING *`,
             [title, description, status, assigned_to, id]
        )

        return res.status(200).json({
            success: true,
            message: 'Task Updated',
            taks: result.rows[0]
        })

    } catch (error) {
        next(error)
    }
}

export const deleteTask = async (req, res, next) => {
    try {
        const {id} = req.params

        const existing = await query(
            `select * from tasks where id = $1 and is_deleted = false`,
            [id]
        )

        if(existing.rows.length === 0){
            return res.status(404).json({
                success: false,
                message: 'Task not found!'
            })
        }

        const task = existing.rows[0]

        // only creator can delete
        if(task.created_by !== req.user.id){
            return res.status(403).json({
                success: false,
                message: 'Not authorized to deleted this task'
            })
        }

        // soft delete
        await query(
            `update tasks
            set is_deleted = true,
                updated_at = NOW()
            where id = $1`,
            [id]
        )

        return res.json({
            success: true,
            message: 'Task deleted successfully.'
        })

    } catch (error) {
        next(error)
    }
}