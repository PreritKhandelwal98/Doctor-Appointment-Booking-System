import dotenv from 'dotenv';
dotenv.config();


import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import mongoose from 'mongoose';
import authRoute from './Routes/auth.js';
import userRoute from './Routes/user.js';
import doctorRoute from './Routes/doctor.js';
import adminRoute from './Routes/adminRoute.js'
import reviewRoute from './Routes/review.js';
import bookingRoute from './Routes/booking.js';
import aiRoute from './Routes/aiRoute.js';
import emailRoutes from './Routes/emailRoute.js'
import cluster from 'cluster';
import os from 'os'

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

const totalCPUs = os.cpus().length
console.log(totalCPUs);


const app = express();
const port = process.env.PORT || 8000;

const corsOption = {
    origin: true
};

app.get('/', (req, resp) => {
    resp.send("API is working fine");
});

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

// Use the email routes
app.use('/api/vi', emailRoutes);


app.listen(port, () => {
    console.log(`Server is working on the port ${port}`);
});
