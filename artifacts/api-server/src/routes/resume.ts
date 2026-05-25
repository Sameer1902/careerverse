import { Router } from "express";
import multer from "multer";

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
});

const router = Router();

const SYSTEM_PROMPT = `You are an expert AI career counselor, resume analyst, and HR professional deeply familiar with the Indian job market (2024-2025). 

Analyze the provided resume content and return a comprehensive JSON analysis. Be specific, accurate, and India-focused.

Return ONLY valid JSON (no markdown, no code blocks) matching this exact structure:
{
  "atsScore": <number 0-100>,
  "summary": "<2-3 sentence overall assessment focused on India job market fit>",
  "extractedData": {
    "name": "<candidate name or 'Not specified'>",
    "skills": ["<technical skill>", ...],
    "education": ["<Degree, Institution, Year>", ...],
    "experience": ["<Role at Company, Duration>", ...],
    "certifications": ["<certification name>", ...],
    "projects": ["<Project: brief description>", ...],
    "softSkills": ["<soft skill>", ...],
    "interests": ["<interest>", ...]
  },
  "analysis": {
    "strengths": ["<specific strength from resume>", ...],
    "weaknesses": ["<specific weakness or gap>", ...],
    "missingSkills": ["<important missing skill for their target roles>", ...],
    "improvements": ["<actionable resume improvement>", ...]
  },
  "careerMatches": [
    {
      "title": "<Career Title>",
      "matchScore": <number 0-100>,
      "salary": "₹<min>-<max> LPA",
      "demand": "<Very High|High|Moderate|Low>",
      "category": "<Technology|Healthcare|Finance|Engineering|Law|Education|Creative|Government|Science>",
      "icon": "<ionicons-name like code-slash|medical|bar-chart|construct|scale|school|color-palette|business|flask>",
      "reasonForMatch": "<1-2 sentences why this career fits their background>",
      "missingSkills": ["<skill to acquire>", ...],
      "topCourses": [
        { "title": "<course title>", "platform": "<Coursera|edX|NPTEL|YouTube|Udemy|LinkedIn Learning>", "url": "<real URL>" }
      ],
      "topCompanies": ["<Indian company hiring>", ...]
    }
  ],
  "industryTrends": {
    "topHiringCompanies": ["<company>", ...],
    "demandOutlook": "<India market demand outlook for their best-fit career>",
    "avgSalaryRange": "₹<min>-<max> LPA",
    "growthRate": "<percentage growth per year>"
  }
}

Include 5-7 career matches sorted by matchScore descending. Cover diverse categories.
For courses, use real URLs from Coursera, NPTEL, edX, YouTube, or Udemy.
Be specific about Indian companies (Infosys, TCS, Wipro, Flipkart, Zomato, etc.) relevant to each career.`;

async function extractTextFromBuffer(buffer: Buffer, mimeType: string): Promise<string> {
  if (mimeType === "application/pdf") {
    const pdfParse = (await import("pdf-parse")).default;
    const result = await pdfParse(buffer);
    return result.text.slice(0, 12000);
  }
  if (
    mimeType === "application/msword" ||
    mimeType === "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  ) {
    const mammoth = await import("mammoth");
    const result = await mammoth.extractRawText({ buffer });
    return result.value.slice(0, 12000);
  }
  return buffer.toString("utf-8").slice(0, 12000);
}

