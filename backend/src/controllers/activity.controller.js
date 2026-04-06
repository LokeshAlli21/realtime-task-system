import { query } from "../config/db.js";

export const getActivities = async (req, res, next) => {
    try {
        const userId = req.user.id
        const {type, task_id} = req.query

        let baseQuery = `
            select a.*
            from activities a
            join tasks t on a.task_id = t.id
            where (t.created_by = $1 or t.assigned_to = $1)
                and t.is_deleted = false
        `
        let values = [userId]
        let index = 2

        // filter by type
        if(type){
            baseQuery += ` and a.type = $${index}`
            values.push(type)
            index++
        }

        // filter by task_id
        if(task_id){
            baseQuery += ` and a.task_id = $${index}`
            values.push(task_id)
            index++
        }

        baseQuery += ` order by a.created_at desc`

        const result = await query(baseQuery, values)

        return res.json({
            success: true,
            count: result.rows.length,
            activities: result.rows,
        })
    } catch (error) {
        next(error)
    }
}