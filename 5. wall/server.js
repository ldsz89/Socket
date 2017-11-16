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


var state = {
    started: false,
    health: 0,
    players: {},
    baddies: []
};

io.on("connection", function(socket) {
    console.log("A user (" + socket.id + ") connected");
    
    socket.on("join", function(player) {
        console.log(player.name + " joined the game!");

        state.players[socket.id] = player;
        
        io.sockets.emit("updatePlayers", state.players);
        
        if (Object.keys(state.players).length == 1) {
            io.to(socket.id).emit("isHost");
        }
        
        if (state.started) {
            io.to(socket.id).emit("startGame", state);
        }
    });
    
    socket.on("disconnect", function() {
        console.log(state.players[socket.id].name + " disconnected");
        
        delete state.players[socket.id];
        
        socket.broadcast.emit("updatePlayers", state.players);
    });
    
    socket.on("setupGame", function(props) {
        state.health = props.health;
        
        state.baddies = props.baddies;
        
        state.started = true;
        io.sockets.emit("startGame", state);
    });
    
    socket.on("updateBaddies", function(baddies) {
        state.baddies = baddies;
        
        socket.broadcast.emit("updateBaddies", state.baddies);
    });

});
