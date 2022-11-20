# Qroket

A basic REST API project implemented with [Express](https://expressjs.com/).

Qroket is an application that allows you to publish a lost or a find animal.

Qroket's database contains 3 collections : 
- User.
- Animal.
- Location.

## Usage
```
# Clone the application.
git clone git@github.com:AdriMota/Qroket.git


## Install dependencies.
cd Qroket
npm ci

## Start the application in development mode.
DEBUG=demo:* npm start
```
Visit http://localhost:3000.
To automatically reload the code and re-generate the API documentation on changes, use `npm run dev` instead of `npm start`.

## API Resources

This API allows you to work with **Users** and **Animals**. An animals MUST have an user.

Read the [full documentation](https://qroket.onrender.com/apidoc/) to know more.
## Automated tests

This application has an automated test suite which you can run with npm test.

It will attempt to connect to the MongoDB database at mongodb://localhost/my-app-test.

The tests are implemented with SuperTest.

## Websocket 
WebSocket enables two-way communication between a client and a remote host. In Qroket, WS is used to signal all users when a new animal is posted. It's also used and to signal all admin when a new admin has been created.
## Install [ws npm package](https://www.npmjs.com/package/ws?activeTab=readme).
```
  npm install ws
```
## Connection
First, you will need to create a file ws.js. This is where the WebSocket server will accept connections from clients, it listens on port 3000 the same as the app. Once the WS server accepts the connection from the client, you can send a message, and listen for client messages.
```
import { WebSocketServer } from 'ws';
  
  // Create a WebSocket server that will accept connections on port 3000.
    const wss = new WebSocketServer({
    port: 3000
  });
  
  // Listen for client connections.
  wss.on('connection', function connection(ws) {
    // Listen for messages from the client once it has connected.
      ws.on('message', function incoming(message) {
      console.log('received: %s', message);
  });
  
    // Send something to the client.
    ws.send('something');
  });
  ```
  Then in start.js you will need to create the WS server. The HTTP server as already been created before, since the WS server listen on the same port as the HTTP server, you will only need to import the createWebSocketServer function and pass the const serve in its parameters.
  ```
  import { createWebSocketServer } from '../ws.js';

const debug = createDebugger('projet:server')

/**
 * Get port from environment and store in Express.
 */
const port = normalizePort(process.env.PORT || "3000");
app.set("port", port);

/**
 * Create HTTP server.
 */
const server = http.createServer(app);

/**
* Create HTTP & WebSocket servers.
 */
createWebSocketServer(server);
```
Now that everything is implemented you can broadcast messages from any routes. For example, in Qroket we notify every user when someone add a new animal.
```
import { broadcastMessage } from '../ws.js';

/* POST a new animal */
animalsRouter.post('/', authenticate, checkResourceId, upload.single('picture'), async function (req, res, next) {
/**
	* ...
 */
 
 // Broadcast the new animal to all connected users
 broadcastMessage({ animal: animal.name, event: 'new animal added' })
});
```
 
