export type QuestionCategory = "cognitive" | "behavioral" | "domain"
export type Difficulty = "easy" | "medium" | "hard"
export type Confidence = "low" | "medium" | "high"

export type EngineeringDiscipline = "cs" | "mechanical" | "eee_ece" | "civil"
export type CognitiveDimension = "logical" | "quantitative" | "verbal" | "spatial" | "analytical"

export interface Irt3plParameters {
  a: number
  b: number
  c: number
}

export interface InternalAssessmentQuestion {
  id: number
  category: QuestionCategory
  difficulty: Difficulty
  irt?: Irt3plParameters
  discipline?: EngineeringDiscipline
  cognitiveDimension?: CognitiveDimension
  text: { en: string; ta: string }
  options: { en: string; ta: string }[]
  correctIndex: number
}

export interface PublicAssessmentQuestion {
  id: number
  category: QuestionCategory
  difficulty: Difficulty
  discipline?: EngineeringDiscipline
  cognitiveDimension?: CognitiveDimension
  text: { en: string; ta: string }
  options: { en: string; ta: string }[]
}

function localize(en: string, ta = en) {
  return { en, ta }
}

function params(a: number, b: number, c: number): Irt3plParameters {
  return { a, b, c }
}

export const assessmentQuestionBank: InternalAssessmentQuestion[] = [
  {
    id: 1,
    category: "cognitive",
    cognitiveDimension: "logical",
    difficulty: "easy",
    irt: params(0.95, -1.05, 0.22),
    text: localize("All turbines are machines. Some machines are automated. Which statement must be true?"),
    options: [
      localize("All turbines are automated"),
      localize("Some turbines may be automated"),
      localize("No turbines are automated"),
      localize("All machines are turbines"),
    ],
    correctIndex: 1,
  },
  {
    id: 2,
    category: "cognitive",
    cognitiveDimension: "logical",
    difficulty: "hard",
    irt: params(1.42, 1.15, 0.16),
    text: localize("If statement P implies Q, and Q is false, what can be concluded?"),
    options: [
      localize("P is true"),
      localize("P is false"),
      localize("Q is true"),
      localize("No conclusion is possible"),
    ],
    correctIndex: 1,
  },
  {
    id: 3,
    category: "cognitive",
    cognitiveDimension: "quantitative",
    difficulty: "medium",
    irt: params(1.16, -0.1, 0.2),
    text: localize("A pump fills 240 liters in 12 minutes. At the same rate, how much is filled in 35 minutes?"),
    options: [
      localize("560 liters"),
      localize("620 liters"),
      localize("700 liters"),
      localize("720 liters"),
    ],
    correctIndex: 2,
  },
  {
    id: 4,
    category: "cognitive",
    cognitiveDimension: "quantitative",
    difficulty: "hard",
    irt: params(1.38, 0.95, 0.17),
    text: localize("An alloy contains copper and zinc in ratio 5:3. If 16 kg zinc is added, ratio becomes 5:4. Original alloy mass is:"),
    options: [
      localize("48 kg"),
      localize("64 kg"),
      localize("80 kg"),
      localize("96 kg"),
    ],
    correctIndex: 1,
  },
  {
    id: 5,
    category: "cognitive",
    cognitiveDimension: "verbal",
    difficulty: "easy",
    irt: params(0.92, -0.85, 0.23),
    text: localize("Choose the option closest in meaning to 'mitigate'."),
    options: [
      localize("Worsen"),
      localize("Delay"),
      localize("Reduce"),
      localize("Ignore"),
    ],
    correctIndex: 2,
  },
  {
    id: 6,
    category: "cognitive",
    cognitiveDimension: "verbal",
    difficulty: "medium",
    irt: params(1.08, 0.15, 0.21),
    text: localize("Pick the sentence with the most precise technical communication."),
    options: [
      localize("The system broke due to many reasons."),
      localize("Latency rose 40% after cache invalidation during peak load."),
      localize("The output was not so good."),
      localize("Something happened in deployment."),
    ],
    correctIndex: 1,
  },
  {
    id: 7,
    category: "cognitive",
    cognitiveDimension: "spatial",
    difficulty: "medium",
    irt: params(1.18, 0.2, 0.19),
    text: localize("A cube is painted on all sides and cut into 27 equal cubes. How many small cubes have exactly two painted faces?"),
    options: [
      localize("8"),
      localize("12"),
      localize("6"),
      localize("18"),
    ],
    correctIndex: 1,
  },
  {
    id: 8,
    category: "cognitive",
    cognitiveDimension: "spatial",
    difficulty: "hard",
    irt: params(1.44, 1.05, 0.15),
    text: localize("A gear rotates clockwise. The next meshed gear rotates in which direction?"),
    options: [
      localize("Clockwise"),
      localize("Counterclockwise"),
      localize("No rotation"),
      localize("Alternates every second"),
    ],
    correctIndex: 1,
  },
  {
    id: 9,
    category: "cognitive",
    cognitiveDimension: "analytical",
    difficulty: "medium",
    irt: params(1.2, 0.05, 0.2),
    text: localize("Defect rates across 4 weeks are 5%, 4%, 6%, 3%. Which week should be investigated first if production volume was equal?"),
    options: [
      localize("Week 1"),
      localize("Week 2"),
      localize("Week 3"),
      localize("Week 4"),
    ],
    correctIndex: 2,
  },
  {
    id: 10,
    category: "cognitive",
    cognitiveDimension: "analytical",
    difficulty: "hard",
    irt: params(1.5, 1.25, 0.14),
    text: localize("A process has throughput 100 units/hr with 2% rework. After optimization, throughput is 110 units/hr with 3% rework. Net good output change is:"),
    options: [
      localize("+6.8%"),
      localize("+7.6%"),
      localize("+8.2%"),
      localize("+9.0%"),
    ],
    correctIndex: 0,
  },

  {
    id: 11,
    category: "behavioral",
    difficulty: "easy",
    irt: params(0.88, -0.9, 0.25),
    text: localize("SJT: Your teammate misses two standups in a sprint. What do you do first?"),
    options: [
      localize("Escalate to manager immediately"),
      localize("Privately check blockers and align support"),
      localize("Ignore and continue your tasks"),
      localize("Publicly criticize in chat"),
    ],
    correctIndex: 1,
  },
  {
    id: 12,
    category: "behavioral",
    difficulty: "medium",
    irt: params(1.02, -0.05, 0.22),
    text: localize("SJT: You receive severe feedback on your design doc. Best response?"),
    options: [
      localize("Defend each decision without listening"),
      localize("Thank reviewer, clarify concerns, revise with evidence"),
      localize("Withdraw from the project"),
      localize("Wait and hope issue disappears"),
    ],
    correctIndex: 1,
  },
  {
    id: 13,
    category: "behavioral",
    difficulty: "medium",
    irt: params(1.05, 0.1, 0.21),
    text: localize("SJT: Production bug discovered at 11 PM before release. Your action?"),
    options: [
      localize("Ship anyway; fix next week"),
      localize("Assess severity, notify stakeholders, execute rollback/hotfix plan"),
      localize("Turn off alerts"),
      localize("Assign blame first"),
    ],
    correctIndex: 1,
  },
  {
    id: 14,
    category: "behavioral",
    difficulty: "hard",
    irt: params(1.24, 0.8, 0.18),
    text: localize("SJT: A vendor offers gifts during contract evaluation. What is most appropriate?"),
    options: [
      localize("Accept quietly"),
      localize("Report via ethics process and recuse if required"),
      localize("Ask for a bigger gift"),
      localize("Ignore policy due to urgency"),
    ],
    correctIndex: 1,
  },
  {
    id: 15,
    category: "behavioral",
    difficulty: "medium",
    irt: params(1.08, 0.15, 0.2),
    text: localize("SJT: Two priorities conflict and both leaders ask for immediate delivery. First step?"),
    options: [
      localize("Pick one randomly"),
      localize("Clarify impact and negotiate a shared priority plan"),
      localize("Promise both and stay silent"),
      localize("Decline all work"),
    ],
    correctIndex: 1,
  },
  {
    id: 16,
    category: "behavioral",
    difficulty: "easy",
    irt: params(0.9, -0.7, 0.24),
    text: localize("SJT: You are assigned an unfamiliar toolchain. Best learning approach?"),
    options: [
      localize("Wait for formal training only"),
      localize("Build a small prototype and document learnings"),
      localize("Skip toolchain validation"),
      localize("Copy old code blindly"),
    ],
    correctIndex: 1,
  },
  {
    id: 17,
    category: "behavioral",
    difficulty: "hard",
    irt: params(1.26, 0.9, 0.17),
    text: localize("SJT: Your model appears biased for one user group. What should you do?"),
    options: [
      localize("Hide the metrics"),
      localize("Document impact, pause rollout, run mitigation and fairness tests"),
      localize("Blame the dataset owner"),
      localize("Launch and monitor complaints"),
    ],
    correctIndex: 1,
  },
  {
    id: 18,
    category: "behavioral",
    difficulty: "medium",
    irt: params(1.1, 0.2, 0.2),
    text: localize("SJT: A junior teammate asks repeated basic questions. Best response?"),
    options: [
      localize("Tell them to figure it out alone"),
      localize("Coach with examples and point to reusable references"),
      localize("Do all their tasks"),
      localize("Ask manager to remove them"),
    ],
    correctIndex: 1,
  },

  {
    id: 19,
    category: "domain",
    discipline: "cs",
    difficulty: "easy",
    irt: params(0.96, -0.95, 0.22),
    text: localize("CS: Average-case time complexity of hash-table lookup is:"),
    options: [localize("O(1)"), localize("O(log n)"), localize("O(n)"), localize("O(n log n)")],
    correctIndex: 0,
  },
  {
    id: 20,
    category: "domain",
    discipline: "cs",
    difficulty: "medium",
    irt: params(1.17, 0.05, 0.2),
    text: localize("CS: Which isolation level prevents dirty reads but allows non-repeatable reads?"),
    options: [
      localize("Read Uncommitted"),
      localize("Read Committed"),
      localize("Repeatable Read"),
      localize("Serializable"),
    ],
    correctIndex: 1,
  },
  {
    id: 21,
    category: "domain",
    discipline: "cs",
    difficulty: "hard",
    irt: params(1.39, 1.02, 0.16),
    text: localize("CS: In distributed systems, CAP theorem states under partition tolerance you can guarantee:"),
    options: [
      localize("Consistency and availability simultaneously"),
      localize("Either consistency or availability"),
      localize("Only latency"),
      localize("No durability"),
    ],
    correctIndex: 1,
  },
  {
    id: 22,
    category: "domain",
    discipline: "mechanical",
    difficulty: "easy",
    irt: params(0.94, -0.9, 0.23),
    text: localize("Mechanical: In SI units, torque is measured in:"),
    options: [localize("N"), localize("Pa"), localize("N*m"), localize("J/s")],
    correctIndex: 2,
  },
  {
    id: 23,
    category: "domain",
    discipline: "mechanical",
    difficulty: "medium",
    irt: params(1.13, 0.12, 0.2),
    text: localize("Mechanical: Which cycle is idealized for spark-ignition engines?"),
    options: [localize("Diesel cycle"), localize("Otto cycle"), localize("Brayton cycle"), localize("Rankine cycle")],
    correctIndex: 1,
  },
  {
    id: 24,
    category: "domain",
    discipline: "mechanical",
    difficulty: "hard",
    irt: params(1.36, 1.0, 0.17),
    text: localize("Mechanical: The primary function of a flywheel in machinery is to:"),
    options: [
      localize("Increase friction"),
      localize("Store rotational energy and smooth speed fluctuations"),
      localize("Reduce torque to zero"),
      localize("Eliminate bearing loads"),
    ],
    correctIndex: 1,
  },
  {
    id: 25,
    category: "domain",
    discipline: "eee_ece",
    difficulty: "easy",
    irt: params(0.95, -0.88, 0.22),
    text: localize("EEE/ECE: Unit of electrical resistance is:"),
    options: [localize("Henry"), localize("Ohm"), localize("Farad"), localize("Weber")],
    correctIndex: 1,
  },
  {
    id: 26,
    category: "domain",
    discipline: "eee_ece",
    difficulty: "medium",
    irt: params(1.14, 0.08, 0.2),
    text: localize("EEE/ECE: In a PN junction diode under forward bias, depletion region typically:"),
    options: [
      localize("Widens"),
      localize("Narrows"),
      localize("Disappears completely"),
      localize("Becomes superconducting"),
    ],
    correctIndex: 1,
  },
  {
    id: 27,
    category: "domain",
    discipline: "eee_ece",
    difficulty: "hard",
    irt: params(1.4, 1.08, 0.16),
    text: localize("EEE/ECE: Nyquist sampling theorem requires sampling frequency to be at least:"),
    options: [
      localize("Equal to highest frequency"),
      localize("Twice the highest frequency"),
      localize("Half the highest frequency"),
      localize("Independent of signal frequency"),
    ],
    correctIndex: 1,
  },
  {
    id: 28,
    category: "domain",
    discipline: "civil",
    difficulty: "easy",
    irt: params(0.93, -0.92, 0.23),
    text: localize("Civil: Slump test is used to measure:"),
    options: [
      localize("Compressive strength"),
      localize("Workability of fresh concrete"),
      localize("Setting time of cement"),
      localize("Aggregate crushing value"),
    ],
    correctIndex: 1,
  },
  {
    id: 29,
    category: "domain",
    discipline: "civil",
    difficulty: "medium",
    irt: params(1.12, 0.14, 0.2),
    text: localize("Civil: Which survey method is best for detailed small-area topography?"),
    options: [
      localize("Plane table survey"),
      localize("Chain survey"),
      localize("Levelling only"),
      localize("GPS timing survey"),
    ],
    correctIndex: 0,
  },
  {
    id: 30,
    category: "domain",
    discipline: "civil",
    difficulty: "hard",
    irt: params(1.35, 0.98, 0.17),
    text: localize("Civil: In limit state design, factor of safety is primarily addressed through:"),
    options: [
      localize("Working stress only"),
      localize("Partial safety factors for loads and materials"),
      localize("Ignoring variability"),
      localize("Only increasing section size"),
    ],
    correctIndex: 1,
  },
]

