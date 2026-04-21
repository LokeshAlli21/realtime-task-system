import {io} from 'socket.io-client'

let socket = null

export const connectSocket = (token) => {
    
    if (socket && socket.connected) {
        console.log("⚠️ Socket already connected");
        return socket;
    }

    socket = io("http://localhost:5000", {
        auth: {
            token,
        },
        transports: ['websocket']
    })

    socket.on("connect", () => {
        console.log('Connected', socket.id)
    })

    socket.on("disconnect", () => {
        console.log('Disconnected', socket.id)
    })
    return socket
}

export const getSocket = () => socket