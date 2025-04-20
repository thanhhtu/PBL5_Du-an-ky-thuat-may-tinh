import multer from 'multer';
import path from 'path';
import fs from 'fs';

const createStorage = (uploadPath: string) => {
  const fullPath = path.join(__dirname, uploadPath);
  if (!fs.existsSync(fullPath)) {
    fs.mkdirSync(fullPath, { recursive: true });
  }

  return multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, path.join(__dirname, uploadPath));
    },
    filename: (req, file, cb) => {
      cb(null, file.originalname); 
    }
  });
};
const uploadAudio = multer({ storage: createStorage('../uploads/audio/m4a') });
const uploadImage = multer({ storage: createStorage('../public/images') });

export { 
  uploadAudio, 
  uploadImage 
};
