import MotionWrap from "../../components/MotionWrap"
import { Landmark, FileText, BotMessageSquare, Users, Sparkles, Shield, Clock, Globe } from "lucide-react"
import { useTranslation } from "react-i18next"

const FeaturesSection = () => {
  const { t } = useTranslation()

  const features = [
    {
      icon: <BotMessageSquare size={24} />,
      title: t("featuresSection.features.voice.title"),
      description: t("featuresSection.features.voice.desc"),
      color: "from-cyan-50 to-blue-50 border-cyan-200",
      iconColor: "text-cyan-600",
    },
    {
      icon: <FileText size={24} />,
      title: t("featuresSection.features.docs.title"),
      description: t("featuresSection.features.docs.desc"),
      color: "from-green-50 to-emerald-50 border-green-200",
      iconColor: "text-green-600",
    },
    {
      icon: <Landmark size={24} />,
      title: t("featuresSection.features.issues.title"),
      description: t("featuresSection.features.issues.desc"),
      color: "from-purple-50 to-pink-50 border-purple-200",
      iconColor: "text-purple-600",
    },
    {
      icon: <Users size={24} />,
      title: t("featuresSection.features.escalation.title"),
      description: t("featuresSection.features.escalation.desc"),
      color: "from-orange-50 to-red-50 border-orange-200",
      iconColor: "text-orange-600",
    },
  ]

  const additionalFeatures = [
    { icon: <Shield size={20} />, text: t("featuresSection.pills.secure") },
    { icon: <Clock size={20} />, text: t("featuresSection.pills.available") },
    { icon: <Globe size={20} />, text: t("featuresSection.pills.multiLanguage") },
    { icon: <Sparkles size={20} />, text: t("featuresSection.pills.aiPowered") },
  ]

  return (
    <section className="section-padding bg-white">
      <MotionWrap>
        <div className="mx-auto max-w-7xl container-padding">
          <div className="mx-auto max-w-3xl text-center mb-16">
            <h2 className="text-base font-semibold leading-7 text-cyan-600 mb-4">{t("featuresSection.preTitle")}</h2>
            <h3
              className="text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl mb-6"
              dangerouslySetInnerHTML={{ __html: t("featuresSection.title") }}
            ></h3>
            <p className="text-xl leading-8 text-slate-700 mb-8">{t("featuresSection.subtitle")}</p>

            {/* Additional Features Pills */}
            <div className="flex flex-wrap justify-center gap-3">
              {additionalFeatures.map((feature) => (
                <div
                  key={feature.text}
                  className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-full shadow-sm"
                >
                  <div className="text-cyan-600">{feature.icon}</div>
                  <span className="text-sm text-slate-700">{feature.text}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {features.map((feature, index) => (
              <div key={feature.title} className={`card-light bg-gradient-to-br ${feature.color} p-8 group`}>
                <div className="flex items-start gap-6">
                  <div
                    className={`w-16 h-16 bg-white/80 rounded-xl flex items-center justify-center ${feature.iconColor} group-hover:scale-110 transition-transform duration-300 flex-shrink-0 shadow-sm`}
                  >
                    {feature.icon}
                  </div>
                  <div className="flex-1">
                    <h4 className="text-xl font-semibold text-slate-900 mb-4">{feature.title}</h4>
                    <p className="text-slate-700 leading-relaxed">{feature.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </MotionWrap>
    </section>
  )
}

export default FeaturesSection