import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import mongoose from 'mongoose';
import { createServer } from 'http'; // For http server with socket.io
import { Server } from 'socket.io'; // For Socket.io

import authRoute from './Routes/auth.js';
import userRoute from './Routes/user.js';
import doctorRoute from './Routes/doctor.js';
import adminRoute from './Routes/adminRoute.js';
import reviewRoute from './Routes/review.js';
import bookingRoute from './Routes/booking.js';
import aiRoute from './Routes/aiRoute.js';
import emailRoutes from './Routes/emailRoute.js';
import prescriptionRoute from './Routes/prescriptionRoute.js';

import cluster from 'cluster';
import os from 'os';

// Database connection
mongoose.connect(process.env.MONGO_URL)
    .then(() => {
        console.log("MongoDB database is connected");
    }).catch((err) => {
        console.error("MongoDB database connection failed:", err);
    });

const connection = mongoose.connection;

connection.on('connected', () => {
    console.log("Mongoose connected to DB cluster");
});

connection.on('error', (err) => {
    console.error("Mongoose connection error:", err);
});

connection.on('disconnected', () => {
    console.log("Mongoose disconnected");
});

const totalCPUs = os.cpus().length;
console.log(`Total CPUs: ${totalCPUs}`);

const app = express();
const server = createServer(app); // Create http server with Express
const port = process.env.PORT || 8000;

// Socket.io setup
const io = new Server(server, {
    cors: {
        origin: "*", // You can limit this to your frontend domain
        methods: ["GET", "POST"],
    },
});

const corsOption = {
    origin: true
};

// Middleware
app.use(express.json());
app.use(cookieParser());
app.use(cors(corsOption));

// Routes
app.use('/api/v1/auth', authRoute);

app.use('/api/v1/reviews', reviewRoute);
app.use('/api/v1/bookings', bookingRoute);

app.use('/api/v1/user', userRoute);

app.use('/api/v1/admin', adminRoute);

app.use('/api/v1/doctors', doctorRoute);

app.use('/api/v1/prescription', prescriptionRoute);

app.use('/api/v1/ai', aiRoute);
app.use('/api/vi', emailRoutes);


// WebRTC signaling
const emailToSocketIdMap = new Map();
const socketidToEmailMap = new Map();

// Keep track of room occupants
const roomOccupants = new Map();

io.on("connection", (socket) => {
    console.log(`Socket Connected:`, socket.id);

    socket.on("room:join", (data) => {
        const { email, room } = data;
        console.log("User trying to join room:", data);

        // Get current occupants of the room
        let occupants = roomOccupants.get(room) || [];

        // Check if the room already has two users
        if (occupants.length >= 2) {
            // Room is full, reject the new user
            socket.emit("room:full", { message: "Room is full, can't join" });
            return;
        }

        // Add the user to the room's occupants list
        occupants.push(socket.id);
        roomOccupants.set(room, occupants);

        // Map email to socket id and vice versa
        emailToSocketIdMap.set(email, socket.id);
        socketidToEmailMap.set(socket.id, email);

        // Join the socket to the room
        socket.join(room);

        // Notify the room that a user has joined
        io.to(room).emit("user:joined", { email, id: socket.id });
        console.log(`${email} joined room: ${room}`);

        // Optional: Notify the user that they successfully joined
        socket.emit("room:joined", { room });
    });

    socket.on("user:call", ({ to, offer }) => {
        // Initiate the call
        io.to(to).emit("incoming:call", { from: socket.id, offer });
    });

    socket.on("call:accepted", ({ to, ans }) => {
        // Call has been accepted, relay the answer
        io.to(to).emit("call:accepted", { from: socket.id, ans });
    });

    socket.on("peer:nego:needed", ({ to, offer }) => {
        // Handle peer negotiation (SDP exchange)
        io.to(to).emit("peer:nego:needed", { from: socket.id, offer });
    });

    socket.on("peer:nego:done", ({ to, ans }) => {
        console.log("Peer negotiation done", ans);
        // Final negotiation step
        io.to(to).emit("peer:nego:final", { from: socket.id, ans });
    });

    socket.on("disconnect", () => {
        console.log(`Socket Disconnected:`, socket.id);

        // Find which room this socket was in
        for (let [room, occupants] of roomOccupants) {
            if (occupants.includes(socket.id)) {
                // Remove the socket from the room occupants
                occupants = occupants.filter(id => id !== socket.id);
                roomOccupants.set(room, occupants);

                // Notify other users in the room that someone disconnected
                io.to(room).emit("user:left", { id: socket.id });

                // If the room is now empty, you can delete it from the map
                if (occupants.length === 0) {
                    roomOccupants.delete(room);
                }

                break;
            }
        }

        // Cleanup email/socket maps
        const email = socketidToEmailMap.get(socket.id);
        emailToSocketIdMap.delete(email);
        socketidToEmailMap.delete(socket.id);
    });
});


// Serve the app
app.get('/', (req, resp) => {
    resp.send("API is working fine");
});

// Start server with WebSocket enabled
server.listen(port, () => {
    console.log(`Server is working on port ${port}`);
});
