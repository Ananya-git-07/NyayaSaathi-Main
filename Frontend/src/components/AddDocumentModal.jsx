"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, Send, Loader2, UploadCloud, FileText } from "lucide-react"
import toast from "react-hot-toast"
import apiClient from "../api/axiosConfig"

const modalVariants = {
  hidden: { opacity: 0, y: 50, scale: 0.9 },
  visible: { opacity: 1, y: 0, scale: 1 },
  exit: { opacity: 0, y: -50, scale: 0.9 },
}

const AddDocumentModal = ({ isOpen, onClose, onSuccess }) => {
  const [issueId, setIssueId] = useState("")
  const [documentType, setDocumentType] = useState("")
  const [documentFile, setDocumentFile] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [fileName, setFileName] = useState("")
  const [userIssues, setUserIssues] = useState([])

  // Fetch user's issues for the dropdown
  useEffect(() => {
    if (isOpen) {
      fetchUserIssues()
    }
  }, [isOpen])

  const fetchUserIssues = async () => {
    try {
      const response = await apiClient.get("/citizens/issues")
      setUserIssues(response.data.issues || [])
    } catch (err) {
      console.error("Failed to fetch user issues:", err)
    }
  }

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      // Check file size (10MB limit)
      if (file.size > 10 * 1024 * 1024) {
        toast.error("File size must be less than 10MB")
        return
      }

      // Check file type
      const allowedTypes = ["application/pdf", "image/jpeg", "image/jpg", "image/png"]
      if (!allowedTypes.includes(file.type)) {
        toast.error("Only PDF, JPG, and PNG files are allowed")
        return
      }

      setDocumentFile(file)
      setFileName(file.name)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!documentType.trim()) {
      return toast.error("Document type is required.")
    }
    if (!documentFile) {
      return toast.error("Please select a file to upload.")
    }

    setIsSubmitting(true)
    const loadingToast = toast.loading("Uploading document...")

    const formData = new FormData()
    formData.append("documentType", documentType)
    formData.append("documentFile", documentFile)
    if (issueId) {
      formData.append("issueId", issueId)
    }

    try {
      const response = await apiClient.post("/documents", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      })
      toast.success("Document uploaded successfully!", { id: loadingToast })
      onSuccess()
      handleClose()
    } catch (err) {
      toast.error(err.message || "Failed to upload document.", { id: loadingToast })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    setIssueId("")
    setDocumentType("")
    setDocumentFile(null)
    setFileName("")
    onClose()
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm"
          onClick={handleClose}
        >
          <motion.div
            variants={modalVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="bg-slate-800 rounded-xl shadow-2xl w-full max-w-lg border border-slate-700"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center p-6 border-b border-slate-700">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
                  <FileText className="text-blue-400" size={20} />
                </div>
                <h3 className="text-xl font-bold text-white">Upload New Document</h3>
              </div>
              <button
                onClick={handleClose}
                className="p-2 rounded-full text-slate-400 hover:bg-slate-700 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="p-6 space-y-6">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Document Type *</label>
                  <input
                    value={documentType}
                    onChange={(e) => setDocumentType(e.target.value)}
                    placeholder="e.g., Aadhaar Card, Income Certificate, Land Documents"
                    required
                    className="input-style"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Related Issue (Optional)</label>
                  <select value={issueId} onChange={(e) => setIssueId(e.target.value)} className="input-style">
                    <option value="">Select an issue (optional)</option>
                    {userIssues.map((issue) => (
                      <option key={issue._id} value={issue._id}>
                        {issue.issueType} - {issue.description.substring(0, 50)}...
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Document File *</label>
                  <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-slate-600 border-dashed rounded-lg hover:border-slate-500 transition-colors">
                    <div className="space-y-1 text-center">
                      <UploadCloud className="mx-auto h-12 w-12 text-slate-400" />
                      <div className="flex text-sm text-slate-500">
                        <label
                          htmlFor="file-upload"
                          className="relative cursor-pointer bg-slate-700 rounded-md font-medium text-cyan-400 hover:text-cyan-300 focus-within:outline-none px-2 py-1"
                        >
                          <span>Upload a file</span>
                          <input
                            id="file-upload"
                            name="file-upload"
                            type="file"
                            className="sr-only"
                            onChange={handleFileChange}
                            accept=".pdf,.jpg,.jpeg,.png"
                          />
                        </label>
                        <p className="pl-1">or drag and drop</p>
                      </div>
                      <p className="text-xs text-slate-500">PDF, PNG, JPG up to 10MB</p>
                      {fileName && <p className="text-sm text-green-400 mt-2 font-medium">Selected: {fileName}</p>}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 p-6 bg-slate-900/50 border-t border-slate-700 rounded-b-xl">
                <button
                  type="button"
                  onClick={handleClose}
                  className="px-4 py-2 text-slate-400 hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button type="submit" disabled={isSubmitting} className="btn-primary w-auto flex items-center gap-2">
                  {isSubmitting ? <Loader2 className="animate-spin" size={16} /> : <Send size={16} />}
                  {isSubmitting ? "Uploading..." : "Upload Document"}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default AddDocumentModal
