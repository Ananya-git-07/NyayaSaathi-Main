"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import apiClient from "../api/axiosConfig"
import Spinner from "../components/Spinner"
import { User, Mail, ShieldCheck, KeySquare, Calendar, Phone, Building, Award, MapPin } from "lucide-react"

const itemVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: { opacity: 1, x: 0 },
}

const ProfilePage = () => {
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await apiClient.get("/auth/current-user")
        setProfile(response.data.data)
      } catch (err) {
        setError(err.message || "Could not load your profile.")
      } finally {
        setLoading(false)
      }
    }

    fetchProfile()
  }, [])

  if (loading) return <Spinner />
  if (error)
    return (
      <div className="w-full max-w-4xl p-8 bg-red-50 border border-red-200 text-red-700 rounded-lg text-center">
        <p>{error}</p>
      </div>
    )
  if (!profile)
    return (
      <div className="w-full max-w-4xl p-8 text-slate-600 text-center bg-white rounded-lg border border-slate-200">
        Profile data not found.
      </div>
    )

  const getProfileDetails = () => {
    const baseDetails = [
      { icon: <User />, label: "Full Name", value: profile.fullName },
      { icon: <Mail />, label: "Email Address", value: profile.email },
      { icon: <ShieldCheck />, label: "Aadhaar Number", value: profile.aadhaarNumber },
      { icon: <KeySquare />, label: "Role", value: profile.role, isCapitalized: true },
    ]

    // Add role-specific details
    if (profile.role === "employee" && profile.employee) {
      baseDetails.push(
        { icon: <Building />, label: "Department", value: profile.employee.department },
        { icon: <Award />, label: "Designation", value: profile.employee.designation },
        { icon: <KeySquare />, label: "Role Level", value: profile.employee.roleLevel, isCapitalized: true },
      )
    }

    if (profile.role === "paralegal" && profile.paralegal) {
      baseDetails.push(
        { icon: <Phone />, label: "Phone Number", value: profile.paralegal.phoneNumber },
        {
          icon: <Award />,
          label: "Areas of Expertise",
          value: profile.paralegal.areasOfExpertise?.join(", ") || "Not specified",
        },
      )
    }

    if (profile.role === "admin" && profile.admin) {
      baseDetails.push(
        { icon: <Award />, label: "Admin Role", value: profile.admin.adminRole },
        { icon: <KeySquare />, label: "Status", value: profile.admin.status, isCapitalized: true },
        {
          icon: <MapPin />,
          label: "Assigned Districts",
          value: profile.admin.assignedDistricts?.join(", ") || "Not assigned",
        },
      )
    }

    return baseDetails
  }

  const profileDetails = getProfileDetails()

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-4xl"
    >
      <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-8">
        <div className="flex items-center gap-4 mb-8">
          <div className="w-16 h-16 bg-cyan-100 text-cyan-600 rounded-full flex items-center justify-center">
            <User size={32} />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-slate-900">{profile.fullName}</h1>
            <p className="text-slate-600">Your personal account details</p>
          </div>
        </div>

        <div className="space-y-4">
          {profileDetails.map((detail, index) => (
            <motion.div
              key={detail.label}
              className="flex items-center p-4 bg-slate-50 rounded-lg border border-slate-200 hover:bg-slate-100 transition-colors"
              variants={itemVariants}
              initial="hidden"
              animate="visible"
              transition={{ delay: index * 0.1 }}
            >
              <div className="flex items-center gap-4 w-1/3 text-slate-600">
                <div className="text-cyan-600">{detail.icon}</div>
                <span className="font-semibold">{detail.label}</span>
              </div>
              <span className={`text-slate-900 font-medium ${detail.isCapitalized ? "capitalize" : ""}`}>
                {detail.value}
              </span>
            </motion.div>
          ))}
        </div>

        {/* Account Created Date */}
        <div className="mt-8 pt-6 border-t border-slate-200">
          <div className="flex items-center gap-3 text-slate-500">
            <Calendar size={16} />
            <span className="text-sm">
              Account created on{" "}
              {new Date(profile.createdAt).toLocaleDateString("en-IN", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

export default ProfilePage
