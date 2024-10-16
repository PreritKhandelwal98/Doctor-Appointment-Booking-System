import express from 'express'

import { createPrescription, getPrescriptionsByPatientId, getPrescriptionByUniqueId } from '../Controllers/prescriptionController.js'
import { authenticate, restrict } from '../auth/verifyToken.js'

const router = express.Router();


//prescription related routes

router.post('/create-prescription', createPrescription); // Create a new prescription
router.get('/patient/get-prescription/:patientId', getPrescriptionsByPatientId); // Get prescriptions for a patient
router.get('/get-prescription/:id', getPrescriptionByUniqueId); // Get a specific prescription by ID

export default router