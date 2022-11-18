import mongoose from "mongoose";
import multer from "multer";

/* ---------------------------------------------------------------
    UPLOAD IMAGES
--------------------------------------------------------------- */
const Storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, `uploads`)
    },
    filename: (req, file, cb) => {
        // Use userID and animalID in the name
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, `qroket_${uniqueSuffix}.jpg`)
    }
});

/* const multerFilter = function (req, file, cb) {
    // Check file format
    if (file.mimetype !== 'image/jpeg') {
        req.fileFormatError = "Le format n'est pas valide. Cela doit être au format .jpg";
        return cb(null, false, new Error('Invalid file format. Must be .jpg'));
    }
    cb(null, true)
}; */

const upload = multer({
    storage: Storage,
    /* fileFilter: multerFilter, */
    limits: { fileSize: 31457280 }
}).single('picture');

const uploads = multer({
    storage: Storage,
    /* fileFilter: multerFilter, */
    limits: { fileSize: 31457280 }
}).array('pictures', 4);

export { upload, uploads };