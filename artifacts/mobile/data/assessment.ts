export interface AssessmentOption {
  label: string;
  value: string;
}

export interface AssessmentQuestion {
  step: number;
  question: string;
  subtitle: string;
  multiSelect?: boolean;
  maxSelect?: number;
  options: AssessmentOption[];
}

const EDUCATION_QUESTION: AssessmentQuestion = {
  step: 1,
  question: "What's your current educational stage?",
  subtitle: "Let's start with where you are right now",
  options: [
    { label: "Class 10 (appearing or passed)", value: "Class 10th" },
    { label: "Class 12 (appearing or passed)", value: "Class 12th" },
    { label: "Diploma / ITI / Polytechnic", value: "Diploma" },
    { label: "Undergraduate student (BA / BSc / BTech / BBA)", value: "Bachelors" },
    { label: "Postgraduate student (MA / MSc / MTech / MBA)", value: "Masters" },
    { label: "Working professional / Already a graduate", value: "Working" },
  ],
};

const STREAM_QUESTION: AssessmentQuestion = {
  step: 2,
  question: "Which stream or background are you from?",
  subtitle: "Your academic background shapes your career options",
  options: [
    { label: "Science – PCM (Physics, Chemistry, Maths)", value: "Science PCM" },
    { label: "Science – PCB (Physics, Chemistry, Biology)", value: "Science PCB" },
    { label: "Commerce (Accounts, Business Studies, Economics)", value: "Commerce" },
    { label: "Arts / Humanities (History, Political Science, Psychology)", value: "Arts" },
    { label: "Vocational / Technical (ITI, Diploma, Polytechnic)", value: "Vocational" },
    { label: "I'm a working professional", value: "Professional" },
  ],
};

const GOAL_QUESTION: AssessmentQuestion = {
  step: 3,
  question: "What do you most want from your career?",
  subtitle: "Your goal defines the direction we'll recommend",
  options: [
    { label: "A stable, well-paying private sector job", value: "Get a Job" },
    { label: "Prestigious government job (IAS / IPS / PSU / Defence)", value: "Government Job" },
    { label: "Launch my own startup or business", value: "Start a Business" },
    { label: "Go for higher studies (Masters / PhD / MBA abroad)", value: "Higher Education" },
    { label: "Creative or freelance career on my own terms", value: "Get a Job" },
  ],
};

