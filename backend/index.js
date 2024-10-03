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
app.use('/api/v1/ai', aiRoute);
app.use('/api/vi', emailRoutes);


// WebRTC signaling
const emailToSocketIdMap = new Map();
const socketidToEmailMap = new Map();

io.on("connection", (socket) => {
    console.log(`Socket Connected`, socket.id);
    socket.on("room:join", (data) => {
        const { email, room } = data;
        console.log("this is email", data);

        emailToSocketIdMap.set(email, socket.id);
        socketidToEmailMap.set(socket.id, email);
        socket.join(room);
        io.to(room).emit("user:joined", { email, id: socket.id });
        io.to(room).emit("room:join", data);
        //socket.emit("room:join", { room }); // Emit back to the user that they joined the room
    });

    socket.on("user:call", ({ to, offer }) => {
        io.to(to).emit("incomming:call", { from: socket.id, offer });
    });

    socket.on("call:accepted", ({ to, ans }) => {
        io.to(to).emit("call:accepted", { from: socket.id, ans });
    });

    socket.on("peer:nego:needed", ({ to, offer }) => {
        //console.log("peer:nego:needed", offer);
        io.to(to).emit("peer:nego:needed", { from: socket.id, offer });
    });

    socket.on("peer:nego:done", ({ to, ans }) => {
        console.log("peer:nego:done", ans);
        io.to(to).emit("peer:nego:final", { from: socket.id, ans });
    });
    socket.on("disconnect", () => {
        console.log(`Socket Disconnected`, socket.id);
        // Handle cleanup if necessary
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