// ── Skill keyword maps ──────────────────────────────────────────────────────
const SKILL_GROUPS: Record<string, string[]> = {
  tech: ["javascript","typescript","python","java","c++","c#","golang","rust","kotlin","swift","react","angular","vue","node","express","django","flask","spring","html","css","sql","mongodb","postgresql","mysql","redis","docker","kubernetes","aws","azure","gcp","git","linux","bash","tensorflow","pytorch","scikit","pandas","numpy","machine learning","deep learning","nlp","computer vision","data science","blockchain","solidity","flutter","react native","android","ios","xcode","rest","graphql","microservices","devops","ci/cd","jenkins","github actions","terraform","ansible"],
  finance: ["accounting","tally","gst","taxation","audit","financial analysis","excel","power bi","tableau","ca","cma","cfa","sebi","mutual fund","equity","derivatives","risk management","banking","nbfc","ifrs","sap fico","balance sheet","p&l","budgeting","forecasting","investment","portfolio"],
  medical: ["mbbs","bds","nursing","pharmacy","physiotherapy","anatomy","pathology","radiology","surgery","clinical","patient care","medical coding","healthcare","hospital","icd","cpt","emr","ehr","bls","acls","pharmacology","biochemistry","microbiology"],
  law: ["llb","llm","legal","litigation","contract","corporate law","ipc","crpc","constitution","arbitration","compliance","intellectual property","trademark","copyright","legal research","court","advocate","barrister","legal drafting"],
  design: ["figma","sketch","adobe xd","photoshop","illustrator","indesign","after effects","premiere pro","canva","ui","ux","wireframe","prototype","branding","typography","motion graphics","3d","blender","maya","animation","video editing"],
  marketing: ["seo","sem","google ads","facebook ads","social media","content marketing","email marketing","crm","hubspot","salesforce","market research","brand management","pr","influencer","growth hacking","analytics","google analytics","a/b testing","copywriting","storytelling"],
  management: ["project management","pmp","agile","scrum","kanban","jira","leadership","team management","stakeholder","mba","strategy","operations","supply chain","logistics","erp","sap","six sigma","lean","bpo","kpi","oKr"],
  science: ["research","lab","chemistry","biology","physics","genetics","biotechnology","bioinformatics","environmental","geology","materials science","nanotechnology","spectroscopy","pcr","gel electrophoresis","matlab","r programming","spss","statistics","hypothesis","clinical trials"],
};

function detectSkills(text: string): { domain: string; skills: string[]; score: number }[] {
  const lower = text.toLowerCase();
  return Object.entries(SKILL_GROUPS).map(([domain, keywords]) => {
    const found = keywords.filter((kw) => lower.includes(kw));
    return { domain, skills: found, score: found.length };
  }).sort((a, b) => b.score - a.score);
}

function extractName(text: string): string {
  const lines = text.split(/\n/).map((l) => l.trim()).filter(Boolean);
  for (const line of lines.slice(0, 6)) {
    if (/^[A-Z][a-z]+ [A-Z][a-z]+/.test(line) && line.split(" ").length <= 4 && line.length < 50) {
      return line;
    }
  }
  return "Not specified";
}

function extractEducation(text: string): string[] {
  const edu: string[] = [];
  const patterns = [
    /\b(b\.?tech|b\.?e|m\.?tech|m\.?e|bsc|msc|b\.?com|m\.?com|bba|mba|llb|llm|mbbs|bds|phd|diploma)\b[^\n]*/gi,
    /\b(bachelor|master|doctor|graduate|post.?graduate)\b[^\n]*/gi,
    /\b(iit|iim|nit|bits|du|anna university|vtu|mumbai university|pune university)\b[^\n]*/gi,
  ];
  for (const pat of patterns) {
    const matches = text.match(pat) || [];
    for (const m of matches.slice(0, 3)) {
      const clean = m.trim().slice(0, 80);
      if (clean && !edu.includes(clean)) edu.push(clean);
    }
  }
  return edu.length ? edu : ["Education details not found"];
}

function extractExperience(text: string): string[] {
  const exp: string[] = [];
  const patterns = [
    /(?:engineer|developer|analyst|manager|consultant|designer|intern|associate|executive|officer)[^\n]*/gi,
    /\b\d+\s*(?:year|yr|month)s?\s*(?:of\s*)?(?:experience|exp)\b[^\n]*/gi,
  ];
  for (const pat of patterns) {
    const matches = text.match(pat) || [];
    for (const m of matches.slice(0, 4)) {
      const clean = m.trim().slice(0, 80);
      if (clean && !exp.includes(clean)) exp.push(clean);
    }
  }
  return exp.length ? exp : ["No work experience listed"];
}

