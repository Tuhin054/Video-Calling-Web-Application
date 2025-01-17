import * as dotenv from "dotenv";
dotenv.config();

import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const app = express(); // Initialize the Express application
const server = createServer(app); // Create an HTTP server using Express
const io = new Server(server); // Initialize a new instance of Socket.IO
const allusers = {}; // Object to store all connected users

// Get the directory name of the current module's file path
const __dirname = dirname(fileURLToPath(import.meta.url));

// Expose the public directory to serve static files
app.use(express.static("public"));

// Handle incoming HTTP GET requests to the root URL
app.get("/", (req, res) => {
    console.log("GET Request /"); // Log the GET request
    res.sendFile(join(__dirname + "/app/index.html")); // Serve the index.html file
});

// Handle Socket.IO connections
io.on("connection", (socket) => {
    console.log(`Someone connected to the socket server with socket ID ${socket.id}`);

    // Handle "join-user" event when a user joins
    socket.on("join-user", username => {
        console.log(`${username} joined the socket connection`);
        allusers[username] = { username, id: socket.id }; // Add the user to the list of all users
        io.emit("joined", allusers); // Inform all clients about the updated user list
    });

    // Handle "offer" event to forward an offer to the intended recipient
    socket.on("offer", ({ from, to, offer }) => {
        console.log({ from, to, offer }); // Log the offer details
        io.to(allusers[to].id).emit("offer", { from, to, offer }); // Send the offer to the target user
    });

    // Handle "answer" event to forward an answer to the caller
    socket.on("answer", ({ from, to, answer }) => {
        io.to(allusers[from].id).emit("answer", { from, to, answer }); // Send the answer back to the caller
    });

    // Handle "end-call" event to notify the other user that the call is ending
    socket.on("end-call", ({ from, to }) => {
        io.to(allusers[to].id).emit("end-call", { from, to }); // Notify the target user
    });

    // Handle "call-ended" event to notify both participants that the call has ended
    socket.on("call-ended", caller => {
        const [from, to] = caller; // Destructure caller information
        io.to(allusers[from].id).emit("call-ended", caller); // Notify the caller
        io.to(allusers[to].id).emit("call-ended", caller); // Notify the recipient
    });

    // Handle "icecandidate" event to share ICE candidates with other peers
    socket.on("icecandidate", candidate => {
        console.log({ candidate }); // Log the candidate details
        socket.broadcast.emit("icecandidate", candidate); // Broadcast the candidate to all connected clients
    });
});

// Start the HTTP server and listen on port 9000
const port=process.env.PORT || 3000;
server.listen(port, () => {
    console.log(`Server listening on port ${port}`);
});
