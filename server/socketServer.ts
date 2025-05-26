import {Server as SocketIOServer} from "socket.io" 
import http from "http"


export const initSocketServer=(server:http.Server)=>{
    console.log("cee")
    const io=new SocketIOServer(server)
    io.on("Connection",(socket)=>{
        console.log("A user connected")

        //listen for 'notification' event from the frontend
        socket.on("notification",(data:any)=>{
            //broadcast the notification data to all connected clients (admin dashboard)
            io.emit("newNotification",data)
        })
        socket.on("disconnect",()=>{
            console.log("A user disconnected")
        })
    })
}