// ── Career template library ─────────────────────────────────────────────────
type CareerTemplate = {
  title: string; salary: string; demand: string; category: string; icon: string;
  courses: Array<{ title: string; platform: string; url: string }>;
  companies: string[]; missing: string[];
};

const CAREER_TEMPLATES: Record<string, CareerTemplate> = {
  tech: {
    title: "Software Engineer", salary: "₹6-25 LPA", demand: "Very High",
    category: "Technology", icon: "code-slash",
    courses: [
      { title: "Full Stack Web Development", platform: "Coursera", url: "https://www.coursera.org/specializations/full-stack-react" },
      { title: "DSA & System Design", platform: "Udemy", url: "https://www.udemy.com/course/datastructurescncpp/" },
      { title: "NPTEL Programming in Python", platform: "NPTEL", url: "https://nptel.ac.in/courses/106/106/106106182/" },
    ],
    companies: ["TCS", "Infosys", "Wipro", "HCL", "Flipkart", "Swiggy", "Razorpay"],
    missing: ["System Design", "DSA", "Cloud Deployment"],
  },
  finance: {
    title: "Financial Analyst", salary: "₹5-18 LPA", demand: "High",
    category: "Finance", icon: "bar-chart",
    courses: [
      { title: "Financial Analysis & Valuation", platform: "Coursera", url: "https://www.coursera.org/learn/financial-analysis" },
      { title: "CFA Level 1 Prep", platform: "Udemy", url: "https://www.udemy.com/course/cfa-level-1/" },
      { title: "Excel for Finance", platform: "Udemy", url: "https://www.udemy.com/course/excel-for-finance/" },
    ],
    companies: ["HDFC Bank", "ICICI Bank", "Kotak", "Deloitte", "KPMG", "Goldman Sachs", "Morgan Stanley"],
    missing: ["Bloomberg Terminal", "Financial Modelling", "Python for Finance"],
  },
  medical: {
    title: "Healthcare Professional", salary: "₹4-20 LPA", demand: "Very High",
    category: "Healthcare", icon: "medical",
    courses: [
      { title: "Medical Coding & Billing", platform: "Coursera", url: "https://www.coursera.org/learn/medical-coding" },
      { title: "Healthcare Management", platform: "edX", url: "https://www.edx.org/course/healthcare-management" },
      { title: "Clinical Research", platform: "NPTEL", url: "https://nptel.ac.in/courses/121/106/121106032/" },
    ],
    companies: ["Apollo Hospitals", "Fortis", "Max Healthcare", "Manipal Hospitals", "AIIMS"],
    missing: ["Clinical Research Certification", "Healthcare IT (EMR/EHR)", "Telemedicine"],
  },
  law: {
    title: "Legal Professional", salary: "₹4-20 LPA", demand: "High",
    category: "Law", icon: "scale",
    courses: [
      { title: "Introduction to Corporate Law", platform: "Coursera", url: "https://www.coursera.org/learn/corporate-law" },
      { title: "Legal Research & Writing", platform: "edX", url: "https://www.edx.org/course/legal-research" },
      { title: "Intellectual Property Law", platform: "Coursera", url: "https://www.coursera.org/learn/intellectual-property-law" },
    ],
    companies: ["Shardul Amarchand", "AZB & Partners", "Cyril Amarchand", "Trilegal", "IndusLaw"],
    missing: ["Contract Drafting", "Arbitration", "Compliance Management"],
  },
  design: {
    title: "UX/UI Designer", salary: "₹4-18 LPA", demand: "High",
    category: "Creative", icon: "color-palette",
    courses: [
      { title: "Google UX Design Certificate", platform: "Coursera", url: "https://www.coursera.org/professional-certificates/google-ux-design" },
      { title: "UI/UX Design Bootcamp", platform: "Udemy", url: "https://www.udemy.com/course/ui-ux-web-design-using-adobe-xd/" },
      { title: "Figma Essentials", platform: "YouTube", url: "https://www.youtube.com/watch?v=kbZejnPXyLM" },
    ],
    companies: ["Flipkart", "Myntra", "Swiggy", "Zomato", "Urban Company", "Razorpay", "PhonePe"],
    missing: ["User Research", "Prototyping", "Design Systems"],
  },
  marketing: {
    title: "Digital Marketing Specialist", salary: "₹3-15 LPA", demand: "High",
    category: "Business", icon: "megaphone",
    courses: [
      { title: "Google Digital Marketing", platform: "Coursera", url: "https://www.coursera.org/professional-certificates/google-digital-marketing-ecommerce" },
      { title: "Social Media Marketing", platform: "Udemy", url: "https://www.udemy.com/course/social-media-marketing-agency/" },
      { title: "SEO 2024 Complete Guide", platform: "YouTube", url: "https://www.youtube.com/watch?v=xsVTqzratPs" },
    ],
    companies: ["Dentsu", "WPP India", "Ogilvy", "McCann", "Publicis", "Zomato", "Nykaa"],
    missing: ["Google Ads Certification", "Marketing Analytics", "Content Strategy"],
  },
  management: {
    title: "Business Analyst / Product Manager", salary: "₹6-22 LPA", demand: "Very High",
    category: "Business", icon: "briefcase",
    courses: [
      { title: "Business Analytics Specialization", platform: "Coursera", url: "https://www.coursera.org/specializations/business-analytics" },
      { title: "Agile & Scrum Master", platform: "Udemy", url: "https://www.udemy.com/course/agile-fundamentals-including-scrum-kanban/" },
      { title: "Product Management", platform: "edX", url: "https://www.edx.org/professional-certificate/product-management" },
    ],
    companies: ["McKinsey", "BCG", "Bain", "Amazon", "Google", "Microsoft", "Accenture"],
    missing: ["SQL & Data Analysis", "Stakeholder Communication", "A/B Testing"],
  },
  science: {
    title: "Research Scientist / Data Scientist", salary: "₹6-20 LPA", demand: "High",
    category: "Science", icon: "flask",
    courses: [
      { title: "Machine Learning Specialization", platform: "Coursera", url: "https://www.coursera.org/specializations/machine-learning-introduction" },
      { title: "Data Science with Python", platform: "NPTEL", url: "https://nptel.ac.in/courses/106/106/106106212/" },
      { title: "Research Methodology", platform: "edX", url: "https://www.edx.org/course/introduction-to-research" },
    ],
    companies: ["ISRO", "DRDO", "BARC", "IISc", "IITs", "Tata Institute", "Wipro AI"],
    missing: ["Statistical Modelling", "Research Publication", "Deep Learning"],
  },
};

