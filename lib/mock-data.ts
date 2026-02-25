// ─── Assessment Questions (20 questions: 5 Cognitive, 5 Behavioral, 10 Domain) ───

export type QuestionCategory = "cognitive" | "behavioral" | "domain"
export type Difficulty = "easy" | "medium" | "hard"
export type Confidence = "low" | "medium" | "high"

export interface AssessmentQuestion {
  id: number
  category: QuestionCategory
  difficulty: Difficulty
  text: { en: string; ta: string }
  options: { en: string; ta: string }[]
  correctIndex: number
}

export const assessmentQuestions: AssessmentQuestion[] = [
  // Cognitive (5)
  {
    id: 1, category: "cognitive", difficulty: "easy",
    text: { en: "If all roses are flowers and some flowers fade quickly, which statement is true?", ta: "அனைத்து ரோஜாக்களும் பூக்கள் என்றால், சில பூக்கள் விரைவில் வாடினால், எந்த கூற்று உண்மை?" },
    options: [
      { en: "All roses fade quickly", ta: "அனைத்து ரோஜாக்களும் விரைவில் வாடும்" },
      { en: "Some roses may fade quickly", ta: "சில ரோஜாக்கள் விரைவில் வாடலாம்" },
      { en: "No roses fade quickly", ta: "ரோஜாக்கள் எதுவும் விரைவில் வாடாது" },
      { en: "All flowers are roses", ta: "அனைத்து பூக்களும் ரோஜாக்கள்" },
    ],
    correctIndex: 1,
  },
  {
    id: 2, category: "cognitive", difficulty: "medium",
    text: { en: "A train travels 60 km in 45 minutes. What is its speed in km/h?", ta: "ஒரு ரயில் 45 நிமிடங்களில் 60 கி.மீ பயணிக்கிறது. அதன் வேகம் கி.மீ/மணி என்ன?" },
    options: [
      { en: "60 km/h", ta: "60 கி.மீ/மணி" },
      { en: "75 km/h", ta: "75 கி.மீ/மணி" },
      { en: "80 km/h", ta: "80 கி.மீ/மணி" },
      { en: "90 km/h", ta: "90 கி.மீ/மணி" },
    ],
    correctIndex: 2,
  },
  {
    id: 3, category: "cognitive", difficulty: "medium",
    text: { en: "Which number completes the pattern: 2, 6, 18, 54, ?", ta: "எந்த எண் இந்த வடிவத்தை நிறைவு செய்கிறது: 2, 6, 18, 54, ?" },
    options: [
      { en: "108", ta: "108" }, { en: "162", ta: "162" },
      { en: "148", ta: "148" }, { en: "180", ta: "180" },
    ],
    correctIndex: 1,
  },
  {
    id: 4, category: "cognitive", difficulty: "hard",
    text: { en: "In a group of 100 people, 70 like tea, 65 like coffee, and 85 like milk. What is the minimum number who like all three?", ta: "100 பேர் குழுவில், 70 பேர் தேநீர், 65 பேர் காபி, 85 பேர் பால் விரும்புகிறார்கள். மூன்றையும் விரும்புபவர்களின் குறைந்தபட்ச எண்ணிக்கை என்ன?" },
    options: [
      { en: "15", ta: "15" }, { en: "20", ta: "20" },
      { en: "25", ta: "25" }, { en: "30", ta: "30" },
    ],
    correctIndex: 1,
  },
  {
    id: 5, category: "cognitive", difficulty: "hard",
    text: { en: "A mirror reflects light at 45 degrees. If a beam enters at 30 degrees to the mirror surface, what is the angle of reflection?", ta: "ஒரு கண்ணாடி ஒளியை 45 பாகைகளில் பிரதிபலிக்கிறது. ஒரு கற்றை 30 பாகைகளில் நுழைந்தால், பிரதிபலிப்பு கோணம் என்ன?" },
    options: [
      { en: "30 degrees", ta: "30 பாகை" }, { en: "45 degrees", ta: "45 பாகை" },
      { en: "60 degrees", ta: "60 பாகை" }, { en: "90 degrees", ta: "90 பாகை" },
    ],
    correctIndex: 2,
  },
  // Behavioral (5)
  {
    id: 6, category: "behavioral", difficulty: "easy",
    text: { en: "When assigned a challenging project with a tight deadline, you typically:", ta: "இறுக்கமான காலக்கெடுவுடன் சவாலான திட்டம் ஒதுக்கப்படும்போது, நீங்கள் பொதுவாக:" },
    options: [
      { en: "Break it into smaller tasks and create a timeline", ta: "சிறிய பணிகளாகப் பிரித்து கால அட்டவணை உருவாக்குவேன்" },
      { en: "Start immediately on the hardest part", ta: "உடனடியாக கடினமான பகுதியில் தொடங்குவேன்" },
      { en: "Seek help from colleagues right away", ta: "உடனே சகாக்களிடம் உதவி கேட்பேன்" },
      { en: "Wait for more clarity before starting", ta: "தொடங்குவதற்கு முன் மேலும் தெளிவுக்காக காத்திருப்பேன்" },
    ],
    correctIndex: 0,
  },
  {
    id: 7, category: "behavioral", difficulty: "medium",
    text: { en: "A team member consistently misses deadlines. How do you handle this?", ta: "ஒரு குழு உறுப்பினர் தொடர்ந்து காலக்கெடுவைத் தவறவிடுகிறார். இதை எவ்வாறு கையாள்வீர்கள்?" },
    options: [
      { en: "Have a private conversation to understand their challenges", ta: "அவர்களின் சவால்களைப் புரிந்துகொள்ள தனிப்பட்ட உரையாடல் நடத்துவேன்" },
      { en: "Report them to management immediately", ta: "உடனடியாக நிர்வாகத்திடம் புகாரளிப்பேன்" },
      { en: "Do their work yourself to meet deadlines", ta: "காலக்கெடுவை நிறைவேற்ற அவர்கள் வேலையை நானே செய்வேன்" },
      { en: "Ignore the issue and focus on your own work", ta: "பிரச்சனையை புறக்கணித்து என் வேலையில் கவனம் செலுத்துவேன்" },
    ],
    correctIndex: 0,
  },
  {
    id: 8, category: "behavioral", difficulty: "medium",
    text: { en: "You receive critical feedback on a completed project. Your first reaction is to:", ta: "நிறைவுற்ற திட்டத்தில் விமர்சன கருத்து கிடைக்கிறது. உங்கள் முதல் எதிர்வினை:" },
    options: [
      { en: "Defend your approach and explain your reasoning", ta: "உங்கள் அணுகுமுறையை பாதுகாத்து காரணங்களை விளக்குவேன்" },
      { en: "Listen carefully and identify actionable improvements", ta: "கவனமாகக் கேட்டு செயல்படக்கூடிய மேம்பாடுகளைக் கண்டறிவேன்" },
      { en: "Feel discouraged and question your abilities", ta: "ஊக்கமிழந்து என் திறன்களை கேள்வி எழுப்புவேன்" },
      { en: "Dismiss the feedback as unfair", ta: "கருத்தை நியாயமற்றது என்று நிராகரிப்பேன்" },
    ],
    correctIndex: 1,
  },
  {
    id: 9, category: "behavioral", difficulty: "easy",
    text: { en: "When learning a new technology, your preferred approach is:", ta: "புதிய தொழில்நுட்பத்தைக் கற்கும்போது, உங்கள் விருப்பமான அணுகுமுறை:" },
    options: [
      { en: "Watch tutorials and follow step-by-step guides", ta: "டுடோரியல்களைப் பார்த்து படிப்படியான வழிகாட்டிகளைப் பின்பற்றுவேன்" },
      { en: "Build a small project to learn by doing", ta: "செய்து கற்க ஒரு சிறிய திட்டத்தை உருவாக்குவேன்" },
      { en: "Read official documentation thoroughly first", ta: "முதலில் அதிகாரப்பூர்வ ஆவணங்களை முழுமையாக படிப்பேன்" },
      { en: "Ask experienced colleagues for guidance", ta: "அனுபவமுள்ள சகாக்களிடம் வழிகாட்டுதல் கேட்பேன்" },
    ],
    correctIndex: 1,
  },
  {
    id: 10, category: "behavioral", difficulty: "hard",
    text: { en: "You discover an ethical concern in your company's product. What do you do?", ta: "உங்கள் நிறுவனத்தின் தயாரிப்பில் நெறிமுறை கவலையைக் கண்டறிகிறீர்கள். என்ன செய்வீர்கள்?" },
    options: [
      { en: "Report it through proper channels with documented evidence", ta: "ஆவணப்படுத்தப்பட்ட சான்றுகளுடன் சரியான வழிகளில் புகாரளிப்பேன்" },
      { en: "Post about it on social media", ta: "சமூக ஊடகங்களில் பதிவிடுவேன்" },
      { en: "Ignore it as it's not your responsibility", ta: "உங்கள் பொறுப்பு அல்ல என்று புறக்கணிப்பேன்" },
      { en: "Quietly fix it yourself without telling anyone", ta: "யாருக்கும் சொல்லாமல் நானே அமைதியாக சரி செய்வேன்" },
    ],
    correctIndex: 0,
  },
  // Domain-Specific (10 - CS focus)
  {
    id: 11, category: "domain", difficulty: "easy",
    text: { en: "What is the time complexity of binary search on a sorted array?", ta: "What is the time complexity of binary search on a sorted array?" },
    options: [
      { en: "O(n)", ta: "O(n)" }, { en: "O(log n)", ta: "O(log n)" },
      { en: "O(n log n)", ta: "O(n log n)" }, { en: "O(1)", ta: "O(1)" },
    ],
    correctIndex: 1,
  },
  {
    id: 12, category: "domain", difficulty: "easy",
    text: { en: "Which data structure uses LIFO (Last In, First Out) principle?", ta: "Which data structure uses LIFO (Last In, First Out) principle?" },
    options: [
      { en: "Queue", ta: "Queue" }, { en: "Stack", ta: "Stack" },
      { en: "Array", ta: "Array" }, { en: "Linked List", ta: "Linked List" },
    ],
    correctIndex: 1,
  },
  {
    id: 13, category: "domain", difficulty: "medium",
    text: { en: "What does SQL's JOIN operation do?", ta: "What does SQL's JOIN operation do?" },
    options: [
      { en: "Combines rows from two or more tables based on a related column", ta: "Combines rows from two or more tables based on a related column" },
      { en: "Deletes duplicate rows from a table", ta: "Deletes duplicate rows from a table" },
      { en: "Creates a new table from existing data", ta: "Creates a new table from existing data" },
      { en: "Sorts data in ascending order", ta: "Sorts data in ascending order" },
    ],
    correctIndex: 0,
  },
  {
    id: 14, category: "domain", difficulty: "medium",
    text: { en: "Which protocol operates at the Transport Layer of the OSI model?", ta: "Which protocol operates at the Transport Layer of the OSI model?" },
    options: [
      { en: "HTTP", ta: "HTTP" }, { en: "TCP", ta: "TCP" },
      { en: "IP", ta: "IP" }, { en: "ARP", ta: "ARP" },
    ],
    correctIndex: 1,
  },
  {
    id: 15, category: "domain", difficulty: "medium",
    text: { en: "What is the primary purpose of an operating system's scheduler?", ta: "What is the primary purpose of an operating system's scheduler?" },
    options: [
      { en: "Memory allocation", ta: "Memory allocation" },
      { en: "File management", ta: "File management" },
      { en: "CPU time allocation among processes", ta: "CPU time allocation among processes" },
      { en: "Network packet routing", ta: "Network packet routing" },
    ],
    correctIndex: 2,
  },
  {
    id: 16, category: "domain", difficulty: "hard",
    text: { en: "What is the difference between a process and a thread?", ta: "What is the difference between a process and a thread?" },
    options: [
      { en: "Threads share memory space within a process; processes have separate memory", ta: "Threads share memory space within a process; processes have separate memory" },
      { en: "Processes are faster than threads", ta: "Processes are faster than threads" },
      { en: "Threads can only run on single-core processors", ta: "Threads can only run on single-core processors" },
      { en: "There is no difference", ta: "There is no difference" },
    ],
    correctIndex: 0,
  },
  {
    id: 17, category: "domain", difficulty: "hard",
    text: { en: "Which design pattern ensures a class has only one instance?", ta: "Which design pattern ensures a class has only one instance?" },
    options: [
      { en: "Factory", ta: "Factory" }, { en: "Observer", ta: "Observer" },
      { en: "Singleton", ta: "Singleton" }, { en: "Strategy", ta: "Strategy" },
    ],
    correctIndex: 2,
  },
  {
    id: 18, category: "domain", difficulty: "medium",
    text: { en: "What is normalization in database design?", ta: "What is normalization in database design?" },
    options: [
      { en: "Increasing data redundancy for faster queries", ta: "Increasing data redundancy for faster queries" },
      { en: "Organizing data to reduce redundancy and dependency", ta: "Organizing data to reduce redundancy and dependency" },
      { en: "Encrypting database tables", ta: "Encrypting database tables" },
      { en: "Creating backup copies of data", ta: "Creating backup copies of data" },
    ],
    correctIndex: 1,
  },
  {
    id: 19, category: "domain", difficulty: "hard",
    text: { en: "In OOP, what does the SOLID 'L' (Liskov Substitution Principle) state?", ta: "In OOP, what does the SOLID 'L' (Liskov Substitution Principle) state?" },
    options: [
      { en: "Classes should be open for extension but closed for modification", ta: "Classes should be open for extension but closed for modification" },
      { en: "Objects of a superclass should be replaceable with objects of its subclasses", ta: "Objects of a superclass should be replaceable with objects of its subclasses" },
      { en: "A class should have only one reason to change", ta: "A class should have only one reason to change" },
      { en: "High-level modules should not depend on low-level modules", ta: "High-level modules should not depend on low-level modules" },
    ],
    correctIndex: 1,
  },
  {
    id: 20, category: "domain", difficulty: "easy",
    text: { en: "What does REST stand for in web development?", ta: "What does REST stand for in web development?" },
    options: [
      { en: "Remote Execution of Server Tasks", ta: "Remote Execution of Server Tasks" },
      { en: "Representational State Transfer", ta: "Representational State Transfer" },
      { en: "Realtime Event Streaming Technology", ta: "Realtime Event Streaming Technology" },
      { en: "Resource Endpoint Service Topology", ta: "Resource Endpoint Service Topology" },
    ],
    correctIndex: 1,
  },
]

