import User from '../models/UserSchema.js';
import Doctor from '../models/DoctorSchema.js';
import Appointment from '../models/BookingSchema.js';

import Razorpay from 'razorpay'
import crypto from 'crypto';
import { sendSMS } from '../Utils/notificationService.js'
import {
    sendEmail,
    appointmentBookedMailgenContent,
    appointmentStatusChangedMailgenContent,
    doctorBookingNotificationMailgenContent,

} from './../Utils/mail.js'
import { fileURLToPath } from 'url';  // Add this line
import { dirname } from 'path';        // Add this line

// Get __filename and __dirname in ES module context
const __filename = fileURLToPath(import.meta.url); // Add this line
const __dirname = dirname(__filename); // Add this line



export const verifyPayment = async (req, res) => {
    try {
        const { razorpay_payment_id, razorpay_order_id, razorpay_signature } = req.body;

        const body = razorpay_order_id + "|" + razorpay_payment_id;
        const expectedSignature = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
            .update(body.toString())
            .digest('hex');

        if (expectedSignature === razorpay_signature) {
            // Payment is verified
            // You may also want to update the booking status in the database here
            res.status(200).json({ success: true, message: 'Payment verified' });
        } else {
            // Payment verification failed
            res.status(400).json({ success: false, message: 'Payment verification failed' });
        }
    } catch (error) {
        console.error("Error verifying payment:", error);
        res.status(500).json({ success: false, message: 'Error verifying payment', error: error.message });
    }
};

export const bookedSlots = async (req, res) => {
    const doctorId = req.params.doctorId;
    const { date } = req.query; // Expecting a date in the query string
    console.log(date);

    try {
        const doctor = await Doctor.findById(doctorId);

        if (!doctor) {
            return res.status(404).json({ success: false, message: "Doctor not found" });
        }

        // Use a date object to find bookings on the specific date
        const startDate = new Date(date);
        const endDate = new Date(startDate);
        endDate.setDate(endDate.getDate() + 1); // Set to the next day

        const bookedSlots = await Appointment.find({
            doctor: doctorId,
            appointmentDate: {
                $gte: startDate, // Greater than or equal to start date
                $lt: endDate // Less than the next day
            },
            status: { $in: ['pending', 'approved'] }
        });

        console.log("booked slots", bookedSlots);

        // Collect all booked slots
        const bookedTimes = bookedSlots.map(slot => ({
            startTime: slot.startTime,
            endTime: slot.endTime
        }));

        res.status(200).json({ bookedSlots: bookedTimes });
    } catch (error) {
        console.error("Error fetching booked slots:", error);
        res.status(500).json({ error: 'Error fetching booked slots' });
    }
};


export const createOrder = async (req, res) => {
    try {
        const doctorId = req.params.doctorId;
        const userId = req.userId;
        //console.log("this is date data", req.body);

        const { appointmentDate, startTime, endTime, appointmentType } = req.body.user;
        //console.log("this data", appointmentDate);

        // Set default appointment date to now if not provided
        const defaultDate = new Date();
        const finalAppointmentDate = appointmentDate ? new Date(appointmentDate) : defaultDate;

        //console.log("Called with doctor id:", doctorId);

        // Fetch doctor and user details
        const doctor = await Doctor.findById(doctorId);
        const user = await User.findById(userId);

        if (!doctor || !user) {
            return res.status(404).json({ success: false, message: "Doctor or User not found" });
        }

        const amount = doctor.ticketPrice;
        console.log("this is amount", amount);

        // Options for Razorpay order creation
        const options = {
            amount: amount * 100, // amount in the smallest currency unit
            currency: "INR",
            receipt: `receipt_order_${doctorId}`,
        };

        // Initialize Razorpay instance
        var instance = new Razorpay({
            key_id: process.env.RAZORPAY_KEY_ID,
            key_secret: process.env.RAZORPAY_KEY_SECRET,
        });

        // Create Razorpay order
        instance.orders.create(options, async (err, order) => {
            if (err) {
                console.error("Razorpay order creation error:", err);
                return res.status(500).json({ success: false, message: "Something went wrong" });
            }

            // Save order to database
            const booking = new Appointment({
                doctor: doctor._id,
                user: user._id,
                ticketPrice: amount,
                startTime: startTime, // Ensure this is set
                endTime: endTime,
                appointmentType: appointmentType,
                appointmentDate: finalAppointmentDate, // Ensure the finalAppointmentDate is used
                session: order.id
            });
            console.log(booking);


            await booking.save();

            sendEmail({
                email: user?.email,
                subject: "Appointment Booking Confirmation",
                mailgenContent: appointmentBookedMailgenContent(
                    user.name,
                    booking,
                    doctor.name
                ),
            }).catch(err => {
                console.error("Error sending email:", err);
            });

            sendEmail({
                email: doctor?.email,
                subject: "A New Booking Created",
                mailgenContent: doctorBookingNotificationMailgenContent(
                    doctor.name,
                    booking,
                    user.name,
                ),
            }).catch(err => {
                console.error("Error sending email:", err);
            });


            console.log("this is after send mail");

            // Prepare notification content
            const appointmentDetails = `Appointment with Dr. ${doctor.name} on ${booking.appointmentDate} from ${booking.startTime} to ${booking.endTime}`;

            // Send Email and SMS to User
            const patientMobile = `+91${user.phone}`
            sendSMS(patientMobile, `Your appointment is confirmed: ${appointmentDetails}`);

            // Send Email and SMS to Doctor
            const doctorMobile = `+91${doctor.phone}`
            sendSMS(doctorMobile, `You have a new appointment: ${appointmentDetails}`);

            return res.status(200).json({
                success: true, message: "Successfully created order", order, user: {
                    name: user.name,
                    email: user.email,
                    phone: user.phone,
                },
            });
        });
    } catch (error) {
        console.error("Unexpected error:", error);
        return res.status(500).json({ success: false, message: "Something went wrong" });
    }
};

