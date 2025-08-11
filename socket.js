const { Server } = require("socket.io");
let io;

exports.socketConnection = (server) => {
    //io = require('socket.io')(server);

    io = new Server(server, {
        cors: {
          origin: process.env.ENVIRONMENT == 'development' ? "http://localhost:4200":["https://sportzbattle.azurewebsites.net","https://sptzba.com"], // Allow only requests from this origin
          methods: ["GET", "POST"],        // Allowable methods
          allowedHeaders: ["my-custom-header"], // Custom headers you might use
          credentials: true                 // Allow cookies and other credentials
        }
      });

//module.exports = function(io) {

    io.on('connection', (socket) => {

        console.log('new connection!');
        //var platform = socket.handshake['query']['platform'];
        var room = socket.handshake['query']['roomid'];
        //var action = socket.handshake['query']['action'];
        
        if (room) {
            socket.join(room);
        }

        socket.on('ping', function (data) {
            //console.log('joined room', data.chatid);
            console.log('ping*');
        });

        /*
        socket.on('getRoomConnections', function (data) {
            //console.log('getRoomConnections', data.chatid);
            io.emit('roomConnections', {
                chatid: data.chatid,
                connections: io.sockets.adapter.rooms[data.chatid]
            });
        });
        */



        
        // Join room
        socket.on('joinRoom', (roomName) => {
            console.log('<------ Joined room -------->', roomName);
            socket.join(roomName);
            console.log(`${socket.id} joined room ${roomName}`);
        });

        /*
        socket.on('joinPlatform', function (data) {
            //console.log('joined platform', data.platform);
            socket.join('P' + data.platform);
            //io.to('P'+ data.platform).emit('platform-message', data.platform);
        });
        
        socket.on('disconnect', function () {
            //socket.leave(room);
            //socket.leave('P'+platform);
            //console.log('user disconnected', room, platform);
        });

        socket.on('message', function (message) {
            //console.log('sent message', message);
            io.to(message.chat).emit('new-message', message);
            io.to('P'+ message.platform).emit('platform-message', message);
        });
        */
        socket.on('disconnectRoom', function (room) {
            socket.leave(room);
            //console.log('user disconnected room', room);
        });

        
    });

};

exports.sendMessage = function(message) {
    //io.to(message.chat).emit('message', message);
    io.emit('message', message);
};

exports.sendMessageQuestGame = function(message) {
    console.log('sending socket quest20 ---->');
    io.to('quest20').emit('message-20quest', message);
    //io.emit('message', message);
};