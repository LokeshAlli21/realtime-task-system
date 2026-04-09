import { 
    createTaskService,
    getAllTasksService,
    updateTaskService,
    deleteTaskService,
} from '../services/task.service.js'

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

        const task = await createTaskService({
            title,
            description,
            status: taskStatus,
            assigned_to,
            userId: req.user.id,
        })

        return res.status(201).json({
            success: true,
            message: 'Task is created.',
            task,
        })

    } catch (error) {
        next(error)
    }
}

export const getAllTasks = async (req, res, next) => {
    try {
        const { status, assigned_to } = req.query

        if (status && !allowedStatus.includes(status)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid status filter!'
            })
        }

        const tasks = await getAllTasksService({
            status,
            assigned_to
        })

        return res.status(200).json({
            success: true,
            count: tasks.length,
            tasks
        })

    } catch (error) {
        next(error)
    }
}

export const updateTask = async (req, res, next) => {
    try {
        const { id } = req.params
        const { title, description, status, assigned_to } = req.body

        if (status && !allowedStatus.includes(status)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid status'
            })
        }

        const updatedTask = await updateTaskService({
            id,
            title,
            description,
            status,
            assigned_to,
            userId: req.user.id
        })

        return res.status(200).json({
            success: true,
            message: 'Task Updated',
            task: updatedTask,
        })

    } catch (error) {
        next(error)
    }
}

export const deleteTask = async (req, res, next) => {
    try {
        const { id } = req.params

        await deleteTaskService({
            id,
            userId: req.user.id
        })

        return res.json({
            success: true,
            message: 'Task deleted successfully.'
        })

    } catch (error) {
        next(error)
    }
}