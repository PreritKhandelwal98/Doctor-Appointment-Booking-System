import express from 'express';
import { contactFormHandler } from '../controllers/contactFormController.js'; // Adjust path if needed

const router = express.Router();

router.post('/contact', contactFormHandler);

export default router;