function buildFallbackAnalysis(text: string, fileName: string) {
  const domainScores = detectSkills(text);
  const topDomain = domainScores[0];
  const secondDomain = domainScores[1];

  const name = extractName(text);
  const education = extractEducation(text);
  const experience = extractExperience(text);
  const allSkills = domainScores.flatMap((d) => d.skills).slice(0, 15);
  const softSkills = ["Communication", "Problem Solving", "Team Collaboration", "Adaptability", "Time Management"];

  const hasExperience = experience.some((e) => !e.includes("No work"));
  const hasGoodSkills = allSkills.length >= 5;
  const hasEducation = !education[0]?.includes("not found");
  const atsScore = Math.min(
    40 + (hasExperience ? 20 : 0) + (hasGoodSkills ? 20 : 0) + (hasEducation ? 12 : 0) + Math.min(allSkills.length, 8),
    92
  );

  const primaryTemplate = CAREER_TEMPLATES[topDomain?.domain] ?? CAREER_TEMPLATES["tech"]!;
  const secondTemplate = CAREER_TEMPLATES[secondDomain?.domain ?? "management"] ?? CAREER_TEMPLATES["management"]!;

  const careerMatches = [
    {
      title: primaryTemplate.title,
      matchScore: Math.min(88 + Math.min(topDomain?.score ?? 0, 8), 96),
      salary: primaryTemplate.salary,
      demand: primaryTemplate.demand,
      category: primaryTemplate.category,
      icon: primaryTemplate.icon,
      reasonForMatch: `Your skills in ${(topDomain?.skills ?? ["your field"]).slice(0, 3).join(", ")} align strongly with this role. India has high demand for this profile across product companies and service firms.`,
      missingSkills: primaryTemplate.missing,
      topCourses: primaryTemplate.courses,
      topCompanies: primaryTemplate.companies,
    },
    {
      title: secondTemplate.title,
      matchScore: Math.max(65, Math.min(78 + Math.min(secondDomain?.score ?? 0, 6), 85)),
      salary: secondTemplate.salary,
      demand: secondTemplate.demand,
      category: secondTemplate.category,
      icon: secondTemplate.icon,
      reasonForMatch: `Your background shows potential crossover into this field. With focused upskilling in the missing areas, this is a strong alternate path.`,
      missingSkills: secondTemplate.missing,
      topCourses: secondTemplate.courses,
      topCompanies: secondTemplate.companies,
    },
    {
      title: "Management Consultant",
      matchScore: 62,
      salary: "₹8-30 LPA",
      demand: "High",
      category: "Business",
      icon: "people",
      reasonForMatch: "Analytical candidates with domain expertise are highly valued in consulting. Your background transfers well with added business acumen.",
      missingSkills: ["Case Interviews", "Slide Deck Presentations", "Business Strategy"],
      topCourses: [
        { title: "Consulting Skills", platform: "Coursera", url: "https://www.coursera.org/learn/strategy-business" },
        { title: "Management Consulting Case Prep", platform: "YouTube", url: "https://www.youtube.com/watch?v=RLon8iLHfKY" },
      ],
      topCompanies: ["McKinsey India", "BCG India", "Bain India", "Deloitte", "EY", "PwC"],
    },
    {
      title: "Entrepreneur / Startup Founder",
      matchScore: 58,
      salary: "₹Variable",
      demand: "Moderate",
      category: "Business",
      icon: "rocket",
      reasonForMatch: "Your technical or domain expertise is a strong foundation for building a product or service startup in India's growing ecosystem.",
      missingSkills: ["Fundraising", "Go-to-Market Strategy", "Financial Modelling"],
      topCourses: [
        { title: "Entrepreneurship Specialization", platform: "Coursera", url: "https://www.coursera.org/specializations/entrepreneurship" },
        { title: "Startup School", platform: "YouTube", url: "https://www.youtube.com/playlist?list=PL5q_lef6zVkaTY_cT1k7qFNF2TidHCe21" },
      ],
      topCompanies: ["Y Combinator India", "Sequoia India", "Accel", "Blume Ventures", "Kalaari Capital"],
    },
  ];

  const missingFromResume = [
    "Quantified achievements (e.g., 'Improved performance by 30%')",
    "Certifications relevant to your domain",
    "LinkedIn profile URL",
    "GitHub / Portfolio link",
  ].filter((_, i) => i < (4 - Math.min(allSkills.length, 3)));

  return {
    atsScore,
    summary: `Your resume demonstrates ${topDomain?.score > 3 ? "strong" : "some"} domain expertise${name !== "Not specified" ? ` (${name})` : ""} with ${allSkills.length} detected skills. ${hasExperience ? "Your work experience adds credibility to your profile." : "Adding internship or project experience will significantly strengthen your profile."} For India's 2025 job market, focusing on ${primaryTemplate.title} and upskilling in the identified gaps will improve your ATS pass rate.`,
    extractedData: {
      name,
      skills: allSkills.length ? allSkills : ["Skills not clearly listed — add a dedicated Skills section"],
      education,
      experience,
      certifications: text.match(/\b(certified|certification|certificate|aws|google|microsoft|pmp|cfa|ca |acca)\b[^\n]*/gi)?.slice(0, 4).map((s) => s.trim()) ?? ["No certifications listed"],
      projects: text.match(/\b(project|built|developed|created|designed|implemented)\b[^\n]*/gi)?.slice(0, 4).map((s) => s.trim()) ?? ["No projects listed"],
      softSkills,
      interests: text.match(/\b(interest|hobbies|passion|enjoy)\b[^\n]*/gi)?.slice(0, 3).map((s) => s.trim()) ?? ["Not specified"],
    },
    analysis: {
      strengths: [
        allSkills.length > 4 ? `Good technical breadth — ${allSkills.slice(0, 3).join(", ")} and more` : "Clear domain focus",
        hasEducation ? `Solid educational background: ${education[0]?.slice(0, 60)}` : "Structured experience section",
        hasExperience ? "Hands-on work experience demonstrated" : "Project-based experience shown",
      ],
      weaknesses: [
        "ATS keywords could be stronger — match job descriptions more closely",
        "Achievements are not quantified with numbers or impact metrics",
        allSkills.length < 5 ? "Technical skills section needs expansion" : "Could add more India-specific tools and platforms",
      ],
      missingSkills: primaryTemplate.missing,
      improvements: [
        "Add a 2-3 line professional summary at the top of your resume",
        "Quantify every achievement: 'Increased sales by 25%', 'Reduced load time by 40%'",
        "Add links to GitHub, LinkedIn, or portfolio",
        ...missingFromResume,
        "Tailor resume keywords to each job description before applying",
      ].slice(0, 5),
    },
    careerMatches,
    industryTrends: {
      topHiringCompanies: primaryTemplate.companies,
      demandOutlook: `Demand for ${primaryTemplate.title}s in India is ${primaryTemplate.demand.toLowerCase()} and growing in 2025, driven by digital transformation, startup ecosystem expansion, and MNC hiring in Tier-1 cities.`,
      avgSalaryRange: primaryTemplate.salary,
      growthRate: "12-18% per year",
    },
  };
}

