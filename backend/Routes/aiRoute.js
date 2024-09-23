import express from 'express';
import { aiPrompt } from './../Controllers/aiController.js';

const router = express.Router();

router.post("/prompt", aiPrompt);

export default router;
