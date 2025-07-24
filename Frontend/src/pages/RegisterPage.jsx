"use client"

import { useState, useEffect } from "react"
import { useAuth } from "../context/AuthContext"
import { Link, Navigate } from "react-router-dom"
import Spinner from "../components/Spinner"
import {
  User,
  Mail,
  Lock,
  CreditCard,
  Users,
  Building,
  Phone,
  Award,
  MapPin,
  Eye,
  EyeOff,
  Scale,
  ArrowRight,
  Search,
} from "lucide-react"
import apiClient from "../api/axiosConfig"
import toast from "react-hot-toast"
import { useTranslation } from "react-i18next"

const RegisterPage = () => {
  const { register, isAuthenticated, isLoading } = useAuth()
  const { t } = useTranslation()
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    aadhaarNumber: "",
    role: "citizen",
    phoneNumber: "",
    department: "",
    designation: "",
    roleLevel: "staff",
    kioskId: "",
    areasOfExpertise: [],
    assignedDistricts: [],
    status: "active",
    adminRole: "DistrictAdmin",
  })
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [kiosks, setKiosks] = useState([])
  const [loadingKiosks, setLoadingKiosks] = useState(false)
  const [kioskSearch, setKioskSearch] = useState("")
  const [filteredKiosks, setFilteredKiosks] = useState([])

  useEffect(() => {
    if (formData.role === "employee") {
      fetchKiosks()
    }
  }, [formData.role])

  useEffect(() => {
    if (kioskSearch.trim()) {
      const filtered = kiosks.filter(
        (kiosk) =>
          kiosk.location.toLowerCase().includes(kioskSearch.toLowerCase()) ||
          kiosk.village.toLowerCase().includes(kioskSearch.toLowerCase()) ||
          kiosk.district.toLowerCase().includes(kioskSearch.toLowerCase()) ||
          kiosk.organizationName.toLowerCase().includes(kioskSearch.toLowerCase()) ||
          kiosk.organizationType.toLowerCase().includes(kioskSearch.toLowerCase()),
      )
      setFilteredKiosks(filtered)
    } else {
      setFilteredKiosks(kiosks)
    }
  }, [kioskSearch, kiosks])

  const fetchKiosks = async () => {
    setLoadingKiosks(true)
    try {
      const response = await apiClient.get("/kiosks")
      const kioskData = response.data.data || response.data || []
      setKiosks(kioskData)
      setFilteredKiosks(kioskData)
    } catch (err) {
      console.error("Failed to fetch kiosks:", err)
      toast.error("Failed to load kiosks")
    } finally {
      setLoadingKiosks(false)
    }
  }

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target

    if (name === "areasOfExpertise") {
      const currentAreas = formData.areasOfExpertise || []
      if (checked) {
        setFormData({ ...formData, areasOfExpertise: [...currentAreas, value] })
      } else {
        setFormData({ ...formData, areasOfExpertise: currentAreas.filter((area) => area !== value) })
      }
    } else if (name === "assignedDistricts") {
      setFormData({
        ...formData,
        assignedDistricts: value
          .split(",")
          .map((d) => d.trim())
          .filter((d) => d),
      })
    } else {
      setFormData({ ...formData, [name]: value })
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const submitData = { ...formData }

      if (formData.role === "citizen") {
        delete submitData.department
        delete submitData.designation
        delete submitData.roleLevel
        delete submitData.kioskId
        delete submitData.areasOfExpertise
        delete submitData.assignedDistricts
        delete submitData.status
        delete submitData.adminRole
      } else if (formData.role === "employee") {
        delete submitData.areasOfExpertise
        delete submitData.assignedDistricts
        delete submitData.status
        delete submitData.adminRole

        if (!submitData.kioskId) {
          throw new Error(t("registerPage.errorKioskRequired"))
        }
        if (!submitData.department) {
          throw new Error(t("registerPage.errorDepartmentRequired"))
        }
        if (!submitData.designation) {
          throw new Error(t("registerPage.errorDesignationRequired"))
        }
      } else if (formData.role === "paralegal") {
        delete submitData.department
        delete submitData.designation
        delete submitData.roleLevel
        delete submitData.kioskId
        delete submitData.assignedDistricts
        delete submitData.status
        delete submitData.adminRole

        if (!submitData.phoneNumber) {
          throw new Error(t("registerPage.errorPhoneRequired"))
        }
        if (!submitData.areasOfExpertise || submitData.areasOfExpertise.length === 0) {
          throw new Error(t("registerPage.errorExpertiseRequired"))
        }
      } else if (formData.role === "admin") {
        delete submitData.department
        delete submitData.designation
        delete submitData.roleLevel
        delete submitData.kioskId
        delete submitData.areasOfExpertise
      }

      await register(submitData)
    } catch (err) {
      setError(err.message || "Registration failed.")
    } finally {
      setLoading(false)
    }
  }

  const renderRoleSpecificFields = () => {
    switch (formData.role) {
      case "employee":
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">{t("registerPage.kioskAssignmentLabel")}</label>
              <div className="relative mb-3">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
                <input
                  type="text"
                  placeholder={t("registerPage.kioskSearchPlaceholder")}
                  value={kioskSearch}
                  onChange={(e) => setKioskSearch(e.target.value)}
                  className="input-style pl-12"
                />
              </div>
              <div className="relative">
                <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
                <select
                  name="kioskId"
                  value={formData.kioskId}
                  onChange={handleChange}
                  required
                  className="input-style pl-12 appearance-none"
                  disabled={loadingKiosks}
                >
                  <option value="">{loadingKiosks ? t("registerPage.loadingKiosks") : t("registerPage.selectKiosk")}</option>
                  {filteredKiosks.map((kiosk) => (
                    <option key={kiosk._id} value={kiosk._id}>
                      {kiosk.location} - {kiosk.village}, {kiosk.district} ({kiosk.organizationType}:{" "}
                      {kiosk.organizationName})
                    </option>
                  ))}
                </select>
              </div>
              {loadingKiosks && <p className="text-xs text-slate-500 mt-1">{t("registerPage.loadingKiosksHelper")}</p>}
              {kioskSearch && filteredKiosks.length === 0 && !loadingKiosks && (
                <p className="text-xs text-orange-600 mt-1">{t("registerPage.noKiosksFound")}</p>
              )}
              <p className="text-xs text-slate-500 mt-1">
                {t("registerPage.kioskSearchHelper")}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">{t("registerPage.departmentLabel")}</label>
                <div className="relative">
                  <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
                  <input
                    name="department"
                    placeholder={t("registerPage.departmentPlaceholder")}
                    value={formData.department}
                    onChange={handleChange}
                    required
                    className="input-style pl-12"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">{t("registerPage.designationLabel")}</label>
                <div className="relative">
                  <Award className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
                  <input
                    name="designation"
                    placeholder={t("registerPage.designationPlaceholder")}
                    value={formData.designation}
                    onChange={handleChange}
                    required
                    className="input-style pl-12"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">{t("registerPage.roleLevelLabel")}</label>
              <div className="grid grid-cols-2 gap-4">
                {["staff", "manager"].map((level) => (
                  <label
                    key={level}
                    className={`flex items-center justify-center p-4 rounded-lg border-2 cursor-pointer transition-all ${
                      formData.roleLevel === level
                        ? "border-cyan-500 bg-cyan-50 text-cyan-700"
                        : "border-slate-300 bg-white text-slate-700 hover:border-slate-400"
                    }`}
                  >
                    <input
                      type="radio"
                      name="roleLevel"
                      value={level}
                      checked={formData.roleLevel === level}
                      onChange={handleChange}
                      className="sr-only"
                    />
                    <div className="text-center">
                      <div className="font-medium capitalize">{t(`registerPage.roleLevels.${level}`)}</div>
                      <div className="text-xs opacity-75">{t(`registerPage.roleLevelDescriptions.${level}`)}</div>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          </div>
        )

      case "paralegal":
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">{t("registerPage.phoneLabel")}</label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
                <input
                  name="phoneNumber"
                  placeholder={t("registerPage.phonePlaceholder")}
                  value={formData.phoneNumber}
                  onChange={handleChange}
                  required
                  pattern="\d{10}"
                  title="Must be 10 digits"
                  className="input-style pl-12"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-3">{t("registerPage.expertiseLabel")}</label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {["Aadhaar", "Pension", "Land", "Certificates", "Fraud", "Court", "Welfare"].map((area) => (
                  <label
                    key={area}
                    className={`flex items-center justify-center p-3 rounded-lg border cursor-pointer transition-all ${
                      formData.areasOfExpertise.includes(area)
                        ? "border-cyan-500 bg-cyan-50 text-cyan-700"
                        : "border-slate-300 bg-white text-slate-700 hover:border-slate-400"
                    }`}
                  >
                    <input
                      type="checkbox"
                      name="areasOfExpertise"
                      value={area}
                      checked={formData.areasOfExpertise.includes(area)}
                      onChange={handleChange}
                      className="sr-only"
                    />
                    <span className="text-sm font-medium">{t(`registerPage.expertiseAreas.${area}`)}</span>
                  </label>
                ))}
              </div>
              <p className="text-xs text-slate-500 mt-2">{t("registerPage.expertiseHelper")}</p>
            </div>
          </div>
        )

      case "admin":
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">{t("registerPage.adminRoleLabel")}</label>
              <div className="relative">
                <Award className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
                <select
                  name="adminRole"
                  value={formData.adminRole}
                  onChange={handleChange}
                  required
                  className="input-style pl-12 appearance-none"
                >
                  <option value="SuperAdmin">{t('registerPage.adminRoles.SuperAdmin')}</option>
                  <option value="DistrictAdmin">{t('registerPage.adminRoles.DistrictAdmin')}</option>
                  <option value="DataEntryOperator">{t('registerPage.adminRoles.DataEntryOperator')}</option>
                  <option value="KioskAdmin">{t('registerPage.adminRoles.KioskAdmin')}</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">{t("registerPage.statusLabel")}</label>
              <div className="grid grid-cols-3 gap-4">
                {["active", "inactive", "suspended"].map((status) => (
                  <label
                    key={status}
                    className={`flex items-center justify-center p-4 rounded-lg border-2 cursor-pointer transition-all ${
                      formData.status === status
                        ? "border-cyan-500 bg-cyan-50 text-cyan-700"
                        : "border-slate-300 bg-white text-slate-700 hover:border-slate-400"
                    }`}
                  >
                    <input
                      type="radio"
                      name="status"
                      value={status}
                      checked={formData.status === status}
                      onChange={handleChange}
                      className="sr-only"
                    />
                    <div className="text-center">
                      <div className="font-medium capitalize">{t(`registerPage.statuses.${status}`)}</div>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">{t("registerPage.assignedDistrictsLabel")}</label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
                <input
                  name="assignedDistricts"
                  placeholder={t("registerPage.assignedDistrictsPlaceholder")}
                  value={formData.assignedDistricts.join(", ")}
                  onChange={handleChange}
                  className="input-style pl-12"
                />
              </div>
              <p className="text-xs text-slate-500 mt-1">{t("registerPage.assignedDistrictsHelper")}</p>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  const getRoleDescription = (role) => {
    return t(`registerPage.roleDescriptions.${role}`)
  }

  if (isLoading) return <Spinner />
  if (isAuthenticated) return <Navigate to="/dashboard" replace />

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 py-8 px-4 flex items-center justify-center">
      <div className="w-full max-w-6xl mx-auto flex rounded-2xl shadow-2xl overflow-hidden glass-card h-[90vh]">
        {/* Left side - Image */}
        <div className="hidden lg:block lg:w-2/5 relative flex-shrink-0">
          <img
            src="/login-background.png"
            alt="Community hands together, a sign of unity and support"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/20 to-blue-500/20"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center text-white p-8">
              <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4 backdrop-blur-sm">
                <Scale size={32} />
              </div>
              <h3 className="text-2xl font-bold mb-2">{t("registerPage.imagePanelTitle")}</h3>
              <p className="text-white/80">{t("registerPage.imagePanelSubtitle")}</p>
            </div>
          </div>
        </div>

        {/* Right side - Form */}
        <div className="w-full lg:w-3/5 flex flex-col h-full">
          <div className="p-8 lg:p-12 pb-4 flex-shrink-0">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-slate-900 mb-2">{t("registerPage.title")}</h2>
              <p className="text-slate-600">{t("registerPage.subtitle")}</p>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg mb-6 text-center">{error}</div>
            )}
          </div>

          <div className="flex-1 overflow-y-auto px-8 lg:px-12">
            <form onSubmit={handleSubmit} className="space-y-6 pb-8">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-3">{t("registerPage.selectRole")}</label>
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { value: "citizen", label: "Citizen", icon: <User size={20} /> },
                    { value: "employee", label: "Employee", icon: <Users size={20} /> },
                    { value: "paralegal", label: "Paralegal", icon: <Award size={20} /> },
                    { value: "admin", label: "Admin", icon: <Building size={20} /> },
                  ].map((role) => (
                    <label
                      key={role.value}
                      className={`flex items-center gap-3 p-4 rounded-lg border-2 cursor-pointer transition-all ${
                        formData.role === role.value
                          ? "border-cyan-500 bg-cyan-50 text-cyan-700"
                          : "border-slate-300 bg-white text-slate-700 hover:border-slate-400"
                      }`}
                    >
                      <input
                        type="radio"
                        name="role"
                        value={role.value}
                        checked={formData.role === role.value}
                        onChange={handleChange}
                        className="sr-only"
                      />
                      <div className="flex-shrink-0">{role.icon}</div>
                      <div>
                        <div className="font-medium">{t(`registerPage.roles.${role.value}`)}</div>
                        <div className="text-xs opacity-75">{getRoleDescription(role.value)}</div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">{t("registerPage.fullNameLabel")}</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
                    <input
                      name="fullName"
                      placeholder={t("registerPage.fullNamePlaceholder")}
                      value={formData.fullName}
                      onChange={handleChange}
                      required
                      className="input-style pl-12"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">{t("registerPage.emailLabel")}</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
                      <input
                        name="email"
                        type="email"
                        placeholder={t("registerPage.emailPlaceholder")}
                        value={formData.email}
                        onChange={handleChange}
                        required
                        className="input-style pl-12"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">{t("registerPage.passwordLabel")}</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
                      <input
                        name="password"
                        type={showPassword ? "text" : "password"}
                        placeholder={t("registerPage.passwordPlaceholder")}
                        value={formData.password}
                        onChange={handleChange}
                        required
                        minLength={6}
                        className="input-style pl-12 pr-12"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                      >
                        {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                      </button>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">{t("registerPage.aadhaarLabel")}</label>
                  <div className="relative">
                    <CreditCard className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
                    <input
                      name="aadhaarNumber"
                      placeholder={t("registerPage.aadhaarPlaceholder")}
                      value={formData.aadhaarNumber}
                      onChange={handleChange}
                      required
                      pattern="\d{12}"
                      title="Must be 12 digits"
                      className="input-style pl-12"
                    />
                  </div>
                </div>
              </div>

              {renderRoleSpecificFields()}

              <button type="submit" disabled={loading} className="w-full btn-primary text-lg py-4 group">
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    {t("registerPage.creatingAccountButton")}
                  </>
                ) : (
                  <>
                    {t("registerPage.createAccountButton")}
                    <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>

              <p className="mt-8 text-center text-sm text-slate-600">
                {t("registerPage.alreadyHaveAccount")}{" "}
                <Link to="/login" className="font-medium text-cyan-600 hover:text-cyan-700 transition-colors">
                  {t("registerPage.signInLink")}
                </Link>
              </p>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}

export default RegisterPage