router.post("/resume/analyze", upload.single("file"), async (req, res) => {
  try {
    const file = req.file;
    if (!file) {
      res.status(400).json({ error: "No file uploaded" });
      return;
    }

    const apiKey = process.env["OPENAI_API_KEY"];

    const isImage = file.mimetype.startsWith("image/");
    let extractedText = "";

    if (!isImage) {
      try {
        extractedText = await extractTextFromBuffer(file.buffer, file.mimetype);
      } catch {
        extractedText = file.buffer.toString("utf-8").slice(0, 12000);
      }
    }

    if (apiKey) {
      let messages: object[];

      if (isImage) {
        const base64 = file.buffer.toString("base64");
        const dataUrl = `data:${file.mimetype};base64,${base64}`;
        messages = [
          {
            role: "user",
            content: [
              { type: "text", text: "Analyze this resume image thoroughly. Extract all visible text and information, then provide the complete analysis." },
              { type: "image_url", image_url: { url: dataUrl, detail: "high" } },
            ],
          },
        ];
      } else {
        if (!extractedText.trim()) {
          res.status(400).json({ error: "Could not extract text from the uploaded file" });
          return;
        }
        messages = [
          {
            role: "user",
            content: `Analyze this resume thoroughly and provide the complete career analysis.\n\nRESUME CONTENT:\n${extractedText}`,
          },
        ];
      }

      const openAIResponse = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: [{ role: "system", content: SYSTEM_PROMPT }, ...messages],
          max_tokens: 4000,
          response_format: { type: "json_object" },
          temperature: 0.3,
        }),
      });

      if (openAIResponse.ok) {
        const openAIData = (await openAIResponse.json()) as {
          choices: Array<{ message: { content: string } }>;
        };
        const content = openAIData.choices[0]?.message?.content;
        if (content) {
          const analysis = JSON.parse(content);
          res.json(analysis);
          return;
        }
      } else {
        req.log.error({ status: openAIResponse.status }, "OpenAI API error — falling back to local analysis");
      }
    }

    const textForAnalysis = isImage
      ? `Resume file: ${file.originalname}`
      : extractedText || file.originalname;

    const fallback = buildFallbackAnalysis(textForAnalysis, file.originalname);
    res.json(fallback);
  } catch (err) {
    req.log.error({ err }, "Resume analysis failed");
    res.status(500).json({ error: "Resume analysis failed. Please try again." });
  }
});

export default router;
