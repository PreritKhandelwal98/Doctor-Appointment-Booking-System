import express from 'express'

import { createOrder, bookedSlots, verifyPayment, changeAppointmentStatus, getAppointmentById, getAppointmentByType } from '../Controllers/bookingController.js'
import { authenticate, restrict } from '../auth/verifyToken.js'

const router = express.Router();

//nested route

// router.post("/checkout-session/:doctorId", authenticate, getCheckoutSession);
router.post("/checkout/razorpay/:doctorId", authenticate, createOrder)
router.post('/verify-payment', verifyPayment);
router.get('/booked-slots/:doctorId', bookedSlots)
router.put("/appointment/change-status/:id", authenticate, restrict(['doctor']), changeAppointmentStatus)
router.get("/appointments/:id", getAppointmentById)
router.get("/appointmentType", getAppointmentByType)



export default router