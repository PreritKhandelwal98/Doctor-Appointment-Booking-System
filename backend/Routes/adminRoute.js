import express from 'express'
import { updateAdmin, deleteAdmin, getSingleAmdin, getAllAdmin, getAdminProfile } from '../Controllers/adminController.js'
import { authenticate, restrict } from '../auth/verifyToken.js'

const router = express.Router();

router.put("/profile/me/:id", authenticate, restrict(['admin']), updateAdmin);
router.delete("/:id", authenticate, restrict(['admin']), deleteAdmin);
router.get("/profile/me", authenticate, restrict(['admin']), getAdminProfile);

router.get("/:id", getSingleAmdin);
router.get("/", getAllAdmin);



export default router