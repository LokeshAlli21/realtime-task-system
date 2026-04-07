import {
    addUser,
    removeUser,
} from './socketManager.js'

export const registerHandler = (socket, io) => {

    console.log('New client connect: ', socket.id)

    addUser(socket.userId, socket)

    console.log(`User ${socket.userId} registered with socket ${socket.id}`)

    socket.on('disconnect', () => {
        console.log('Client disconnect: ', socket.id)
        if(socket.userId){
            removeUser(socket.userId, socket)
            console.log(`User ${socket.userId} removed`)
        }
    })
}