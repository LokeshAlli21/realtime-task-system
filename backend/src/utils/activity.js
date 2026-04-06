import { query } from "../config/db.js";

export const logActivity = async ({
    type,
    task_id,
    user_id,
    message,
}) => {
    try {
        await query(
            `insert into activities (type, task_id, user_id, message)
            values ($1, $2, $3, $4)`,
            [type, task_id, user_id, message]
        )
    } catch (error) {
        console.log('Activity log failed: ', error.message)
    }
}