export function toPublicQuestions(questions: InternalAssessmentQuestion[]): PublicAssessmentQuestion[] {
  return questions.map(({ correctIndex: _correctIndex, ...rest }) => rest)
}

export function normalizeEngineeringDiscipline(value: unknown): EngineeringDiscipline | null {
  if (typeof value !== "string") {
    return null
  }

  const normalized = value.trim().toLowerCase().replace(/\s+/g, "_")
  if (normalized === "cs" || normalized === "cse" || normalized === "computer_science") {
    return "cs"
  }

  if (normalized === "mechanical" || normalized === "mech") {
    return "mechanical"
  }

  if (normalized === "eee_ece" || normalized === "ece" || normalized === "eee" || normalized === "electronics") {
    return "eee_ece"
  }

  if (normalized === "civil") {
    return "civil"
  }

  return null
}

export function getAssessmentQuestionPool(discipline?: EngineeringDiscipline | null) {
  return assessmentQuestionBank.filter((question) => {
    if (question.category !== "domain") {
      return true
    }

    if (!discipline) {
      return true
    }

    return question.discipline === discipline
  })
}

export function getQuestionCountsByCategory(discipline?: EngineeringDiscipline | null) {
  const pool = getAssessmentQuestionPool(discipline)

  return {
    cognitive: pool.filter((question) => question.category === "cognitive").length,
    behavioral: pool.filter((question) => question.category === "behavioral").length,
    domain: pool.filter((question) => question.category === "domain").length,
    total: pool.length,
  }
}

export function getItemParameters(question: InternalAssessmentQuestion): Irt3plParameters {
  if (question.irt) {
    return question.irt
  }

  if (question.difficulty === "easy") {
    return { a: 0.95, b: -0.8, c: 0.22 }
  }

  if (question.difficulty === "hard") {
    return { a: 1.25, b: 0.8, c: 0.17 }
  }

  return { a: 1.1, b: 0, c: 0.2 }
}

export function getQuestionById(questionId: number) {
  return assessmentQuestionBank.find((question) => question.id === questionId)
}