// ─── Mock Student Profile Data ───

export interface StudentProfile {
  name: string
  college: string
  branch: string
  year: number
  cgpa: number
  careerHygieneScore: number
  cognitiveScore: number
  behavioralScore: number
  domainScore: number
  roleAlignmentScore: number
  retentionPrediction: number
  personaVector: { subject: string; score: number; fullMark: number }[]
  riasec: { code: string; label: string; score: number }[]
  topStrengths: string[]
  developmentAreas: string[]
  recommendedRoles: { role: string; fitPercent: number; retention: number }[]
}

export const mockStudentProfile: StudentProfile = {
  name: "Keerthana S",
  college: "PSNA College of Engineering & Technology",
  branch: "Computer Science & Engineering",
  year: 2026,
  cgpa: 7.8,
  careerHygieneScore: 78,
  cognitiveScore: 82,
  behavioralScore: 75,
  domainScore: 80,
  roleAlignmentScore: 72,
  retentionPrediction: 85,
  personaVector: [
    { subject: "Logical Reasoning", score: 85, fullMark: 100 },
    { subject: "Problem Solving", score: 78, fullMark: 100 },
    { subject: "Conscientiousness", score: 72, fullMark: 100 },
    { subject: "Grit", score: 80, fullMark: 100 },
    { subject: "Teamwork", score: 68, fullMark: 100 },
    { subject: "Technical Skills", score: 82, fullMark: 100 },
    { subject: "Communication", score: 65, fullMark: 100 },
    { subject: "Learning Agility", score: 88, fullMark: 100 },
  ],
  riasec: [
    { code: "I", label: "Investigative", score: 88 },
    { code: "R", label: "Realistic", score: 75 },
    { code: "C", label: "Conventional", score: 70 },
    { code: "A", label: "Artistic", score: 45 },
    { code: "S", label: "Social", score: 55 },
    { code: "E", label: "Enterprising", score: 60 },
  ],
  topStrengths: ["Logical Reasoning", "Learning Agility", "Technical Skills"],
  developmentAreas: ["Communication", "Teamwork", "Conscientiousness"],
  recommendedRoles: [
    { role: "Software Developer", fitPercent: 88, retention: 90 },
    { role: "Data Analyst", fitPercent: 82, retention: 85 },
    { role: "R&D Engineer", fitPercent: 79, retention: 82 },
    { role: "QA Engineer", fitPercent: 74, retention: 78 },
    { role: "Technical Support", fitPercent: 65, retention: 70 },
    { role: "Project Manager", fitPercent: 58, retention: 65 },
  ],
}

