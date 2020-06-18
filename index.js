// https://socket.io/docs/client-api/#Socket
const io = require('socket.io')(8081);
const path = require('path');
const osc = require('node-osc');
const express = require('express');
const app = express();

let oscServer, oscClient;
let isConnected = false;


app.use(express.static(path.join(__dirname, 'public')));
app.listen(3000);

io.sockets.on('connection', function (socket) {
	console.log('connection');
	try {
		socket.on("config", function (obj) {
			isConnected = true;
			console.dir(obj);
	    	oscServer = new osc.Server(obj.server.port, obj.server.host);
		    oscClient = new osc.Client(obj.client.host, obj.client.port);
		    oscClient.send('/status', socket.sessionId + ' connected');
			oscServer.on('message', function(msg, rinfo) {
				socket.emit("message", msg);
				console.dir(msg);
			});
			socket.emit("connected", 1);
		});
	 	socket.on("message", function (obj) {
			oscClient.send.apply(oscClient, obj);
	  	});
		socket.on('disconnect', function(){
			if (isConnected) {
				oscServer.kill();
				oscClient.kill();
			}
	  	});
	} catch (err) {
		console.log(err.message);
	}

});
