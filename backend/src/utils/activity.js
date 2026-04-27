import { query } from "../config/db.js";

export const logActivity = async ({
    type,
    task_id,
    user_id,
    message,
}) => {
    try {
        const result = await query(
            `insert into activities (type, task_id, user_id, message)
            values ($1, $2, $3, $4)
            returning *`,
            [type, task_id, user_id, message]
        )
        
        return result.rows[0]
    } catch (error) {
        console.log('Activity log failed: ', error.message)
    }
}