import createDebugger from 'debug';
import { WebSocketServer } from 'ws';
import User from "./models/user.js";

const debug = createDebugger('express-api:messaging');

const clients = [];

export function createWebSocketServer(httpServer) {
    debug('Creating WebSocket server');
    const wss = new WebSocketServer({
        server: httpServer,
    });

    // Handle new client connections.
    wss.on('connection', function (ws) {
        debug('New WebSocket client connected');

        // Keep track of clients.
        clients.push(ws);

        // Listen for messages sent by clients.
        ws.on('message', (message) => {
            // Make sure the message is valid JSON.
            let parsedMessage;
            try {
                parsedMessage = JSON.parse(message);
            } catch (err) {
                // Send an error message to the client with "ws" if you want...
                return debug('Invalid JSON message received from client');
            }

            // Handle the message.
            onMessageReceived(ws, parsedMessage);
        });

        // Clean up disconnected clients.
        ws.on('close', () => {
            clients.splice(clients.indexOf(ws), 1);
            debug('WebSocket client disconnected');
        });
    });
}

export function broadcastMessage(message) {
    debug(
        `Broadcasting message to all connected clients: ${JSON.stringify(message)}`
    );

    // You can easily iterate over the "clients" array to send a message to all connected clients.
    for(const client of clients){
        client.send(JSON.stringify(message));
        console.log(client);
    }
}

export async function broadcastAdminMessage(message) {
    debug(
        `Broadcasting message to all connected admins: ${JSON.stringify(message)}`
    );

    let admins = await User.find({role: 'admin'});
    //console.log(admins);
    
    // You can easily iterate over the "admins" array to send a message to all connected admins.
    for(const admin of admins){
        //console.log(admin);
        
        admin.send(JSON.stringify(message));
    }
}

function onMessageReceived(ws, message) {
    debug(`Received WebSocket message: ${JSON.stringify(message)}`);
    
    // Do something with message...
    console.log("Message received ! " + message.message);
}
