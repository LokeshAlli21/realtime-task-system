import { query } from "../config/db.js"
import { 
    SOCKET_EVENTS,
    emitToAll,
} from "../sockets/events.js"
import { logActivity } from "../utils/activity.js"

export const createTaskService = async ({title, description, status, assigned_to, userId}) => {

        const result = await query(
            `insert into tasks (title, description, status, created_by, assigned_to)
            values ($1, $2, $3, $4, $5)
            returning *`,
            [title, description || null, status, userId, assigned_to || null]
        )

        let task = result.rows[0]

        const activity = await logActivity({
            type: 'task_created',
            task_id: task.id,
            user_id: userId,
            message: `Task "${task.title}" is created`
        })

        emitToAll(SOCKET_EVENTS.TASK_CREATED, {task})
        emitToAll(SOCKET_EVENTS.ACTIVITY_CREATED, {activity})

        return task
}

export const getAllTasksService = async ({ status, assigned_to }) => {
    let baseQuery = `select * from tasks where is_deleted = false`
    let values = []
    let index = 1

    if (status) {
        baseQuery += ` and status = $${index}`
        values.push(status)
        index++
    }

    if (assigned_to) {
        baseQuery += ` and assigned_to = $${index}`
        values.push(assigned_to)
        index++
    }

    baseQuery += ` order by created_at desc`

    const result = await query(baseQuery, values)

    return result.rows
}

export const updateTaskService = async ({
    id,
    title,
    description,
    status,
    assigned_to,
    userId
}) => {

    const existing = await query(
        `select * from tasks where id = $1 and is_deleted = false`,
        [id]
    )

    if (existing.rows.length === 0) {
        const error = new Error('Task not found!')
        error.statusCode = 404
        throw error
    }

    const task = existing.rows[0]

    if (
        task.created_by !== userId &&
        task.assigned_to !== userId
    ) {
        const error = new Error('Not authorized to update this task!')
        error.statusCode = 403
        throw error
    }

    const oldAssignedTo = task.assigned_to

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

    const updatedTask = result.rows[0]

    const activity = await logActivity({
        type: 'task_updated',
        task_id: updatedTask.id,
        user_id: userId,
        message: `Task "${updatedTask.title}" is updated`,
    })

    if (assigned_to && assigned_to !== oldAssignedTo) {
        await logActivity({
            type: 'task_assigned',
            task_id: updatedTask.id,
            user_id: userId,
            message: `Task assigned to user ${assigned_to}`
        })
    }

    // 5. socket events
    emitToAll(SOCKET_EVENTS.TASK_UPDATED, { task: updatedTask })
    emitToAll(SOCKET_EVENTS.ACTIVITY_CREATED, {activity})

    return updatedTask
}

export const deleteTaskService = async ({ id, userId }) => {

    const existing = await query(
        `select * from tasks where id = $1 and is_deleted = false`,
        [id]
    )

    if (existing.rows.length === 0) {
        const error = new Error('Task not found!')
        error.statusCode = 404
        throw error
    }

    const task = existing.rows[0]

    if (task.created_by !== userId) {
        const error = new Error('Not authorized to delete this task')
        error.statusCode = 403
        throw error
    }

    await query(
        `UPDATE tasks
         SET is_deleted = true,
             updated_at = NOW()
         WHERE id = $1`,
        [id]
    )

    const activity = await logActivity({
        type: 'task_deleted',
        task_id: id,
        user_id: userId,
        message: 'Task deleted'
    })

    emitToAll(SOCKET_EVENTS.TASK_DELETED, { taskId: id })
    emitToAll(SOCKET_EVENTS.ACTIVITY_CREATED, {activity})

    return {id}
}