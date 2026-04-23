import { io } from "socket.io-client";
import env from "../env.js";

class SocketService {
  socket = null;

  connect(token) {
    if (this.socket?.connected) {
      console.log("⚠️ Already connected");
      return this.socket;
    }

    this.socket = io(env.backendUrl, {
      auth: { token },
      transports: ["websocket"],
    });

    this.registerBaseEvents();

    return this.socket;
  }

  registerBaseEvents() {
    this.socket.on("connect", () => {
      console.log("🟢 Connected:", this.socket.id);
    });

    this.socket.on("disconnect", () => {
      console.log("🔴 Disconnected");
    });
  }

  onTaskCreated(callback) {
    this.socket.on("task_created", callback);
  }

  onTaskUpdated(callback) {
    this.socket.on("task_updated", callback);
  }

  onTaskDeleted(callback) {
    this.socket.on("task_deleted", callback);
  }

  onActivityCreated(callback) {
    this.socket.on("activity_created", callback);
  }

  // cleanup helpers
  offTaskEvents() {
    this.socket.off("task_created");
    this.socket.off("task_updated");
    this.socket.off("task_deleted");
  }

  offActivity() {
    this.socket.off("activity_created");
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }
}

const socketService = new SocketService()
export default socketService



// import {io} from 'socket.io-client'

// let socket = null

// export const connectSocket = (token) => {
    
//     if (socket && socket.connected) {
//         console.log("⚠️ Socket already connected");
//         return socket;
//     }

//     socket = io("http://localhost:5000", {
//         auth: {
//             token,
//         },
//         transports: ['websocket']
//     })

//     socket.on("connect", () => {
//         console.log('Connected', socket.id)
//     })

//     socket.on("disconnect", () => {
//         console.log('Disconnected', socket.id)
//     })
//     return socket
// }

// export const getSocket = () => socket