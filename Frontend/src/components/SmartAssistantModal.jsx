"use client"

import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Mic,
  MicOff,
  Send,
  X,
  MessageSquare,
  Loader2,
  Sparkles,
  FileText,
  AlertCircle,
  User,
  Building,
  Users,
  Scale,
  HelpCircle,
  Globe,
} from "lucide-react"
import toast from "react-hot-toast"
import apiClient from "../api/axiosConfig"
import { useTranslation } from "react-i18next"
import { useAuth } from "../context/AuthContext"

const modalVariants = {
  hidden: { opacity: 0, y: 50, scale: 0.9 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { type: "spring", damping: 15, stiffness: 200 } },
  exit: { opacity: 0, y: -50, scale: 0.9, transition: { duration: 0.2 } },
}

const SmartAssistantModal = ({ isOpen, onClose, onSuccess }) => {
  const { t, i18n } = useTranslation()
  const { user } = useAuth()
  const [mode, setMode] = useState("text") // 'text' or 'voice'
  const [assistantType, setAssistantType] = useState("legal") // 'legal' or 'data'
  const [isRecording, setIsRecording] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [input, setInput] = useState("")
  const [conversation, setConversation] = useState([])
  const [currentStep, setCurrentStep] = useState(null)
  const [formData, setFormData] = useState({})
  const recognitionRef = useRef(null)

  // Role-based permissions
  const getRolePermissions = (userRole) => {
    switch (userRole) {
      case "citizen":
        return ["issue", "document"]
      case "employee":
        return ["issue", "document", "paralegal"] // Employees can help create paralegals
      case "admin":
        return ["issue", "document", "user", "employee", "kiosk", "paralegal"]
      case "paralegal":
        return ["issue", "document"]
      default:
        return ["issue", "document"]
    }
  }

  const allowedActions = getRolePermissions(user?.role)

  // Legal knowledge base for legal assistant
  const legalKnowledge = {
    en: {
      aadhaar: {
        update:
          "To update your Aadhaar card: 1) Visit nearest Aadhaar center with documents 2) Fill update form 3) Pay ₹50 fee 4) Get acknowledgment receipt. Process takes 90 days.",
        lost: "For lost Aadhaar: 1) File FIR at police station 2) Visit Aadhaar center with FIR copy 3) Apply for duplicate with ₹50 fee 4) Provide biometric verification.",
        mobile:
          "To update mobile in Aadhaar: 1) Visit Aadhaar center 2) Fill demographic update form 3) Provide new mobile number 4) Pay ₹50 fee 5) Verify OTP.",
      },
      pension: {
        eligibility:
          "Old Age Pension eligibility: 1) Age 60+ years 2) BPL family 3) No regular income 4) Indian citizen. Apply at Block/District office with age proof, income certificate, BPL card.",
        widow:
          "Widow Pension: For women above 18 whose husband died. Required: Death certificate, age proof, income certificate, bank details. Apply at local tehsil office.",
        disability:
          "Disability Pension: For 40%+ disability. Required: Disability certificate from civil surgeon, income proof, bank details. Monthly amount varies by state.",
      },
      land: {
        dispute:
          "Land Dispute Resolution: 1) Collect all land documents 2) File complaint at tehsil office 3) If unresolved, approach civil court 4) Consider mediation through Lok Adalat.",
        mutation:
          "Land Mutation Process: 1) Apply at tehsil office 2) Submit sale deed, NOC 3) Pay stamp duty 4) Revenue officer verification 5) Update in revenue records.",
        records:
          "Land Records: Get from tehsil office or online portal. Required: Survey number, owner name. Documents include: Khatauni, Khasra, Jamabandi.",
      },
      court: {
        summons:
          "Court Summons Response: 1) Don't ignore 2) Appear on given date 3) Bring all relevant documents 4) Consider hiring lawyer 5) If can't attend, file application for adjournment.",
        bail: "Bail Application: 1) File through lawyer 2) Provide surety 3) Submit required documents 4) Attend all hearings 5) Follow bail conditions strictly.",
        fir: "FIR Filing: 1) Go to nearest police station 2) Give written complaint 3) Ensure FIR copy given 4) Note FIR number 5) Follow up regularly.",
      },
      certificates: {
        income:
          "Income Certificate: Apply at tehsil office with salary slips, property documents, affidavit. Valid for 1 year. Required for scholarships, loans.",
        caste:
          "Caste Certificate: Apply at tehsil office with birth certificate, school records, family documents. Permanent validity. Required for reservations.",
        domicile:
          "Domicile Certificate: Apply with birth certificate, school records, property documents. Shows permanent residence. Required for state quotas.",
      },
    },
    hi: {
      aadhaar: {
        update:
          "आधार कार्ड अपडेट करने के लिए: 1) दस्तावेजों के साथ निकटतम आधार केंद्र जाएं 2) अपडेट फॉर्म भरें 3) ₹50 फीस दें 4) पावती रसीद लें। प्रक्रिया में 90 दिन लगते हैं।",
        lost: "खोए आधार के लिए: 1) पुलिस स्टेशन में FIR दर्ज करें 2) FIR कॉपी के साथ आधार केंद्र जाएं 3) ₹50 फीस के साथ डुप्लिकेट के लिए आवेदन करें 4) बायोमेट्रिक सत्यापन दें।",
        mobile:
          "आधार में मोबाइल अपडेट करने के लिए: 1) आधार केंद्र जाएं 2) जनसांख्यिकीय अपडेट फॉर्म भरें 3) नया मोबाइल नंबर दें 4) ₹50 फीस दें 5) OTP सत्यापित करें।",
      },
      pension: {
        eligibility:
          "वृद्धावस्था पेंशन पात्रता: 1) 60+ वर्ष आयु 2) BPL परिवार 3) नियमित आय नहीं 4) भारतीय नागरिक। आयु प्रमाण, आय प्रमाणपत्र, BPL कार्ड के साथ ब्लॉक/जिला कार्यालय में आवेदन करें।",
        widow:
          "विधवा पेंशन: 18 वर्ष से अधिक महिलाओं के लिए जिनके पति की मृत्यु हो गई। आवश्यक: मृत्यु प्रमाणपत्र, आयु प्रमाण, आय प्रमाणपत्र, बैंक विवरण। स्थानीय तहसील कार्यालय में आवेदन करें।",
        disability:
          "विकलांगता पेंशन: 40%+ विकलांगता के लिए। आवश्यक: सिविल सर्जन से विकलांगता प्रमाणपत्र, आय प्रमाण, बैंक विवरण। मासिक राशि राज्य के अनुसार अलग होती है।",
      },
    },
  }

  // Initialize speech recognition
  useEffect(() => {
    if (!("webkitSpeechRecognition" in window)) return

    const recognition = new window.webkitSpeechRecognition()
    recognition.continuous = false
    recognition.interimResults = false
    recognition.lang = i18n.language === "hi" ? "hi-IN" : "en-US"

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript
      setInput(transcript)
      handleInput(transcript)
    }

    recognition.onerror = (event) => {
      toast.error(`Speech recognition error: ${event.error}`)
      setIsRecording(false)
    }

    recognition.onend = () => setIsRecording(false)
    recognitionRef.current = recognition
  }, [i18n.language])

  const addMessage = (message, isUser = false) => {
    setConversation((prev) => [...prev, { message, isUser, timestamp: Date.now() }])
  }

  const handleVoiceToggle = () => {
    if (isRecording) {
      recognitionRef.current?.stop()
    } else {
      setInput("")
      if (recognitionRef.current) {
        recognitionRef.current.lang = i18n.language === "hi" ? "hi-IN" : "en-US"
        recognitionRef.current.start()
      }
      setIsRecording(true)
    }
  }

  const handleInput = async (inputText) => {
    if (!inputText.trim()) return

    addMessage(inputText, true)
    setInput("")
    setIsProcessing(true)

    try {
      if (assistantType === "legal") {
        handleLegalQuery(inputText)
      } else {
        handleDataCreation(inputText)
      }
    } catch (error) {
      addMessage(`Error: ${error.message}`)
    } finally {
      setIsProcessing(false)
    }
  }

  const handleLegalQuery = (query) => {
    const lowerQuery = query.toLowerCase()
    const currentLang = i18n.language
    const knowledge = legalKnowledge[currentLang] || legalKnowledge.en

    let response = ""

    // Aadhaar related queries
    if (lowerQuery.includes("aadhaar") || lowerQuery.includes("आधार")) {
      if (lowerQuery.includes("update") || lowerQuery.includes("अपडेट")) {
        response = knowledge.aadhaar.update
      } else if (lowerQuery.includes("lost") || lowerQuery.includes("खो")) {
        response = knowledge.aadhaar.lost
      } else if (lowerQuery.includes("mobile") || lowerQuery.includes("मोबाइल")) {
        response = knowledge.aadhaar.mobile
      } else {
        response = knowledge.aadhaar.update
      }
    }
    // Pension related queries
    else if (lowerQuery.includes("pension") || lowerQuery.includes("पेंशन")) {
      if (lowerQuery.includes("widow") || lowerQuery.includes("विधवा")) {
        response = knowledge.pension.widow
      } else if (lowerQuery.includes("disability") || lowerQuery.includes("विकलांग")) {
        response = knowledge.pension.disability
      } else {
        response = knowledge.pension.eligibility
      }
    }
    // Land related queries
    else if (lowerQuery.includes("land") || lowerQuery.includes("जमीन") || lowerQuery.includes("भूमि")) {
      if (lowerQuery.includes("dispute") || lowerQuery.includes("विवाद")) {
        response = knowledge.land.dispute
      } else if (lowerQuery.includes("mutation") || lowerQuery.includes("म्यूटेशन")) {
        response = knowledge.land.mutation
      } else {
        response = knowledge.land.records
      }
    }
    // Court related queries
    else if (lowerQuery.includes("court") || lowerQuery.includes("कोर्ट") || lowerQuery.includes("न्यायालय")) {
      if (lowerQuery.includes("summons") || lowerQuery.includes("समन")) {
        response = knowledge.court.summons
      } else if (lowerQuery.includes("bail") || lowerQuery.includes("जमानत")) {
        response = knowledge.court.bail
      } else if (lowerQuery.includes("fir")) {
        response = knowledge.court.fir
      } else {
        response = knowledge.court.summons
      }
    }
    // Certificate related queries
    else if (lowerQuery.includes("certificate") || lowerQuery.includes("प्रमाणपत्र")) {
      if (lowerQuery.includes("income") || lowerQuery.includes("आय")) {
        response = knowledge.certificates.income
      } else if (lowerQuery.includes("caste") || lowerQuery.includes("जाति")) {
        response = knowledge.certificates.caste
      } else if (lowerQuery.includes("domicile") || lowerQuery.includes("निवास")) {
        response = knowledge.certificates.domicile
      } else {
        response = knowledge.certificates.income
      }
    } else {
      response =
        currentLang === "hi"
          ? "मैं आधार, पेंशन, भूमि, न्यायालय और प्रमाणपत्र संबंधी कानूनी सहायता प्रदान कर सकता हूं। कृपया अपना प्रश्न पूछें।"
          : "I can help with legal matters related to Aadhaar, pension, land, court, and certificates. Please ask your specific question."
    }

    addMessage(response)
  }

  const handleDataCreation = async (inputText) => {
    if (!currentStep) {
      const command = parseInitialCommand(inputText)
      if (command) {
        setCurrentStep(command)
        addMessage(getNextQuestion(command, {}))
      } else {
        addMessage(
          i18n.language === "hi"
            ? "मैं आपको मुद्दे, दस्तावेज़ या अन्य डेटा बनाने में मदद कर सकता हूं। 'मुद्दा बनाएं' या 'दस्तावेज़ जोड़ें' कहने की कोशिश करें।"
            : "I can help you create issues, documents, or manage other data. Try saying 'create issue' or 'add document'.",
        )
      }
    } else {
      const updatedData = await handleStepInput(inputText)
      const nextQuestion = getNextQuestion(currentStep, updatedData)

      if (nextQuestion === "COMPLETE") {
        await submitData()
      } else {
        addMessage(nextQuestion)
      }
    }
  }

  const parseInitialCommand = (text) => {
    const lowerText = text.toLowerCase()

    if (
      lowerText.includes("issue") ||
      lowerText.includes("problem") ||
      lowerText.includes("legal") ||
      lowerText.includes("मुद्दा") ||
      lowerText.includes("समस्या")
    ) {
      return allowedActions.includes("issue") ? { type: "issue", data: {} } : null
    }
    if (
      lowerText.includes("document") ||
      lowerText.includes("file") ||
      lowerText.includes("upload") ||
      lowerText.includes("दस्तावेज़") ||
      lowerText.includes("फाइल")
    ) {
      return allowedActions.includes("document") ? { type: "document", data: {} } : null
    }
    if (lowerText.includes("user") || lowerText.includes("citizen") || lowerText.includes("उपयोगकर्ता")) {
      return allowedActions.includes("user") ? { type: "user", data: {} } : null
    }
    if (lowerText.includes("employee") || lowerText.includes("staff") || lowerText.includes("कर्मचारी")) {
      return allowedActions.includes("employee") ? { type: "employee", data: {} } : null
    }
    if (lowerText.includes("kiosk") || lowerText.includes("center") || lowerText.includes("केंद्र")) {
      return allowedActions.includes("kiosk") ? { type: "kiosk", data: {} } : null
    }
    if (lowerText.includes("paralegal") || lowerText.includes("lawyer") || lowerText.includes("वकील")) {
      return allowedActions.includes("paralegal") ? { type: "paralegal", data: {} } : null
    }

    return null
  }

  const handleStepInput = async (inputText) => {
    let updatedData = { ...formData }

    switch (currentStep.type) {
      case "issue":
        updatedData = handleIssueStep(inputText, updatedData)
        break
      case "document":
        updatedData = handleDocumentStep(inputText, updatedData)
        break
      case "user":
        updatedData = handleUserStep(inputText, updatedData)
        break
      case "employee":
        updatedData = handleEmployeeStep(inputText, updatedData)
        break
      case "kiosk":
        updatedData = handleKioskStep(inputText, updatedData)
        break
      case "paralegal":
        updatedData = handleParalegalStep(inputText, updatedData)
        break
    }

    setFormData(updatedData)
    setCurrentStep({ ...currentStep, data: updatedData })
    return updatedData
  }

  const handleIssueStep = (input, data) => {
    if (!data.issueType) {
      const issueTypes = [
        "Aadhaar Issue",
        "Pension Issue",
        "Land Dispute",
        "Court Summon",
        "Certificate Missing",
        "Fraud Case",
        "Other",
      ]
      const foundType = issueTypes.find(
        (type) =>
          input.toLowerCase().includes(type.toLowerCase()) ||
          input.toLowerCase().includes(type.toLowerCase().replace(" ", "")),
      )
      data.issueType =
        foundType ||
        (input.includes("आधार")
          ? "Aadhaar Issue"
          : input.includes("पेंशन")
            ? "Pension Issue"
            : input.includes("जमीन")
              ? "Land Dispute"
              : input)
    } else if (!data.description) {
      data.description = input
    }
    return data
  }

  const handleDocumentStep = (input, data) => {
    if (!data.documentType) {
      data.documentType = input
    } else if (!data.issueId && input.toLowerCase() !== "none" && input.toLowerCase() !== "नहीं") {
      data.issueId = input
    }
    return data
  }

  const handleUserStep = (input, data) => {
    if (!data.fullName) {
      data.fullName = input
    } else if (!data.email) {
      data.email = input
    } else if (!data.aadhaarNumber) {
      data.aadhaarNumber = input
    } else if (!data.password) {
      data.password = input
    } else if (!data.role) {
      const roles = ["citizen", "paralegal", "employee", "admin"]
      const foundRole = roles.find((r) => input.toLowerCase().includes(r))
      data.role = foundRole || "citizen"
    }
    return data
  }

  const handleEmployeeStep = (input, data) => {
    if (!data.fullName) {
      data.fullName = input
    } else if (!data.email) {
      data.email = input
    } else if (!data.aadhaarNumber) {
      data.aadhaarNumber = input
    } else if (!data.password) {
      data.password = input
    } else if (!data.department) {
      data.department = input
    } else if (!data.designation) {
      data.designation = input
    }
    return data
  }

  const handleKioskStep = (input, data) => {
    if (!data.location) {
      data.location = input
    } else if (!data.village) {
      data.village = input
    } else if (!data.district) {
      data.district = input
    } else if (!data.operatorName) {
      data.operatorName = input
    } else if (!data.organizationType) {
      const orgTypes = ["NALSA", "DLSA", "SHG", "CSR", "NGO", "Independent"]
      const foundType = orgTypes.find((type) => input.toLowerCase().includes(type.toLowerCase()))
      data.organizationType = foundType || "Independent"
    } else if (!data.organizationName) {
      data.organizationName = input
    }
    return data
  }

  const handleParalegalStep = (input, data) => {
    if (!data.fullName) {
      data.fullName = input
    } else if (!data.email) {
      data.email = input
    } else if (!data.aadhaarNumber) {
      data.aadhaarNumber = input
    } else if (!data.password) {
      data.password = input
    } else if (!data.phoneNumber) {
      data.phoneNumber = input
    } else if (!data.areasOfExpertise) {
      const areas = ["Aadhaar", "Pension", "Land", "Certificates", "Fraud", "Court", "Welfare"]
      const inputAreas = input.split(",").map((s) => s.trim())
      const validAreas = inputAreas.filter((area) =>
        areas.some((validArea) => area.toLowerCase().includes(validArea.toLowerCase())),
      )
      data.areasOfExpertise = validAreas.length > 0 ? validAreas : ["Aadhaar"]
    }
    return data
  }

  const getNextQuestion = (step, data) => {
    const isHindi = i18n.language === "hi"

    switch (step.type) {
      case "issue":
        if (!data.issueType)
          return isHindi
            ? "आपको किस प्रकार की कानूनी समस्या है? (जैसे आधार समस्या, भूमि विवाद, पेंशन समस्या)"
            : "What type of legal issue do you have? (e.g., Aadhaar Issue, Land Dispute, Pension Issue)"
        if (!data.description)
          return isHindi ? "कृपया अपनी समस्या का विस्तार से वर्णन करें:" : "Please describe your issue in detail:"
        return "COMPLETE"

      case "document":
        if (!data.documentType)
          return isHindi
            ? "आप किस प्रकार का दस्तावेज़ जोड़ना चाहते हैं? (जैसे आधार कार्ड, भूमि कागजात)"
            : "What type of document do you want to add? (e.g., Aadhaar Card, Land Papers)"
        if (!data.issueId)
          return isHindi
            ? "यह दस्तावेज़ किस मुद्दे से संबंधित है? (मुद्दा ID दें या 'नहीं' कहें यदि संबंधित नहीं है)"
            : "Enter the Issue ID this document relates to (or 'none' if not related):"
        return "COMPLETE"

      case "user":
        if (!allowedActions.includes("user")) {
          return isHindi
            ? "क्षमा करें, आपको उपयोगकर्ता बनाने की अनुमति नहीं है।"
            : "Sorry, you don't have permission to create users."
        }
        if (!data.fullName) return isHindi ? "पूरा नाम क्या है?" : "What's the full name?"
        if (!data.email) return isHindi ? "ईमेल पता क्या है?" : "What's the email address?"
        if (!data.aadhaarNumber) return isHindi ? "आधार नंबर क्या है? (12 अंक)" : "What's the Aadhaar number? (12 digits)"
        if (!data.password) return isHindi ? "पासवर्ड सेट करें:" : "Set a password:"
        if (!data.role)
          return isHindi
            ? "भूमिका क्या है? (नागरिक, पैरालीगल, कर्मचारी, एडमिन)"
            : "What's the role? (citizen, paralegal, employee, admin)"
        return "COMPLETE"

      case "employee":
        if (!allowedActions.includes("employee")) {
          return isHindi
            ? "क्षमा करें, आपको कर्मचारी बनाने की अनुमति नहीं है।"
            : "Sorry, you don't have permission to create employees."
        }
        if (!data.fullName) return isHindi ? "कर्मचारी का पूरा नाम क्या है?" : "What's the employee's full name?"
        if (!data.email) return isHindi ? "ईमेल पता क्या है?" : "What's the email address?"
        if (!data.aadhaarNumber) return isHindi ? "आधार नंबर क्या है?" : "What's the Aadhaar number?"
        if (!data.password) return isHindi ? "पासवर्ड सेट करें:" : "Set a password:"
        if (!data.department) return isHindi ? "कौन सा विभाग?" : "Which department?"
        if (!data.designation) return isHindi ? "पदनाम क्या है?" : "What's the designation?"
        return "COMPLETE"

      case "kiosk":
        if (!allowedActions.includes("kiosk")) {
          return isHindi
            ? "क्षमा करें, आपको कियोस्क बनाने की अनुमति नहीं है।"
            : "Sorry, you don't have permission to create kiosks."
        }
        if (!data.location) return isHindi ? "कियोस्क कहाँ स्थित है?" : "Where is the kiosk located?"
        if (!data.village) return isHindi ? "कौन सा गाँव?" : "Which village?"
        if (!data.district) return isHindi ? "कौन सा जिला?" : "Which district?"
        if (!data.operatorName) return isHindi ? "ऑपरेटर कौन है?" : "Who is the operator?"
        if (!data.organizationType) return isHindi ? "संगठन का प्रकार क्या है?" : "What type of organization?"
        if (!data.organizationName) return isHindi ? "संगठन का नाम क्या है?" : "What's the organization name?"
        return "COMPLETE"

      case "paralegal":
        if (!allowedActions.includes("paralegal")) {
          return isHindi
            ? "क्षमा करें, आपको पैरालीगल बनाने की अनुमति नहीं है।"
            : "Sorry, you don't have permission to create paralegals."
        }
        if (!data.fullName) return isHindi ? "पैरालीगल का पूरा नाम क्या है?" : "What's the paralegal's full name?"
        if (!data.email) return isHindi ? "ईमेल पता क्या है?" : "What's the email address?"
        if (!data.aadhaarNumber) return isHindi ? "आधार नंबर क्या है?" : "What's the Aadhaar number?"
        if (!data.password) return isHindi ? "पासवर्ड सेट करें:" : "Set a password:"
        if (!data.phoneNumber) return isHindi ? "फोन नंबर क्या है?" : "What's the phone number?"
        if (!data.areasOfExpertise)
          return isHindi
            ? "उनकी विशेषज्ञता के क्षेत्र क्या हैं? (कॉमा से अलग करें)"
            : "What are their areas of expertise? (comma-separated)"
        return "COMPLETE"

      default:
        return isHindi ? "मुझे यकीन नहीं है कि इसमें कैसे मदद करूं।" : "I'm not sure how to help with that."
    }
  }

  const submitData = async () => {
    setIsProcessing(true)
    const loadingToast = toast.loading(`Creating ${currentStep.type}...`)

    try {
      let endpoint = ""
      const payload = formData

      switch (currentStep.type) {
        case "issue":
          endpoint = "/issues"
          break
        case "document":
          endpoint = "/documents"
          // For voice/text, we can't upload files, so use a placeholder
          payload.fileUrl = "https://example.com/placeholder.pdf"
          break
        case "user":
          endpoint = "/auth/register"
          break
        case "employee":
          endpoint = "/auth/register"
          payload.role = "employee"
          break
        case "kiosk":
          endpoint = "/kiosks"
          payload.isActive = true
          payload.employees = []
          break
        case "paralegal":
          endpoint = "/auth/register"
          payload.role = "paralegal"
          break
      }

      await apiClient.post(endpoint, payload)
      const successMsg =
        i18n.language === "hi"
          ? `${currentStep.type} सफलतापूर्वक बनाया गया!`
          : `${currentStep.type.charAt(0).toUpperCase() + currentStep.type.slice(1)} created successfully!`

      toast.success(successMsg, { id: loadingToast })
      addMessage(`✅ ${successMsg}`)
      onSuccess()

      // Reset for next command
      setTimeout(() => {
        setCurrentStep(null)
        setFormData({})
        const nextMsg = i18n.language === "hi" ? "और किस चीज़ में मैं आपकी मदद कर सकता हूं?" : "What else can I help you with?"
        addMessage(nextMsg)
      }, 2000)
    } catch (error) {
      const errorMsg =
        i18n.language === "hi"
          ? `${currentStep.type} बनाने में विफल: ${error.message}`
          : `Failed to create ${currentStep.type}: ${error.message}`

      toast.error(errorMsg, { id: loadingToast })
      addMessage(`❌ ${errorMsg}`)
    } finally {
      setIsProcessing(false)
    }
  }

  const handleClose = () => {
    if (isRecording) recognitionRef.current?.stop()
    setIsRecording(false)
    setIsProcessing(false)
    setInput("")
    setConversation([])
    setCurrentStep(null)
    setFormData({})
    onClose()
  }

  const getIcon = () => {
    if (assistantType === "legal") {
      return <Scale className="text-cyan-400" size={20} />
    }

    switch (currentStep?.type) {
      case "issue":
        return <AlertCircle className="text-red-400" size={20} />
      case "document":
        return <FileText className="text-blue-400" size={20} />
      case "user":
        return <User className="text-green-400" size={20} />
      case "employee":
        return <Users className="text-purple-400" size={20} />
      case "kiosk":
        return <Building className="text-orange-400" size={20} />
      case "paralegal":
        return <User className="text-cyan-400" size={20} />
      default:
        return <Sparkles className="text-cyan-400" size={20} />
    }
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
            className="bg-slate-800 rounded-xl shadow-2xl w-full max-w-2xl border border-slate-700 max-h-[80vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex justify-between items-center p-4 border-b border-slate-700">
              <div className="flex items-center gap-2">
                {getIcon()}
                <h3 className="text-xl font-bold text-white">
                  {assistantType === "legal"
                    ? i18n.language === "hi"
                      ? "कानूनी सहायक"
                      : "Legal Assistant"
                    : "Smart Assistant"}
                  {currentStep && (
                    <span className="text-sm font-normal text-slate-400 ml-2">
                      - {i18n.language === "hi" ? "बना रहा है" : "Creating"} {currentStep.type}
                    </span>
                  )}
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => i18n.changeLanguage(i18n.language === "hi" ? "en" : "hi")}
                  className="p-2 rounded-full text-slate-400 hover:bg-slate-700 transition-colors"
                  title="Switch Language"
                >
                  <Globe size={16} />
                </button>
                <button onClick={handleClose} className="p-1 rounded-full text-slate-400 hover:bg-slate-700">
                  <X />
                </button>
              </div>
            </div>

            {/* Assistant Type Toggle */}
            <div className="p-4 border-b border-slate-700">
              <div className="flex gap-2 mb-3">
                <button
                  onClick={() => setAssistantType("legal")}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                    assistantType === "legal"
                      ? "bg-cyan-600 text-white"
                      : "bg-slate-700 text-slate-300 hover:bg-slate-600"
                  }`}
                >
                  <Scale size={16} />
                  {i18n.language === "hi" ? "कानूनी सहायता" : "Legal Help"}
                </button>
                <button
                  onClick={() => setAssistantType("data")}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                    assistantType === "data"
                      ? "bg-cyan-600 text-white"
                      : "bg-slate-700 text-slate-300 hover:bg-slate-600"
                  }`}
                >
                  <HelpCircle size={16} />
                  {i18n.language === "hi" ? "डेटा सहायक" : "Data Assistant"}
                </button>
              </div>

              {/* Mode Toggle */}
              <div className="flex gap-2">
                <button
                  onClick={() => setMode("text")}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                    mode === "text" ? "bg-green-600 text-white" : "bg-slate-700 text-slate-300 hover:bg-slate-600"
                  }`}
                >
                  <MessageSquare size={16} />
                  {i18n.language === "hi" ? "टेक्स्ट" : "Text"}
                </button>
                <button
                  onClick={() => setMode("voice")}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                    mode === "voice" ? "bg-green-600 text-white" : "bg-slate-700 text-slate-300 hover:bg-slate-600"
                  }`}
                >
                  <Mic size={16} />
                  {i18n.language === "hi" ? "आवाज़" : "Voice"}
                </button>
              </div>
            </div>

            {/* Conversation */}
            <div className="flex-1 p-4 overflow-y-auto space-y-4 min-h-[300px] max-h-[400px]">
              {conversation.length === 0 && (
                <div className="text-center text-slate-400 py-8">
                  {assistantType === "legal" ? (
                    <Scale className="mx-auto mb-4 text-cyan-400" size={48} />
                  ) : (
                    <Sparkles className="mx-auto mb-4 text-cyan-400" size={48} />
                  )}
                  <p className="text-lg mb-2">
                    {assistantType === "legal"
                      ? i18n.language === "hi"
                        ? "आज मैं आपकी कैसे मदद कर सकता हूं?"
                        : "How can I help you with legal matters today?"
                      : i18n.language === "hi"
                        ? "आज मैं आपकी कैसे मदद कर सकता हूं?"
                        : "How can I help you today?"}
                  </p>
                  <p className="text-sm">
                    {assistantType === "legal"
                      ? i18n.language === "hi"
                        ? "पूछें: 'आधार कार्ड कैसे अपडेट करें', 'पेंशन के लिए आवेदन', 'भूमि विवाद'"
                        : "Try: 'How to update Aadhaar', 'Apply for pension', 'Land dispute'"
                      : i18n.language === "hi"
                        ? `कहें: ${allowedActions.includes("issue") ? "'मुद्दा बनाएं'" : ""} ${allowedActions.includes("document") ? "'दस्तावेज़ जोड़ें'" : ""}`
                        : `Try: ${allowedActions.includes("issue") ? "'Create issue'" : ""} ${allowedActions.includes("document") ? "'Add document'" : ""}`}
                  </p>
                </div>
              )}

              {conversation.map((msg, index) => (
                <div key={index} className={`flex ${msg.isUser ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`max-w-[80%] p-3 rounded-lg ${
                      msg.isUser ? "bg-cyan-600 text-white" : "bg-slate-700 text-slate-200"
                    }`}
                  >
                    <div className="whitespace-pre-wrap">{msg.message}</div>
                  </div>
                </div>
              ))}

              {isProcessing && (
                <div className="flex justify-start">
                  <div className="bg-slate-700 text-slate-200 p-3 rounded-lg flex items-center gap-2">
                    <Loader2 className="animate-spin" size={16} />
                    {i18n.language === "hi" ? "प्रोसेसिंग..." : "Processing..."}
                  </div>
                </div>
              )}
            </div>

            {/* Input */}
            <div className="p-4 border-t border-slate-700">
              {mode === "text" ? (
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && handleInput(input)}
                    placeholder={i18n.language === "hi" ? "अपना संदेश टाइप करें..." : "Type your message..."}
                    className="flex-1 input-style"
                    disabled={isProcessing}
                  />
                  <button
                    onClick={() => handleInput(input)}
                    disabled={isProcessing || !input.trim()}
                    className="btn-primary w-auto flex items-center gap-2"
                  >
                    <Send size={16} />
                  </button>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-4">
                  <button
                    onClick={handleVoiceToggle}
                    disabled={isProcessing}
                    className={`w-16 h-16 rounded-full flex items-center justify-center text-white transition-all ${
                      isRecording ? "bg-red-600 animate-pulse" : "bg-cyan-600 hover:bg-cyan-700"
                    }`}
                  >
                    {isRecording ? <MicOff size={24} /> : <Mic size={24} />}
                  </button>
                  <p className="text-center text-sm text-slate-400">
                    {isRecording
                      ? i18n.language === "hi"
                        ? "सुन रहा हूं... रोकने के लिए क्लिक करें"
                        : "Listening... Click to stop"
                      : i18n.language === "hi"
                        ? "बोलना शुरू करने के लिए क्लिक करें"
                        : "Click to start speaking"}
                  </p>
                  {input && (
                    <div className="w-full p-3 bg-slate-900 rounded-lg text-center text-slate-200">"{input}"</div>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
export default SmartAssistantModal