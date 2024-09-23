import express from 'express'
import { updateDoctor, getAllDoctorTimeSlots, getDoctorProfile, getAllDoctors, deleteDoctor, getSingleDoctor, getAllDoctor, changeDoctorStatus } from '../Controllers/doctorController.js'
import { authenticate, restrict } from '../auth/verifyToken.js'

import reviewRouter from './review.js'

const router = express.Router();

//nested route
router.use("/:doctorId/reviews", reviewRouter)

router.put("/profile/me/:id", authenticate, restrict(['doctor']), updateDoctor);
router.delete("/:id", authenticate, restrict(['doctor']), deleteDoctor);
router.get("/:id", getSingleDoctor);
router.get("/", getAllDoctor);
router.get("/all-doctor/list", getAllDoctors);
router.get("/profile/me", authenticate, restrict(['doctor']), getDoctorProfile);
router.get("/appointment/all/getAllDoctorTimeSlots/:doctorId", getAllDoctorTimeSlots)

router.put("/change-status/:id", authenticate, changeDoctorStatus)
//, restrict(['admin'])

export default router