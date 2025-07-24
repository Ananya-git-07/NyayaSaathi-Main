"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, Send, Loader2, AlertCircle } from "lucide-react"
import toast from "react-hot-toast"
import apiClient from "../api/axiosConfig"

const modalVariants = {
  hidden: { opacity: 0, y: 50, scale: 0.9 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { type: "spring", damping: 15, stiffness: 200 } },
  exit: { opacity: 0, y: -50, scale: 0.9, transition: { duration: 0.2 } },
}

const AddIssueModal = ({ isOpen, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    issueType: "Aadhaar Issue",
    description: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const issueTypes = [
    "Aadhaar Issue",
    "Pension Issue",
    "Land Dispute",
    "Court Summon",
    "Certificate Missing",
    "Fraud Case",
    "Other",
  ]

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!formData.description.trim()) {
      return toast.error("Description is required.")
    }

    setIsSubmitting(true)
    const loadingToast = toast.loading("Creating new issue...")

    try {
      const response = await apiClient.post("/issues", formData)
      toast.success("Legal issue created successfully!", { id: loadingToast })
      onSuccess()
      handleClose()
    } catch (err) {
      toast.error(err.message || "Failed to create issue.", { id: loadingToast })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    setFormData({ issueType: "Aadhaar Issue", description: "" })
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
                <div className="w-10 h-10 rounded-lg bg-red-500/20 flex items-center justify-center">
                  <AlertCircle className="text-red-400" size={20} />
                </div>
                <h3 className="text-xl font-bold text-white">Create New Legal Issue</h3>
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
                  <label htmlFor="issueType" className="block text-sm font-medium text-slate-300 mb-2">
                    Issue Type *
                  </label>
                  <select
                    id="issueType"
                    name="issueType"
                    value={formData.issueType}
                    onChange={handleChange}
                    className="input-style"
                  >
                    {issueTypes.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-slate-300 mb-2">
                    Description *
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    rows="4"
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="Please describe your legal issue in detail. Include relevant dates, locations, and any documents you have."
                    className="input-style w-full resize-none"
                    required
                  />
                  <p className="text-xs text-slate-400 mt-1">
                    Provide as much detail as possible to help us assist you better
                  </p>
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
                  {isSubmitting ? "Creating..." : "Create Issue"}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
export default AddIssueModal