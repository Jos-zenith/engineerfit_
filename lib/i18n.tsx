"use client"

import { createContext, useContext, useState, useCallback, type ReactNode } from "react"

export type Language = "en" | "ta"

const translations: Record<string, Record<Language, string>> = {
  "nav.home": { en: "Home", ta: "முகப்பு" },
  "nav.assessment": { en: "Assessment", ta: "மதிப்பீடு" },
  "nav.dashboard": { en: "Dashboard", ta: "டாஷ்போர்டு" },
  "nav.jobs": { en: "Talent Match", ta: "வேலைகள்" },
  "hero.title": { en: "LOGIC > LANGUAGE.", ta: "தர்க்கம் > மொழி." },
  "hero.subtitle": {
    en: "The first vernacular psychometric engine bypassing the English Tax for Tier-2/3 India. Quantifying potential through deterministic matching.",
    ta: "Tier-2/3 இந்தியாவுக்கான ஆங்கில வரியைத் தவிர்க்கும் முதல் தாய்மொழி சைக்கோமெட்ரிக் இயந்திரம். தீர்மானிக்கும் பொருத்தத்தின் மூலம் திறனை அளவிடுதல்.",
  },
  "hero.cta": { en: "Initialize Assessment", ta: "மதிப்பீட்டைத் தொடங்கு" },
  "hero.cta2": { en: "Recruiter Access", ta: "ஆட்சேர்ப்பு அணுகல்" },
  "hero.badge": { en: "Eliminating the English Tax", ta: "ஆங்கில வரியை நீக்குதல்" },
  "feature.cognitive": { en: "Cognitive Matrix", ta: "அறிவாற்றல் அணி" },
  "feature.behavioral": { en: "Behavioral Signature", ta: "நடத்தை கையொப்பம்" },
  "feature.domain": { en: "Domain Proficiency", ta: "துறை திறன்" },
  "feature.fit": { en: "Vector Match Score", ta: "வெக்டர் பொருத்த மதிப்பெண்" },
  "section.how": { en: "System Architecture", ta: "அமைப்பு கட்டமைப்பு" },
  "section.features": { en: "Engine Capabilities", ta: "இயந்திர திறன்கள்" },
  "step.1.title": { en: "Adaptive Psychometric Scan", ta: "தகவமைப்பு மனவியல் ஸ்கேன்" },
  "step.1.desc": {
    en: "20-item IRT engine adapts difficulty in real-time. Cognitive & behavioral modules available in Tamil. Zero English Tax.",
    ta: "20 உருப்படி IRT இயந்திரம் நிகழ்நேரத்தில் சிரமத்தை மாற்றுகிறது. தமிழில் அறிவாற்றல் & நடத்தை தொகுதிகள்.",
  },
  "step.2.title": { en: "Persona Vector Generation", ta: "ஆளுமை வெக்டர் உருவாக்கம்" },
  "step.2.desc": {
    en: "Multi-dimensional persona vector computed across Cognitive, Behavioral, and Domain axes. Your digital fingerprint.",
    ta: "அறிவாற்றல், நடத்தை மற்றும் துறை அச்சுகளில் பல பரிமாண ஆளுமை வெக்டர் கணக்கிடப்படுகிறது.",
  },
  "step.3.title": { en: "Deterministic Matching", ta: "தீர்மானிக்கும் பொருத்தம்" },
  "step.3.desc": {
    en: "Cosine similarity scoring maps your persona vector against job requirement vectors. Precision, not probability.",
    ta: "கோசைன் ஒற்றுமை மதிப்பெண் உங்கள் ஆளுமை வெக்டரை வேலை தேவை வெக்டர்களுக்கு எதிராக வரைபடமாக்குகிறது.",
  },
  "stats.students": { en: "Vectors Processed", ta: "வெக்டர்கள் செயலாக்கப்பட்டன" },
  "stats.colleges": { en: "Nodes Connected", ta: "முனைகள் இணைக்கப்பட்டன" },
  "stats.placement": { en: "Match Accuracy", ta: "பொருத்த துல்லியம்" },
  "stats.retention": { en: "Retention Rate", ta: "தக்கவைப்பு விகிதம்" },
  "lang.toggle": { en: "தமிழ்", ta: "English" },
  "lang.system": { en: "SYS:LANG", ta: "SYS:LANG" },
  "footer.tagline": { en: "Quantifying potential. Deterministic matching. Zero language bias.", ta: "திறனை அளவிடுதல். தீர்மானிக்கும் பொருத்தம். மொழி சார்பு இல்லை." },
  "assessment.title": { en: "Assessment Terminal", ta: "மதிப்பீடு முனையம்" },
  "assessment.cognitive": { en: "COGNITIVE", ta: "அறிவாற்றல்" },
  "assessment.behavioral": { en: "BEHAVIORAL", ta: "நடத்தை" },
  "assessment.domain": { en: "DOMAIN", ta: "குறிப்பிட்ட துறை" },
  "assessment.confidence": { en: "Signal Confidence", ta: "சமிக்ஞை நம்பிக்கை" },
  "assessment.low": { en: "Low", ta: "குறைவு" },
  "assessment.medium": { en: "Medium", ta: "நடுத்தரம்" },
  "assessment.high": { en: "High", ta: "அதிகம்" },
  "assessment.next": { en: "Transmit >>", ta: "அனுப்பு >>" },
  "assessment.submit": { en: "Finalize Scan", ta: "ஸ்கேன் முடிக்க" },
  "assessment.question": { en: "Query", ta: "கேள்வி" },
  "assessment.of": { en: "of", ta: "இல்" },
  "assessment.timeRemaining": { en: "Uptime", ta: "இயங்கும் நேரம்" },
}

interface I18nContextType {
  language: Language
  setLanguage: (lang: Language) => void
  t: (key: string) => string
}

const I18nContext = createContext<I18nContextType>({
  language: "en",
  setLanguage: () => {},
  t: (key: string) => key,
})

export function I18nProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>("en")

  const t = useCallback(
    (key: string) => {
      return translations[key]?.[language] ?? key
    },
    [language]
  )

  return (
    <I18nContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </I18nContext.Provider>
  )
}

export function useI18n() {
  return useContext(I18nContext)
}