function getInterestsQuestion(stream: string): AssessmentQuestion {
  if (stream === "Science PCM") {
    return {
      step: 4,
      question: "Which of these PCM fields spark your curiosity?",
      subtitle: "Select up to 4 areas that genuinely excite you",
      multiSelect: true,
      maxSelect: 4,
      options: [
        { label: "Coding, apps & software development", value: "Technology" },
        { label: "Artificial intelligence & machine learning", value: "Technology" },
        { label: "Space, satellites & aerospace engineering", value: "Science" },
        { label: "Electronics, circuits & embedded systems", value: "Technology" },
        { label: "Mathematics, statistics & data science", value: "Science" },
        { label: "Finance, stock markets & fintech", value: "Finance" },
        { label: "Civil, mechanical or chemical engineering", value: "Science" },
        { label: "Cybersecurity & ethical hacking", value: "Technology" },
      ],
    };
  }
  if (stream === "Science PCB") {
    return {
      step: 4,
      question: "Which health & life science areas excite you?",
      subtitle: "Select up to 4 areas that genuinely excite you",
      multiSelect: true,
      maxSelect: 4,
      options: [
        { label: "Becoming a doctor (MBBS / NEET)", value: "Healthcare" },
        { label: "Pharmacy, drugs & clinical research", value: "Healthcare" },
        { label: "Biotechnology, genetics & research", value: "Science" },
        { label: "Mental health, psychology & counselling", value: "Healthcare" },
        { label: "Nursing, physiotherapy & allied health", value: "Healthcare" },
        { label: "Environmental science & sustainability", value: "Science" },
        { label: "Nutrition, dietetics & wellness", value: "Healthcare" },
        { label: "Veterinary science & animal care", value: "Science" },
      ],
    };
  }
  if (stream === "Commerce") {
    return {
      step: 4,
      question: "Which business or finance areas interest you most?",
      subtitle: "Select up to 4 areas that genuinely excite you",
      multiSelect: true,
      maxSelect: 4,
      options: [
        { label: "Chartered Accountancy (CA) or CMA", value: "Finance" },
        { label: "Company Secretary (CS) or corporate law", value: "Finance" },
        { label: "Banking, investment & stock markets", value: "Finance" },
        { label: "Marketing, branding & advertising", value: "Business" },
        { label: "Entrepreneurship & startups", value: "Business" },
        { label: "MBA & management consulting", value: "Business" },
        { label: "E-commerce & digital business", value: "Business" },
        { label: "Insurance, actuarial science & risk", value: "Finance" },
      ],
    };
  }
  if (stream === "Arts") {
    return {
      step: 4,
      question: "Which creative or social fields appeal to you?",
      subtitle: "Select up to 4 areas that genuinely excite you",
      multiSelect: true,
      maxSelect: 4,
      options: [
        { label: "Law, justice & the legal system", value: "Law" },
        { label: "Civil services & public administration (UPSC)", value: "Government" },
        { label: "Journalism, media & content creation", value: "Media" },
        { label: "Graphic design, animation & UX", value: "Arts & Design" },
        { label: "Teaching, education & mentoring", value: "Teaching" },
        { label: "Social work, NGOs & community impact", value: "Social Work" },
        { label: "Psychology, counselling & mental health", value: "Healthcare" },
        { label: "Fashion, interiors & visual arts", value: "Arts & Design" },
      ],
    };
  }
  return {
    step: 4,
    question: "Which of these broad areas excite you most?",
    subtitle: "Select up to 5 areas that genuinely excite you",
    multiSelect: true,
    maxSelect: 5,
    options: [
      { label: "Technology & software", value: "Technology" },
      { label: "Healthcare & medicine", value: "Healthcare" },
      { label: "Finance, banking & business", value: "Finance" },
      { label: "Creative arts, design & media", value: "Arts & Design" },
      { label: "Science & research", value: "Science" },
      { label: "Law & governance", value: "Law" },
      { label: "Education & training", value: "Teaching" },
      { label: "Sports, fitness & wellness", value: "Sports" },
      { label: "Entrepreneurship & startups", value: "Business" },
      { label: "Government & public service", value: "Government" },
    ],
  };
}

function getSkillsQuestion(stream: string, interests: string[]): AssessmentQuestion {
  const interestSet = new Set(interests || []);

  if (stream === "Science PCM" || interestSet.has("Technology") || interestSet.has("Science")) {
    return {
      step: 5,
      question: "What are you genuinely good at — be honest!",
      subtitle: "These shape which tech or science career suits you best",
      multiSelect: true,
      options: [
        { label: "Writing logical code or solving algorithm problems", value: "Programming" },
        { label: "Maths, calculus & quantitative reasoning", value: "Mathematics" },
        { label: "Breaking down complex problems step by step", value: "Problem Solving" },
        { label: "Designing visuals, UX or creative layouts", value: "Design" },
        { label: "Analysing data, patterns & drawing insights", value: "Data Analysis" },
        { label: "Communicating & explaining technical ideas clearly", value: "Communication" },
        { label: "Leading teams and taking initiative", value: "Leadership" },
        { label: "Writing — blogs, reports, documentation", value: "Writing" },
      ],
    };
  }
  if (stream === "Science PCB" || interestSet.has("Healthcare")) {
    return {
      step: 5,
      question: "What are you genuinely good at — be honest!",
      subtitle: "These help match you to the right healthcare or science career",
      multiSelect: true,
      options: [
        { label: "Memorising, understanding & applying theory", value: "Problem Solving" },
        { label: "Empathising with and caring for people", value: "Communication" },
        { label: "Biology, anatomy & life sciences", value: "Science" },
        { label: "Research, lab work & scientific thinking", value: "Mathematics" },
        { label: "Maths, statistics & data interpretation", value: "Data Analysis" },
        { label: "Communicating & educating patients/clients", value: "Communication" },
        { label: "Leadership & managing teams under pressure", value: "Leadership" },
        { label: "Writing research papers, case studies & reports", value: "Writing" },
      ],
    };
  }
  if (stream === "Commerce" || interestSet.has("Finance") || interestSet.has("Business")) {
    return {
      step: 5,
      question: "What are you genuinely good at — be honest!",
      subtitle: "These match you to the right finance or business career",
      multiSelect: true,
      options: [
        { label: "Numbers, accounting & financial calculations", value: "Mathematics" },
        { label: "Analysing market trends & business data", value: "Data Analysis" },
        { label: "Negotiating, selling & persuading people", value: "Marketing" },
        { label: "Leading teams & managing projects", value: "Leadership" },
        { label: "Solving business problems creatively", value: "Problem Solving" },
        { label: "Communicating clearly — written & verbal", value: "Communication" },
        { label: "Building products, brands or businesses", value: "Creativity" },
        { label: "Marketing, social media & content creation", value: "Marketing" },
      ],
    };
  }
  return {
    step: 5,
    question: "What are you genuinely good at — be honest!",
    subtitle: "Your natural strengths are the best guide to the right career",
    multiSelect: true,
    options: [
      { label: "Writing, storytelling & creative expression", value: "Writing" },
      { label: "Public speaking, debating & communication", value: "Communication" },
      { label: "Leading, organising & taking charge", value: "Leadership" },
      { label: "Logical thinking & solving complex problems", value: "Problem Solving" },
      { label: "Creative work — art, design, music, film", value: "Creativity" },
      { label: "Helping, counselling & understanding people", value: "Communication" },
      { label: "Marketing, branding & digital content", value: "Marketing" },
      { label: "Research, analysis & critical thinking", value: "Data Analysis" },
    ],
  };
}

