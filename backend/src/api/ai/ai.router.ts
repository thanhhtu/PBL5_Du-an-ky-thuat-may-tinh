import express from 'express';
import aiController from './ai.controller';
import { uploadAudio } from '../../providers/upload.provider';

const router = express.Router();

router.post('/transcribe', 
  uploadAudio.single('audio'), 
  aiController.transcribeAudio
);

export default router;