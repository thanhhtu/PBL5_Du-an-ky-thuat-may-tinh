import express from 'express';
import multer from 'multer';
import aiController from './ai.controller';

const router = express.Router();

// Configure multer for file uploads
const upload = multer({ dest: 'uploads/' });

//Define the route for audio transcription
router.post('/transcribe', upload.single('audio'), (req, res) => aiController.transcribeAudio(req, res));

export default router;


