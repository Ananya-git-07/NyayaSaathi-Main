import { Router } from "express"
import Document from "../models/Document.js"
import { softDeleteById } from "../utils/helpers.js"
import { upload } from "../middleware/multer.middleware.js"
import { uploadOnCloudinary } from "../utils/cloudinary.js"

const router = Router()

// Create document with file upload
router.post("/", upload.single("documentFile"), async (req, res, next) => {
  try {
    const { issueId, documentType } = req.body

    if (!req.file) {
      return res.status(400).json({ success: false, message: "Document file is required." })
    }

    const documentLocalPath = req.file.path
    const documentUploadResponse = await uploadOnCloudinary(documentLocalPath)

    if (!documentUploadResponse) {
      return res.status(500).json({ success: false, message: "Failed to upload document to cloud storage." })
    }

    const newDoc = await Document.create({
      userId: req.user._id,
      issueId: issueId || undefined,
      documentType,
      fileUrl: documentUploadResponse.url,
      submissionStatus: "submitted",
      uploadedBy: "User",
      isDeleted: false,
    })

    const populatedDoc = await Document.findById(newDoc._id)
      .populate("userId", "fullName email")
      .populate("issueId", "issueType description status")

    res.status(201).json({ success: true, data: populatedDoc })
  } catch (err) {
    next(err)
  }
})

// Get all documents for logged-in user
router.get("/", async (req, res, next) => {
  try {
    const docs = await Document.find({ userId: req.user._id, isDeleted: false })
      .populate("issueId", "issueType description status")
      .sort({ createdAt: -1 })

    res.json({ success: true, data: docs })
  } catch (err) {
    next(err)
  }
})

// Get single document with full details
router.get("/:id", async (req, res, next) => {
  try {
    const doc = await Document.findOne({
      _id: req.params.id,
      userId: req.user._id,
      isDeleted: false,
    })
      .populate("userId", "fullName email phoneNumber")
      .populate("issueId", "issueType description status createdAt")

    if (!doc) {
      return res.status(404).json({ success: false, message: "Document not found" })
    }

    res.json({ success: true, data: doc })
  } catch (err) {
    next(err)
  }
})

// Update document
router.put("/:id", async (req, res, next) => {
  try {
    const updatedDoc = await Document.findOneAndUpdate({ _id: req.params.id, userId: req.user._id }, req.body, {
      new: true,
    }).populate("issueId", "issueType description status")

    if (!updatedDoc) {
      return res.status(404).json({ success: false, message: "Document not found" })
    }

    res.json({ success: true, data: updatedDoc })
  } catch (err) {
    next(err)
  }
})

// Soft delete document
router.delete("/:id", async (req, res, next) => {
  try {
    const doc = await softDeleteById(Document, req.params.id)
    res.json({ success: true, message: "Document deleted successfully", data: doc })
  } catch (err) {
    next(err)
  }
})

export default router
