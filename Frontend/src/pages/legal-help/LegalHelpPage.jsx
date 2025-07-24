"use client"

import { useState, useEffect, useRef } from "react"
import {
  FileText,
  CreditCard,
  Home,
  Gavel,
  Users,
  BookOpen,
  Mic,
  MicOff,
  Send,
  Volume2,
  VolumeX,
  Search,
  MessageSquare,
} from "lucide-react"
import { useTranslation } from "react-i18next"
import { useNavigate } from "react-router-dom"
import toast from "react-hot-toast"

const LegalHelpPage = () => {
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()
  const [mode, setMode] = useState("text")
  const [isRecording, setIsRecording] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [input, setInput] = useState("")
  const [conversation, setConversation] = useState([])
  const [selectedCategory, setSelectedCategory] = useState(null)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const recognitionRef = useRef(null)
  const speechSynthRef = useRef(null)
  const messagesEndRef = useRef(null)

  // Legal categories with light theme styling
  const legalCategories = [
    {
      id: "aadhaar",
      icon: <CreditCard size={32} />,
      title: i18n.language === "hi" ? "आधार कार्ड" : "Aadhaar Card",
      description: i18n.language === "hi" ? "आधार संबंधी सभी सेवाएं" : "All Aadhaar related services",
      color: "from-blue-50 to-cyan-50 border-blue-200",
      iconColor: "text-blue-600",
    },
    {
      id: "pension",
      icon: <Users size={32} />,
      title: i18n.language === "hi" ? "पेंशन योजनाएं" : "Pension Schemes",
      description: i18n.language === "hi" ? "सभी पेंशन योजनाओं की जानकारी" : "Information about all pension schemes",
      color: "from-green-50 to-emerald-50 border-green-200",
      iconColor: "text-green-600",
    },
    {
      id: "land",
      icon: <Home size={32} />,
      title: i18n.language === "hi" ? "भूमि और संपत्ति" : "Land & Property",
      description: i18n.language === "hi" ? "भूमि विवाद और संपत्ति कानून" : "Land disputes and property laws",
      color: "from-orange-50 to-red-50 border-orange-200",
      iconColor: "text-orange-600",
    },
    {
      id: "court",
      icon: <Gavel size={32} />,
      title: i18n.language === "hi" ? "न्यायालय प्रक्रिया" : "Court Procedures",
      description: i18n.language === "hi" ? "न्यायालय की कार्यवाही और प्रक्रिया" : "Court proceedings and procedures",
      color: "from-purple-50 to-pink-50 border-purple-200",
      iconColor: "text-purple-600",
    },
    {
      id: "certificates",
      icon: <FileText size={32} />,
      title: i18n.language === "hi" ? "प्रमाणपत्र" : "Certificates",
      description: i18n.language === "hi" ? "सभी प्रकार के प्रमाणपत्र" : "All types of certificates",
      color: "from-teal-50 to-blue-50 border-teal-200",
      iconColor: "text-teal-600",
    },
    {
      id: "rights",
      icon: <BookOpen size={32} />,
      title: i18n.language === "hi" ? "अधिकार और कानून" : "Rights & Laws",
      description:
        i18n.language === "hi" ? "मौलिक अधिकार और कानूनी जानकारी" : "Fundamental rights and legal information",
      color: "from-indigo-50 to-purple-50 border-indigo-200",
      iconColor: "text-indigo-600",
    },
  ]

  // Enhanced legal knowledge base with comprehensive information
  const legalKnowledge = {
    en: {
      aadhaar: {
        update: {
          title: "How to Update Aadhaar Card",
          content: `**Complete Guide to Aadhaar Updates:**

**Online Update Process:**
1. Visit uidai.gov.in and click "Update Aadhaar Online"
2. Enter your 12-digit Aadhaar number
3. Enter OTP sent to registered mobile
4. Select data to be updated (Name, Address, DOB, Gender, Mobile, Email)
5. Upload supporting documents (max 2MB, PDF/JPG format)
6. Pay ₹50 fee online
7. Get Update Request Number (URN)
8. Track status using URN

**Offline Update Process:**
1. Visit nearest Aadhaar Enrollment Center
2. Fill Aadhaar correction/update form
3. Provide biometric verification
4. Submit supporting documents
5. Pay ₹50 fee
6. Get acknowledgment slip with URN
7. Updated Aadhaar delivered in 90 days

**Required Documents:**
- **For Name Update:** Marriage certificate, Gazette notification, Court order
- **For Address Update:** Passport, Bank statement, Utility bills (within 3 months)
- **For DOB Update:** Birth certificate, School leaving certificate, Passport

**Important Notes:**
- Updates are FREE within 90 days of enrollment
- Mobile/Email updates require OTP verification
- Address updates need recent proof (within 3 months)
- Name updates may require additional verification`,
        },
        lost: {
          title: "Lost Aadhaar Card - Complete Recovery Guide",
          content: `**If your Aadhaar card is lost or stolen:**

**Immediate Steps:**
1. **File Police Complaint (if stolen)**
   - Go to nearest police station
   - File FIR mentioning Aadhaar theft
   - Get FIR copy for records

**Download e-Aadhaar (Fastest Solution):**
1. Visit uidai.gov.in
2. Click "Download Aadhaar"
3. Enter Aadhaar number or VID
4. Enter OTP sent to registered mobile
5. Download password-protected PDF
6. Password format: First 4 letters of name + birth year

**Order Aadhaar PVC Card:**
1. Visit uidai.gov.in
2. Click "Order Aadhaar PVC Card"
3. Enter Aadhaar details and address
4. Pay ₹50 + GST + Speed Post charges
5. Card delivered to registered address in 7-10 days

**Visit Aadhaar Center:**
1. Go with FIR copy (if filed)
2. Fill duplicate Aadhaar form
3. Provide biometric verification
4. Pay ₹50 fee
5. Get acknowledgment receipt

**Legal Status:**
- e-Aadhaar is legally valid everywhere
- Accepted for all government services
- Can be used for bank account opening
- Valid for passport applications`,
        },
      },
      court: {
        summons: {
          title: "Complete Guide to Court Summons",
          content: `**Understanding Court Summons:**

A court summons is a legal document that requires your appearance in court. Ignoring it can lead to serious consequences.

**Types of Summons:**
1. **Civil Summons** - Property disputes, contract issues, family matters
2. **Criminal Summons** - Criminal cases where you're accused or witness
3. **Witness Summons** - To testify in someone else's case

**What to Do When You Receive Summons:**

**Step 1: Don't Panic or Ignore**
- Read the summons carefully
- Note the court name, address, date, and time
- Understand what the case is about
- Check if you're plaintiff, defendant, or witness

**Step 2: Gather Information**
- Collect all relevant documents
- Organize evidence in your favor
- Get witness contact details
- Take photographs if relevant

**Step 3: Legal Consultation**
- Consult a lawyer immediately
- Get free legal aid if eligible (income < ₹9,000/month)
- Understand your rights and options
- Prepare your defense strategy

**Step 4: Court Appearance**
- Reach court 30 minutes early
- Dress formally and respectfully
- Bring all original documents
- Follow court etiquette
- Speak only when asked

**If You Cannot Attend:**
1. File application for adjournment with valid reason
2. Submit medical certificate if ill
3. Send authorized representative with proper documentation
4. Inform court clerk in advance

**Consequences of Non-Appearance:**
- Ex-parte judgment against you
- Arrest warrant may be issued
- Fine or imprisonment possible
- Loss of case by default
- Contempt of court charges

**Court Etiquette:**
- Stand when judge enters/leaves
- Address judge as "Your Honor" or "My Lord"
- Turn off mobile phones
- No eating, drinking, or talking
- Maintain respectful behavior`,
        },
      },
    },
    hi: {
      aadhaar: {
        update: {
          title: "आधार कार्ड कैसे अपडेट करें",
          content: `**आधार अपडेट की संपूर्ण गाइड:**

**ऑनलाइन अपडेट प्रक्रिया:**
1. uidai.gov.in पर जाएं और "आधार ऑनलाइन अपडेट करें" पर क्लिक करें
2. अपना 12-अंकीय आधार नंबर दर्ज करें
3. पंजीकृत मोबाइल पर भेजा गया OTP दर्ज करें
4. अपडेट करने वाला डेटा चुनें (नाम, पता, जन्म तिथि, लिंग, मोबाइल, ईमेल)
5. सहायक दस्तावेज अपलोड करें (अधिकतम 2MB, PDF/JPG प्रारूप)
6. ₹50 फीस ऑनलाइन भुगतान करें
7. अपडेट अनुरोध संख्या (URN) प्राप्त करें
8. URN का उपयोग करके स्थिति ट्रैक करें

**ऑफलाइन अपडेट प्रक्रिया:**
1. निकटतम आधार नामांकन केंद्र जाएं
2. आधार सुधार/अपडेट फॉर्म भरें
3. बायोमेट्रिक सत्यापन प्रदान करें
4. सहायक दस्तावेज जमा करें
5. ₹50 फीस का भुगतान करें
6. URN के साथ पावती पर्ची प्राप्त करें
7. 90 दिनों में अपडेटेड आधार मिलेगा

**आवश्यक दस्तावेज:**
- **नाम अपडेट के लिए:** विवाह प्रमाणपत्र, राजपत्र अधिसूचना, न्यायालय आदेश
- **पता अपडेट के लिए:** पासपोर्ट, बैंक स्टेटमेंट, उपयोगिता बिल (3 महीने के भीतर)
- **जन्म तिथि अपडेट के लिए:** जन्म प्रमाणपत्र, स्कूल छोड़ने का प्रमाणपत्र, पासपोर्ट

**महत्वपूर्ण बातें:**
- नामांकन के 90 दिनों के भीतर अपडेट मुफ्त है
- मोबाइल/ईमेल अपडेट के लिए OTP सत्यापन आवश्यक
- पता अपडेट के लिए हाल का प्रमाण चाहिए (3 महीने के भीतर)
- नाम अपडेट के लिए अतिरिक्त सत्यापन हो सकता है`,
        },
      },
    },
  }

  // Initialize speech recognition and synthesis
  useEffect(() => {
    if ("webkitSpeechRecognition" in window) {
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
    }

    if ("speechSynthesis" in window) {
      speechSynthRef.current = window.speechSynthesis
    }
  }, [i18n.language])

  // Scroll to bottom when new messages are added
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [conversation])

  const addMessage = (message, isUser = false) => {
    setConversation((prev) => [...prev, { message, isUser, timestamp: Date.now() }])
  }

  const speakText = (text) => {
    if (!speechSynthRef.current) return

    speechSynthRef.current.cancel()
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.lang = i18n.language === "hi" ? "hi-IN" : "en-US"
    utterance.rate = 0.8
    utterance.pitch = 1

    utterance.onstart = () => setIsSpeaking(true)
    utterance.onend = () => setIsSpeaking(false)
    utterance.onerror = () => setIsSpeaking(false)

    speechSynthRef.current.speak(utterance)
  }

  const stopSpeaking = () => {
    if (speechSynthRef.current) {
      speechSynthRef.current.cancel()
      setIsSpeaking(false)
    }
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
      const response = await processLegalQuery(inputText)
      addMessage(response)

      if (mode === "voice") {
        speakText(response)
      }
    } catch (error) {
      addMessage(`Error: ${error.message}`)
    } finally {
      setIsProcessing(false)
    }
  }

  const processLegalQuery = async (query) => {
    const lowerQuery = query.toLowerCase()
    const currentLang = i18n.language
    const knowledge = legalKnowledge[currentLang] || legalKnowledge.en

    // Enhanced query processing with more comprehensive responses
    if (lowerQuery.includes("aadhaar") || lowerQuery.includes("आधार")) {
      if (lowerQuery.includes("update") || lowerQuery.includes("अपडेट")) {
        return knowledge.aadhaar?.update?.content || "Information about Aadhaar updates..."
      } else if (lowerQuery.includes("lost") || lowerQuery.includes("खो")) {
        return knowledge.aadhaar?.lost?.content || "Information about lost Aadhaar..."
      }
      return knowledge.aadhaar?.update?.content || "General Aadhaar information..."
    }

    if (lowerQuery.includes("court") || lowerQuery.includes("कोर्ट") || lowerQuery.includes("न्यायालय")) {
      if (lowerQuery.includes("summons") || lowerQuery.includes("समन")) {
        return knowledge.court?.summons?.content || "Information about court summons..."
      }
      return knowledge.court?.summons?.content || "General court information..."
    }

    // Default comprehensive response
    return currentLang === "hi"
      ? "मैं आपकी कानूनी समस्याओं में मदद कर सकता हूं। आधार, पेंशन, भूमि, न्यायालय, और प्रमाणपत्र के बारे में विस्तार से पूछें। मैं आपको चरणबद्ध गाइड और आवश्यक दस्तावेजों की जानकारी दूंगा।"
      : "I can help with your legal queries about Aadhaar, pension, land, court procedures, and certificates. Ask me specific questions and I'll provide detailed step-by-step guidance and required documents information."
  }

  const filteredCategories = legalCategories.filter(
    (category) =>
      category.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      category.description.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const handleCategoryClick = (category) => {
    setSelectedCategory(category)
    const query = i18n.language === "hi" ? `${category.title} के बारे में बताएं` : `Tell me about ${category.title}`
    handleInput(query)
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto container-padding py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-slate-900 mb-4">
            {i18n.language === "hi" ? "कानूनी सहायता" : "Legal Help"}
          </h1>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto">
            {i18n.language === "hi"
              ? "भारतीय कानून और प्रक्रियाओं के बारे में व्यापक जानकारी प्राप्त करें"
              : "Get comprehensive information about Indian laws and procedures"}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Categories Section */}
          <div className="lg:col-span-1">
            <div className="sticky top-8">
              <h2 className="text-2xl font-semibold text-slate-900 mb-6">
                {i18n.language === "hi" ? "कानूनी श्रेणियां" : "Legal Categories"}
              </h2>

              {/* Search */}
              <div className="relative mb-6">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
                <input
                  type="text"
                  placeholder={i18n.language === "hi" ? "श्रेणी खोजें..." : "Search categories..."}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="input-style pl-12"
                />
              </div>

              {/* Categories Grid */}
              <div className="space-y-3">
                {filteredCategories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => handleCategoryClick(category)}
                    className={`w-full text-left p-4 rounded-lg border transition-all duration-200 hover:shadow-md ${
                      selectedCategory?.id === category.id
                        ? `bg-gradient-to-br ${category.color} border-current`
                        : "bg-white border-slate-200 hover:border-slate-300"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`${category.iconColor} flex-shrink-0`}>{category.icon}</div>
                      <div>
                        <h3 className="font-semibold text-slate-900">{category.title}</h3>
                        <p className="text-sm text-slate-600 mt-1">{category.description}</p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Chat Section */}
          <div className="lg:col-span-2">
            <div className="bg-white border border-slate-200 rounded-xl shadow-lg">
              {/* Chat Header */}
              <div className="border-b border-slate-200 p-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                    <MessageSquare className="text-cyan-600" size={20} />
                    {i18n.language === "hi" ? "AI कानूनी सहायक" : "AI Legal Assistant"}
                  </h3>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setMode("text")}
                      className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                        mode === "text" ? "bg-cyan-100 text-cyan-700" : "text-slate-600 hover:bg-slate-100"
                      }`}
                    >
                      Text
                    </button>
                    <button
                      onClick={() => setMode("voice")}
                      className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                        mode === "voice" ? "bg-cyan-100 text-cyan-700" : "text-slate-600 hover:bg-slate-100"
                      }`}
                    >
                      Voice
                    </button>
                    {isSpeaking && (
                      <button
                        onClick={stopSpeaking}
                        className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                      >
                        <VolumeX size={16} />
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Chat Messages */}
              <div className="h-96 overflow-y-auto p-4 space-y-4">
                {conversation.length === 0 && (
                  <div className="text-center py-8">
                    <MessageSquare className="mx-auto mb-4 text-cyan-600" size={48} />
                    <p className="text-lg text-slate-700 mb-2">
                      {i18n.language === "hi" ? "आज मैं आपकी कैसे मदद कर सकता हूं?" : "How can I help you today?"}
                    </p>
                    <p className="text-sm text-slate-500">
                      {i18n.language === "hi"
                        ? "कोई भी कानूनी प्रश्न पूछें या ऊपर से कोई श्रेणी चुनें"
                        : "Ask any legal question or select a category above"}
                    </p>
                  </div>
                )}

                {conversation.map((msg, index) => (
                  <div key={index} className={`flex ${msg.isUser ? "justify-end" : "justify-start"}`}>
                    <div
                      className={`max-w-[80%] p-3 rounded-lg ${
                        msg.isUser ? "bg-cyan-600 text-white" : "bg-slate-100 text-slate-800 border border-slate-200"
                      }`}
                    >
                      <div className="whitespace-pre-wrap">{msg.message}</div>
                      {!msg.isUser && (
                        <button
                          onClick={() => speakText(msg.message)}
                          className="mt-2 p-1 text-slate-500 hover:text-cyan-600 transition-colors"
                          disabled={isSpeaking}
                        >
                          <Volume2 size={14} />
                        </button>
                      )}
                    </div>
                  </div>
                ))}

                {isProcessing && (
                  <div className="flex justify-start">
                    <div className="bg-slate-100 text-slate-800 p-3 rounded-lg flex items-center gap-2 border border-slate-200">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-cyan-600"></div>
                      {i18n.language === "hi" ? "सोच रहा हूं..." : "Thinking..."}
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Chat Input */}
              <div className="border-t border-slate-200 p-4">
                {mode === "text" ? (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyPress={(e) => e.key === "Enter" && handleInput(input)}
                      placeholder={i18n.language === "hi" ? "अपना प्रश्न टाइप करें..." : "Type your question..."}
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
                    <p className="text-center text-sm text-slate-600">
                      {isRecording
                        ? i18n.language === "hi"
                          ? "सुन रहा हूं... रोकने के लिए क्लिक करें"
                          : "Listening... Click to stop"
                        : i18n.language === "hi"
                          ? "बोलना शुरू करने के लिए क्लिक करें"
                          : "Click to start speaking"}
                    </p>
                    {input && (
                      <div className="w-full p-3 bg-slate-100 rounded-lg text-center text-slate-800 border border-slate-200">
                        "{input}"
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default LegalHelpPage