//Doctor will change the appointment status
export const changeAppointmentStatus = async (req, res) => {
    //console.log("this is called");

    const { id } = req.params;
    const { status } = req.body;
    //console.log("status", status);


    try {
        const appointment = await Appointment.findById(id)
            .populate('user', 'name email phone')
            .populate('doctor', 'name email phone');

        if (!appointment) {
            return res.status(400).json({ success: false, message: "Appointment not found" });
        }

        appointment.status = status;

        // Accessing populated fields:
        const userName = appointment.user.name;
        const userEmail = appointment.user.email;
        //const userPhone = appointment.user.phone;

        const doctorName = appointment.doctor.name;
        //const doctorEmail = appointment.doctor.email;
        //const doctorPhone = appointment.doctor.phone;
        await appointment.save();


        // Send the email without awaiting it
        sendEmail({
            email: userEmail,
            subject: "Appointment Status Changed",
            mailgenContent: appointmentStatusChangedMailgenContent(
                userName,
                doctorName,
                status,
                appointment,
            ),
        }).catch(err => {
            console.error("Error sending email:", err);
        }); // Catch any errors in email sending

        //console.log("this is after send mail");


        // // Prepare status update content
        // const statusUpdateMessage = `Your appointment with Dr. ${appointment.doctor.name} is now ${status}.`;

        // // Notify User about status change
        // const patientMobile = `+91${appointment.user.phone}`
        // sendEmail(appointment.user.email, 'Appointment Status Update', statusUpdateMessage);
        // sendSMS(patientMobile, statusUpdateMessage);

        return res.status(200).json({
            success: true,
            message: "Status updated successfully",
            data: appointment,
        });
    } catch (error) {
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};

export const getAppointmentById = async (req, res) => {
    const { id } = red.params;
    try {
        const appointment = await Appointment.findById(id)
            .populate('doctor', 'name email phone')
            .populate('user', 'name email phone');

        if (!appointment) {
            return res.status(404).json({ success: false, message: "Appointment not found" })
        }

        return res.status(200).json({ success: true, message: "Appointment found", appointment })
    } catch (error) {
        console.error("Error fetching appointment by ID:", error);
        return res.status(500).json({ success: false, message: "Error fetching appointment", error: error.message });
    }
}

export const getAppointmentByType = async (req, res) => {
    const { appointmentType } = req.query;

    if (!appointmentType) {
        return res.status(400).json({ success: false, message: "Appointment type is required" });
    }

    try {
        const appointments = await Appointment.find({ appointmentType })
            .populate('doctor', 'name email phone')
            .populate('user', 'name email phone');

        if (!appointments.length) {
            return res.status(404).json({ success: false, message: "No appointments found for this type" });
        }

        return res.status(200).json({ success: true, appointments });

    } catch (error) {
        console.error("Error fetching appointments by type:", error);
        return res.status(500).json({ success: false, message: "Error fetching appointments", error: error.message });
    }
}