// ─── Mock Recruiter / Candidate Data ───

export interface Candidate {
  id: string
  name: string
  college: string
  branch: string
  cgpa: number
  overallFit: number
  cognitiveFit: number
  behavioralFit: number
  domainFit: number
  careerHygieneScore: number
  retentionPrediction: number
  topStrengths: string[]
  avatar: string
  status: "shortlisted" | "applied" | "interviewing" | "offered"
}

export const mockCandidates: Candidate[] = [
  {
    id: "STU-001", name: "Keerthana Roy", college: "PSNA College of Engg.", branch: "CSE",
    cgpa: 7.8, overallFit: 88, cognitiveFit: 85, behavioralFit: 78, domainFit: 92,
    careerHygieneScore: 78, retentionPrediction: 90, topStrengths: ["Logical Reasoning", "Technical Skills", "Learning Agility"],
    avatar: "KE", status: "shortlisted",
  },
  {
    id: "STU-002", name: "Mary Delphin", college: "Thiagarajar College of Engg.", branch: "CSE",
    cgpa: 8.2, overallFit: 85, cognitiveFit: 80, behavioralFit: 88, domainFit: 85,
    careerHygieneScore: 82, retentionPrediction: 88, topStrengths: ["Conscientiousness", "Problem Solving", "Teamwork"],
    avatar: "DE", status: "shortlisted",
  },
  {
    id: "STU-003", name: "Evangeline", college: "Velammal Engg. College", branch: "IT",
    cgpa: 7.5, overallFit: 82, cognitiveFit: 78, behavioralFit: 82, domainFit: 84,
    careerHygieneScore: 75, retentionPrediction: 82, topStrengths: ["Grit", "Technical Skills", "Analytical Thinking"],
    avatar: "EV", status: "applied",
  },
  {
    id: "STU-004", name: "Accelia", college: "Sri Krishna College of Engg.", branch: "ECE",
    cgpa: 8.5, overallFit: 79, cognitiveFit: 88, behavioralFit: 72, domainFit: 75,
    careerHygieneScore: 80, retentionPrediction: 76, topStrengths: ["Logical Reasoning", "Learning Agility", "Problem Solving"],
    avatar: "AK", status: "interviewing",
  },
  {
    id: "STU-005", name: "Antony Viswa", college: "KPR Institute of Engg.", branch: "CSE",
    cgpa: 7.2, overallFit: 76, cognitiveFit: 75, behavioralFit: 80, domainFit: 72,
    careerHygieneScore: 70, retentionPrediction: 74, topStrengths: ["Teamwork", "Communication", "Conscientiousness"],
    avatar: "AV", status: "applied",
  },
  {
    id: "STU-006", name: "Aruna Suryanarayanan", college: "Kongu Engg. College", branch: "MECH",
    cgpa: 6.8, overallFit: 72, cognitiveFit: 70, behavioralFit: 75, domainFit: 70,
    careerHygieneScore: 65, retentionPrediction: 68, topStrengths: ["Grit", "Problem Solving", "Realistic"],
    avatar: "AS", status: "offered",
  },
  {
    id: "STU-007", name: "Victoria", college: "Mepco Schlenk Engg. College", branch: "CSE",
    cgpa: 8.9, overallFit: 92, cognitiveFit: 90, behavioralFit: 88, domainFit: 95,
    careerHygieneScore: 90, retentionPrediction: 94, topStrengths: ["Technical Skills", "Logical Reasoning", "Learning Agility"],
    avatar: "VI", status: "shortlisted",
  },
  {
    id: "STU-008", name: "Danicaa", college: "Bannari Amman Inst. of Tech.", branch: "CSE",
    cgpa: 7.0, overallFit: 68, cognitiveFit: 65, behavioralFit: 72, domainFit: 66,
    careerHygieneScore: 62, retentionPrediction: 60, topStrengths: ["Teamwork", "Grit", "Communication"],
    avatar: "VM", status: "applied",
  },
]

export const mockJobPosting = {
  title: "Junior Software Developer",
  company: "TechCorp Solutions",
  location: "Chennai, Tamil Nadu",
  type: "Full-Time, On-site",
  salary: "4.5 - 6.0 LPA",
  requirements: {
    cognitive: { logicalReasoning: 70, problemSolving: 65, analyticalThinking: 60 },
    behavioral: { conscientiousness: 65, grit: 70, teamwork: 60 },
    domain: { dataStructures: 75, webDevelopment: 70, databases: 65 },
  },
  minFitScore: 70,
  minCareerHygieneScore: 60,
}