function getWorkEnvQuestion(goal: string): AssessmentQuestion {
  return {
    step: 6,
    question: "How do you want to spend your workdays?",
    subtitle: "Where you work matters as much as what you do",
    options: [
      { label: "At a computer — coding, analysing, building", value: "Office" },
      { label: "Meeting people — clients, patients or students", value: "Office" },
      { label: "In a lab, studio or workshop — hands-on work", value: "Field" },
      { label: "Out in the field — sites, events, inspections", value: "Field" },
      { label: "Independently from anywhere — remote / freelance", value: "Remote" },
      goal === "Government Job"
        ? { label: "In government offices & public institutions", value: "Government" }
        : { label: "Running my own business or startup", value: "Freelance" },
    ],
  };
}

const SALARY_QUESTION: AssessmentQuestion = {
  step: 7,
  question: "What salary are you targeting in 5 years?",
  subtitle: "Be ambitious — this helps us filter the right careers",
  options: [
    { label: "₹3 – 5 LPA (Starting out, stability first)", value: "3-5" },
    { label: "₹5 – 10 LPA (Decent growth expected)", value: "5-10" },
    { label: "₹10 – 20 LPA (Good professional career)", value: "10-20" },
    { label: "₹20 – 50 LPA (High-growth or specialist role)", value: "20-50" },
    { label: "₹50+ LPA (Top 1% earner — aiming very high)", value: "50+" },
  ],
};

const RISK_QUESTION: AssessmentQuestion = {
  step: 8,
  question: "How do you handle uncertainty and risk?",
  subtitle: "Your honest answer here leads to the best match",
  options: [
    { label: "Stability first — I need job security & predictable income", value: "low" },
    { label: "Balanced — some calculated risk is fine for better rewards", value: "medium" },
    { label: "Growth-oriented — I can handle uncertainty for bigger gains", value: "high" },
    { label: "Risk-taker — building wealth, uncertainty doesn't scare me", value: "high" },
  ],
};

function parseSingle(raw: string): string {
  return raw.includes("::") ? raw.split("::")[1] : raw;
}

export function getAdaptiveQuestion(
  step: number,
  answers: Record<number, string | string[]>
): AssessmentQuestion {
  const stream = parseSingle((answers[2] as string) || "");
  const goal = parseSingle((answers[3] as string) || "");
  const interests = (answers[4] as string[]) || [];

  switch (step) {
    case 1: return EDUCATION_QUESTION;
    case 2: return STREAM_QUESTION;
    case 3: return GOAL_QUESTION;
    case 4: return getInterestsQuestion(stream);
    case 5: return getSkillsQuestion(stream, interests);
    case 6: return getWorkEnvQuestion(goal);
    case 7: return SALARY_QUESTION;
    case 8: return RISK_QUESTION;
    default: return EDUCATION_QUESTION;
  }
}

export const ASSESSMENT_QUESTIONS: AssessmentQuestion[] = [
  EDUCATION_QUESTION,
  STREAM_QUESTION,
  GOAL_QUESTION,
  getInterestsQuestion(""),
  getSkillsQuestion("", []),
  getWorkEnvQuestion(""),
  SALARY_QUESTION,
  RISK_QUESTION,
];
