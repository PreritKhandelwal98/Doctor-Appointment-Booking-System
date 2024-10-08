import express from 'express'

import { createOrder, bookedSlots, verifyPayment, changeAppointmentStatus, getAppointmentById, getAppointmentByType, createPrescription, getPrescriptionsByPatientId, getPrescriptionById } from '../Controllers/bookingController.js'
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

//prescription related routes

router.post('/prescriptions', createPrescription); // Create a new prescription
router.get('/prescriptions/patient/:patientId', getPrescriptionsByPatientId); // Get prescriptions for a patient
router.get('/prescriptions/:id', getPrescriptionById); // Get a specific prescription by ID

export default router