import {getIO} from './index.js'
import { getUserSockets } from './socketManager.js'

export const emitToAll = (event, data) => {
    const io = getIO()
    io.emit(event, data)
}

export const emitToUser = (userId, event, data) => {
    const sockets = getUserSockets(userId)
    sockets.forEach(socket => socket.emit(event, data))
}

export const SOCKET_EVENTS = {
    TASK_CREATED: 'task_created',
    TASK_UPDATED: 'task_updated',
    TASK_DELETED: 'task_deleted',
    ACTIVITY_CREATED: 'activity_created',
}