/*
This file represents the server-side of this application. It is responsible
for creating and managing the socket used to pass Open Sound Control (OSC)
messages.

This app uses the express framework. OSC messages are sent over a web socket
connected on port 8081. The app itself is access on port 3000.
*/

const io = require('socket.io')(8081);  // send osc over 8081
const path = require('path');           // path is needed for static files
const osc = require('node-osc');        // import osc functionality

const express = require('express');     // use the express framework
const app = express();                  // initialize the app

//const env = require('dotenv').config()              // ensure environment variables can be accessed

let oscServer, oscClient;
let isConnected = false;

// inform the app that we will use static resources
app.use(express.static(path.join(__dirname, 'public')));
app.set('port', process.env.PORT);

// set the app to be served up at port 3000
app.listen(3000);

app.get('/', (req, res) => {
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

	res.status(200).send();
})

// when a connection is successful, create the OSC client and server
