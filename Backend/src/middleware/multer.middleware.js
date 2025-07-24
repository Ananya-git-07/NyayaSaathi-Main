import multer from "multer";

// Configure Multer to store files on disk in a temporary directory
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, "./public/temp")
    },
    filename: function (req, file, cb) {
      // We don't need a unique name as it's temporary, but it's good practice
      cb(null, file.originalname) 
    }
})

export const upload = multer({ storage });