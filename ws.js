import createDebugger from 'debug';
import { WebSocketServer } from 'ws';
import User from "./models/user.js";
import {tokenToUser} from "./routes/auth.js"

const debug = createDebugger('express-api:messaging');

const clients = [];

export function createWebSocketServer(httpServer) {
    debug('Creating WebSocket server');
    const wss = new WebSocketServer({
        server: httpServer,
    });

    // Handle new client connections.
    wss.on('connection', async function (ws, req) {
        debug('New WebSocket client connected');

        const user = await tokenToUser(req);
        if (!user) {
            //console.log('User not authenticated');
            ws.send('User not authenticated');
            ws.close();
            return;
        }

        //console.log(`User authenticated: ${user.email}`);

        // Keep track of clients.
        clients.push({
            "id": user._id,
            "socket": ws
        });



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
        client.socket.send(JSON.stringify(message));
    }
}

export async function broadcastAdminMessage(message) {
    debug(
        `Broadcasting message to all connected admins: ${JSON.stringify(message)}`
    );

    // You can easily iterate over the "clients" array to send a message to all connected clients.
    for (const client of clients) {
        // test if the user is an admin
        const user = await User.findById(client.id);
        //test if we have a user
        if (user) {
            if (user.role == 'admin') {
                client.socket.send(JSON.stringify(message));
                //console.log("Sending message to user " + user.email + " Message :" + JSON.stringify(message));
            }
        } else {
            console.log('User not found');
        }
    }
}

function onMessageReceived(ws, message) {
    debug(`Received WebSocket message: ${JSON.stringify(message)}`);
    
    // Do something with message...
    console.log("Message received ! " + message.message);
}
