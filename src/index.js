const port = process.env.PORT || 3000
const http = require('http');
const path = require('path');
const express = require("express");
const socketio = require('socket.io');
const app = express();
const Filter = require('bad-words');

//Refactoring the server to use socket.io
const server = http.createServer(app)
const io = socketio(server)

const {generatedMessage} = require('../src/utils/messages');

const {addUser,
    removeUser,
    getUser,
    getUsersInRoom} = require('../src/utils/users');

app.use(express.json());

//rendering index.html
const publicDirectoryPath = path.join(__dirname,'../public')
app.use(express.static(publicDirectoryPath))


//socke.emit, socket.io, socket.broadcast.emit
io.on('connection', (socket) => {
    console.log('New Connection')
 
    socket.on('join',(options, callback) => {
        const { user, error } = addUser({id: socket.id, ...options})
        if(error){
            return callback(error)
        }
        socket.join(user.room)
           //to emit it to particular connection
        socket.emit('message',generatedMessage('Welcome ' + user.userName +'!'))
        //to emit to everyone except the user
        socket.broadcast.to(user.room).emit('message', generatedMessage(user.userName+ ' has joined'))
        io.to(user.room).emit('roomData', {
            room: user.room,
            users: getUsersInRoom(user.room)
        })
        callback()
    })


    //location to be sent
    socket.on('location', (location, callback) => {
        const user = getUser(socket.id)
        io.to(user.room).emit('locationMessage', generatedMessage(user.userName ,'https://google.com/maps?q='+location.latitude+','+location.longitude))
        callback(generatedMessage('location has been shared'))
    })


    //send it to everyone(message to be send)
    socket.on('messageData', (messageData, callback) => {
        const user = getUser(socket.id)
        const filter = new Filter()

        if(filter.isProfane(messageData)){
            return callback('Profanity is not allowed')
        }
        io.to(user.room).emit('message', generatedMessage(user.userName , messageData))
        callback()
    })

  
    socket.on('disconnect', () => {
        const user = removeUser(socket.id)
        if(user){
            io.to(user.room).emit('message', generatedMessage(user.userName + ' has left!'))
            io.to(user.room).emit('roomData', {
                room: user.room,
                users: getUsersInRoom(user.room)
            })
        }
    })
})

//here app changed to server
server.listen(port, () => {
  console.log("server is up on port " + port);
});