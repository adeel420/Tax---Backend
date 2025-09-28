const express = require("express");
const {
  create,
  getDocumentsByUserId,
  deleteDocument,
  getAllDocuments,
  getAllDocumentsSimple, // Alternative method
} = require("../controllers/documentController");
const router = express.Router();
const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("../middleware/cloudinary");

// Cloudinary storage configuration
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "tax-documents",
    allowed_formats: ["jpg", "jpeg", "png", "pdf"],
    transformation: [{ quality: "auto" }], // Optimize file size
  },
});

// Multer configuration with file size limit
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    // Additional file type validation
    const allowedTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "application/pdf",
    ];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Only PDF, JPG, JPEG, and PNG files are allowed"), false);
    }
  },
});

// Error handling middleware for multer
const handleMulterError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({
        success: false,
        message: "File size too large. Maximum size allowed is 10MB.",
      });
    }
  } else if (err) {
    return res.status(400).json({
      success: false,
      message: err.message,
    });
  }
  next();
};

// Routes
router.post("/", upload.single("file"), handleMulterError, create);
router.get("/user/:userId", getDocumentsByUserId);
router.delete("/:userId/:docType/:index?", deleteDocument);

// Admin routes - get all documents with user info
router.get("/", getAllDocuments);
// Alternative route if the main one doesn't work
router.get("/simple", getAllDocumentsSimple);

module.exports = router;
