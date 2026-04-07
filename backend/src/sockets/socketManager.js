const connectedUsers = new Map()

export const addUser = (userId, socket) => {
    if(!connectedUsers.has(userId)){
        connectedUsers.set(userId, new Set())
    }
    connectedUsers.get(userId).add(socket)
}

export const removeUser = (userId, socket) => {
    if(!connectedUsers.has(userId)) return
    const sockets = connectedUsers.get(userId)
    sockets.delete(socket)
    if(sockets.size === 0){
        connectedUsers.delete(userId)
    }
}

export const getUserSockets = (userId) => {
    return connectedUsers.get(userId) || new Set()
}

export const getAllSockets = () => {
    return Array.from(connectedUsers.values()).flatMap(set => Array.from(set))
}