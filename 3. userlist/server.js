// Created by Professor Wergeles for CS4830 at the University of Missouri

var app = require('http').createServer(handler);
var io = require('socket.io')(app);
var fs = require('fs');
var port = 8080;

function handler(req, res) {
    fs.readFile("client.html", function(err, data) {
        if (err) {
            res.writeHead(500);
            res.end("Error loading client.html");
        }
        else {
            res.writeHead(200);
            res.end(data);
        }
    });
};

app.listen(port, function() {
    console.log("Running on port: " + port);
});


var clients = {};

io.on("connection", function(socket) {
    console.log("A user (" + socket.id + ") connected!");

    // server tells client who's already connected
    io.to(socket.id).emit("updateClient", clients);

    // add a spot for the new client
    clients[socket.id] = "noname";

    // If user disconnects
    socket.on("disconnect", function() {
        console.log(clients[socket.id] + " disconnected");

        // remove client from server's memory
        delete clients[socket.id];

        // Tell the other clients that there has been an update
        socket.broadcast.emit("updateClient", clients);
    });

    // client reports that they joined
    socket.on("join", function(user) {
      console.log(user + " joined in");

      // add user to the array
      clients[socket.id] = user;

      // server will tell other clients that a new user has joined
      socket.broadcast.emit("updateClient", clients);
    });

});
