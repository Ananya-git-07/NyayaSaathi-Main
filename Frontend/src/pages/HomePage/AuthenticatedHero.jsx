"use client"
import { motion } from "framer-motion"
import { Mic, User, Sparkles, ArrowRight } from "lucide-react"
import { useAuth } from "../../context/AuthContext"

const AuthenticatedHero = ({ onVoiceQueryClick }) => {
  const { user } = useAuth()

  return (
    <section className="min-h-screen w-full flex items-center justify-center text-center container-padding">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="glass-card p-12 w-full max-w-5xl relative overflow-hidden"
      >
        {/* Background decoration */}
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-50/50 to-blue-50/50"></div>
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-cyan-200/30 to-transparent rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-blue-200/30 to-transparent rounded-full blur-3xl"></div>

        <div className="relative z-10">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 mb-8">
            <div className="w-20 h-20 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-xl shadow-cyan-200/50 flex-shrink-0">
              <User size={40} className="text-white" />
            </div>
            <div className="text-center sm:text-left">
              <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-slate-900 mb-2">Welcome back,</h1>
              <h2 className="text-3xl md:text-5xl font-bold gradient-text">{user?.fullName || "User"}!</h2>
            </div>
          </div>

          <p className="max-w-3xl mx-auto text-xl md:text-2xl text-slate-700 mb-12 leading-relaxed">
            Legal help is just a word away. Start a voice query now to get assistance with your legal paperwork.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
            <button
              onClick={onVoiceQueryClick}
              className="btn-primary text-lg py-4 px-8 rounded-2xl shadow-xl shadow-cyan-200/50 group"
            >
              <Mic size={24} className="group-hover:scale-110 transition-transform" />
              Start Your First Voice Query
              <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </button>

            <div className="flex items-center gap-2 text-slate-600">
              <Sparkles size={16} className="text-cyan-600" />
              <span className="text-sm">AI-powered legal assistance</span>
            </div>
          </div>

          {/* Stats or features */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-12 pt-8 border-t border-slate-200">
            <div className="text-center">
              <div className="text-2xl font-bold text-cyan-600">24/7</div>
              <div className="text-sm text-slate-600">Available</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-cyan-600">10+</div>
              <div className="text-sm text-slate-600">Languages</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-cyan-600">100%</div>
              <div className="text-sm text-slate-600">Secure</div>
            </div>
          </div>
        </div>
      </motion.div>
    </section>
  )
}

export default AuthenticatedHero
