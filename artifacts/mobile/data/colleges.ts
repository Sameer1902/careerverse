export interface College {
  name: string;
  location: string;
  state: string;
  type:
    | "IIT"
    | "NIT"
    | "IIM"
    | "IIIT"
    | "AIIMS"
    | "Central University"
    | "State University"
    | "Deemed University"
    | "Institute of National Importance"
    | "Private University"
    | "Autonomous College";
  ranking: number;
  fees: string;
  admission: string;
  website: string;
}

const TECH_COLLEGES: College[] = [
  { name: "IIT Bombay", location: "Mumbai, Maharashtra", state: "Maharashtra", type: "IIT", ranking: 3, fees: "₹2.2L/yr", admission: "JEE Advanced", website: "https://www.iitb.ac.in" },
  { name: "IIT Delhi", location: "New Delhi", state: "Delhi", type: "IIT", ranking: 2, fees: "₹2.1L/yr", admission: "JEE Advanced", website: "https://home.iitd.ac.in" },
  { name: "IIT Madras", location: "Chennai, Tamil Nadu", state: "Tamil Nadu", type: "IIT", ranking: 1, fees: "₹2.1L/yr", admission: "JEE Advanced", website: "https://www.iitm.ac.in" },
  { name: "IIT Kanpur", location: "Kanpur, Uttar Pradesh", state: "Uttar Pradesh", type: "IIT", ranking: 4, fees: "₹2.2L/yr", admission: "JEE Advanced", website: "https://www.iitk.ac.in" },
  { name: "IIT Kharagpur", location: "Kharagpur, West Bengal", state: "West Bengal", type: "IIT", ranking: 5, fees: "₹1.4L/yr", admission: "JEE Advanced", website: "https://www.iitkgp.ac.in" },
  { name: "IIT Hyderabad", location: "Hyderabad, Telangana", state: "Telangana", type: "IIT", ranking: 8, fees: "₹2.2L/yr", admission: "JEE Advanced", website: "https://www.iith.ac.in" },
  { name: "IIT Roorkee", location: "Roorkee, Uttarakhand", state: "Uttarakhand", type: "IIT", ranking: 6, fees: "₹2.2L/yr", admission: "JEE Advanced", website: "https://www.iitr.ac.in" },
  { name: "NIT Trichy", location: "Tiruchirappalli, Tamil Nadu", state: "Tamil Nadu", type: "NIT", ranking: 9, fees: "₹1.5L/yr", admission: "JEE Main", website: "https://www.nitt.edu" },
  { name: "NIT Warangal", location: "Warangal, Telangana", state: "Telangana", type: "NIT", ranking: 25, fees: "₹1.4L/yr", admission: "JEE Main", website: "https://www.nitw.ac.in" },
  { name: "NIT Surathkal", location: "Mangalore, Karnataka", state: "Karnataka", type: "NIT", ranking: 15, fees: "₹1.4L/yr", admission: "JEE Main", website: "https://www.nitk.ac.in" },
  { name: "IIIT Hyderabad", location: "Hyderabad, Telangana", state: "Telangana", type: "IIIT", ranking: 30, fees: "₹3.5L/yr", admission: "UGEE / JEE Main", website: "https://www.iiit.ac.in" },
  { name: "BITS Pilani", location: "Pilani, Rajasthan", state: "Rajasthan", type: "Deemed University", ranking: 28, fees: "₹5.5L/yr", admission: "BITSAT", website: "https://www.bits-pilani.ac.in" },
  { name: "DTU Delhi", location: "New Delhi", state: "Delhi", type: "State University", ranking: 35, fees: "₹1.8L/yr", admission: "JEE Main", website: "https://dtu.ac.in" },
  { name: "VIT Vellore", location: "Vellore, Tamil Nadu", state: "Tamil Nadu", type: "Deemed University", ranking: 11, fees: "₹3.2L/yr", admission: "VITEEE", website: "https://vit.ac.in" },
  { name: "Manipal Institute of Technology", location: "Manipal, Karnataka", state: "Karnataka", type: "Deemed University", ranking: 55, fees: "₹4.2L/yr", admission: "MET / JEE Main", website: "https://manipal.edu/mit.html" },
  { name: "SRM Institute of Science & Technology", location: "Chennai, Tamil Nadu", state: "Tamil Nadu", type: "Deemed University", ranking: 52, fees: "₹3.5L/yr", admission: "SRMJEE", website: "https://www.srmist.edu.in" },
  { name: "Thapar Institute of Engineering", location: "Patiala, Punjab", state: "Punjab", type: "Deemed University", ranking: 32, fees: "₹3.8L/yr", admission: "JEE Main", website: "https://www.thapar.edu" },
  { name: "Amity University Noida", location: "Noida, Uttar Pradesh", state: "Uttar Pradesh", type: "Private University", ranking: 70, fees: "₹2.8L/yr", admission: "AMUEEE / Merit", website: "https://www.amity.edu" },
  { name: "Jadavpur University", location: "Kolkata, West Bengal", state: "West Bengal", type: "State University", ranking: 15, fees: "₹15K/yr", admission: "WBJEE", website: "https://jadavpuruniversity.in" },
  { name: "PEC University of Technology", location: "Chandigarh", state: "Chandigarh", type: "State University", ranking: 45, fees: "₹1.2L/yr", admission: "JEE Main", website: "https://pec.ac.in" },
];

const BUSINESS_COLLEGES: College[] = [
  { name: "IIM Ahmedabad", location: "Ahmedabad, Gujarat", state: "Gujarat", type: "IIM", ranking: 1, fees: "₹23L total", admission: "CAT", website: "https://www.iima.ac.in" },
  { name: "IIM Bangalore", location: "Bangalore, Karnataka", state: "Karnataka", type: "IIM", ranking: 2, fees: "₹24L total", admission: "CAT", website: "https://www.iimb.ac.in" },
  { name: "IIM Calcutta", location: "Kolkata, West Bengal", state: "West Bengal", type: "IIM", ranking: 3, fees: "₹27L total", admission: "CAT", website: "https://www.iimcal.ac.in" },
  { name: "IIM Lucknow", location: "Lucknow, Uttar Pradesh", state: "Uttar Pradesh", type: "IIM", ranking: 4, fees: "₹19L total", admission: "CAT", website: "https://www.iiml.ac.in" },
  { name: "IIM Kozhikode", location: "Kozhikode, Kerala", state: "Kerala", type: "IIM", ranking: 5, fees: "₹20L total", admission: "CAT", website: "https://www.iimk.ac.in" },
  { name: "ISB Hyderabad", location: "Hyderabad, Telangana", state: "Telangana", type: "Deemed University", ranking: 6, fees: "₹42L total", admission: "GMAT / GRE", website: "https://www.isb.edu" },
  { name: "FMS Delhi", location: "New Delhi", state: "Delhi", type: "Central University", ranking: 7, fees: "₹22K total", admission: "CAT", website: "https://fms.edu" },
  { name: "XLRI Jamshedpur", location: "Jamshedpur, Jharkhand", state: "Jharkhand", type: "Autonomous College", ranking: 8, fees: "₹26L total", admission: "XAT", website: "https://www.xlri.ac.in" },
  { name: "MDI Gurgaon", location: "Gurugram, Haryana", state: "Haryana", type: "Autonomous College", ranking: 10, fees: "₹22L total", admission: "CAT", website: "https://www.mdi.ac.in" },
  { name: "TISS Mumbai", location: "Mumbai, Maharashtra", state: "Maharashtra", type: "Deemed University", ranking: 12, fees: "₹1.5L/yr", admission: "TISS-NET", website: "https://www.tiss.edu" },
  { name: "Symbiosis Institute of Business Management", location: "Pune, Maharashtra", state: "Maharashtra", type: "Deemed University", ranking: 15, fees: "₹15L total", admission: "SNAP", website: "https://sibm.edu.in" },
  { name: "IMT Ghaziabad", location: "Ghaziabad, Uttar Pradesh", state: "Uttar Pradesh", type: "Autonomous College", ranking: 18, fees: "₹18L total", admission: "CAT / XAT", website: "https://www.imt.edu" },
  { name: "Great Lakes Institute of Management", location: "Chennai, Tamil Nadu", state: "Tamil Nadu", type: "Autonomous College", ranking: 22, fees: "₹15L total", admission: "CAT / GMAT", website: "https://www.greatlakes.edu.in" },
  { name: "Narsee Monjee Institute (NMIMS)", location: "Mumbai, Maharashtra", state: "Maharashtra", type: "Deemed University", ranking: 20, fees: "₹17L total", admission: "NMAT", website: "https://www.nmims.edu" },
  { name: "Amity Business School", location: "Noida, Uttar Pradesh", state: "Uttar Pradesh", type: "Private University", ranking: 35, fees: "₹6L/yr", admission: "CAT / Merit", website: "https://www.amity.edu/abs" },
  { name: "Shailesh J Mehta School of Management, IIT Bombay", location: "Mumbai, Maharashtra", state: "Maharashtra", type: "IIT", ranking: 9, fees: "₹10L total", admission: "CAT", website: "https://www.som.iitb.ac.in" },
];

const FINANCE_COLLEGES: College[] = [
  { name: "Shri Ram College of Commerce (SRCC)", location: "New Delhi", state: "Delhi", type: "Autonomous College", ranking: 1, fees: "₹25K/yr", admission: "DU CUET", website: "https://srcc.du.ac.in" },
  { name: "Lady Shri Ram College (LSR)", location: "New Delhi", state: "Delhi", type: "Autonomous College", ranking: 2, fees: "₹25K/yr", admission: "DU CUET", website: "https://lsr.edu.in" },
  { name: "HR College of Commerce", location: "Mumbai, Maharashtra", state: "Maharashtra", type: "Autonomous College", ranking: 3, fees: "₹30K/yr", admission: "MH CET", website: "https://hrcollege.edu" },
  { name: "St. Xavier's College Kolkata", location: "Kolkata, West Bengal", state: "West Bengal", type: "Autonomous College", ranking: 4, fees: "₹30K/yr", admission: "Merit", website: "https://www.sxccal.edu" },
  { name: "Loyola College Chennai", location: "Chennai, Tamil Nadu", state: "Tamil Nadu", type: "Autonomous College", ranking: 5, fees: "₹25K/yr", admission: "Merit", website: "https://www.loyolacollege.edu" },
  { name: "Christ University Bangalore", location: "Bangalore, Karnataka", state: "Karnataka", type: "Deemed University", ranking: 6, fees: "₹1.2L/yr", admission: "CUET / Merit", website: "https://www.christuniversity.in" },
  { name: "Narsee Monjee College of Commerce", location: "Mumbai, Maharashtra", state: "Maharashtra", type: "Autonomous College", ranking: 7, fees: "₹40K/yr", admission: "CET", website: "https://nmcollege.in" },
  { name: "ICFAI Business School", location: "Multiple Cities", state: "Pan India", type: "Deemed University", ranking: 25, fees: "₹4L/yr", admission: "IBSAT", website: "https://www.ibsindia.org" },
  { name: "Symbiosis School of Economics", location: "Pune, Maharashtra", state: "Maharashtra", type: "Deemed University", ranking: 10, fees: "₹1.5L/yr", admission: "SET", website: "https://sse.ac.in" },
  { name: "ICAI (CA Foundation to Finals)", location: "Pan India", state: "Pan India", type: "Autonomous College", ranking: 1, fees: "₹30K total", admission: "CA Foundation", website: "https://www.icai.org" },
  { name: "Presidency College Kolkata", location: "Kolkata, West Bengal", state: "West Bengal", type: "State University", ranking: 8, fees: "₹10K/yr", admission: "Merit", website: "https://www.presicol.ac.in" },
  { name: "Government College of Commerce Chandigarh", location: "Chandigarh", state: "Chandigarh", type: "State University", ranking: 12, fees: "₹15K/yr", admission: "Merit", website: "https://gcc.chandigarh.gov.in" },
];

const HEALTHCARE_COLLEGES: College[] = [
  { name: "AIIMS New Delhi", location: "New Delhi", state: "Delhi", type: "AIIMS", ranking: 1, fees: "₹7K/yr", admission: "NEET UG", website: "https://www.aiims.edu" },
  { name: "AIIMS Bangalore", location: "Bangalore, Karnataka", state: "Karnataka", type: "AIIMS", ranking: 5, fees: "₹8K/yr", admission: "NEET UG", website: "https://nimhans.ac.in" },
  { name: "JIPMER Puducherry", location: "Puducherry", state: "Puducherry", type: "Institute of National Importance", ranking: 3, fees: "₹5K/yr", admission: "NEET UG", website: "https://jipmer.edu.in" },
  { name: "CMC Vellore", location: "Vellore, Tamil Nadu", state: "Tamil Nadu", type: "Deemed University", ranking: 2, fees: "₹1L/yr", admission: "NEET UG", website: "https://www.cmch-vellore.edu" },
  { name: "Kasturba Medical College Manipal", location: "Manipal, Karnataka", state: "Karnataka", type: "Deemed University", ranking: 6, fees: "₹18L/yr", admission: "NEET UG", website: "https://manipal.edu/kmc.html" },
  { name: "Maulana Azad Medical College", location: "New Delhi", state: "Delhi", type: "State University", ranking: 4, fees: "₹25K/yr", admission: "NEET UG", website: "https://www.mamc.ac.in" },
  { name: "King George's Medical University", location: "Lucknow, Uttar Pradesh", state: "Uttar Pradesh", type: "State University", ranking: 7, fees: "₹40K/yr", admission: "NEET UG", website: "https://kgmu.org" },
  { name: "Sri Ramachandra Institute", location: "Chennai, Tamil Nadu", state: "Tamil Nadu", type: "Deemed University", ranking: 8, fees: "₹12L/yr", admission: "NEET UG", website: "https://www.sriramachandra.edu.in" },
  { name: "Amrita Institute of Medical Sciences", location: "Coimbatore, Tamil Nadu", state: "Tamil Nadu", type: "Deemed University", ranking: 9, fees: "₹15L/yr", admission: "NEET UG", website: "https://www.amrita.edu/aims" },
  { name: "JSS Medical College", location: "Mysore, Karnataka", state: "Karnataka", type: "Deemed University", ranking: 10, fees: "₹10L/yr", admission: "NEET UG", website: "https://jssuni.edu.in" },
  { name: "Grant Medical College Mumbai", location: "Mumbai, Maharashtra", state: "Maharashtra", type: "State University", ranking: 11, fees: "₹30K/yr", admission: "NEET UG", website: "https://www.grantmedicalcollege.org" },
  { name: "Government Medical College Chandigarh", location: "Chandigarh", state: "Chandigarh", type: "Central University", ranking: 12, fees: "₹20K/yr", admission: "NEET UG", website: "https://gmch.gov.in" },
  { name: "Jawaharlal Nehru Medical College", location: "Belgaum, Karnataka", state: "Karnataka", type: "Deemed University", ranking: 14, fees: "₹7L/yr", admission: "NEET UG", website: "https://www.klesdch.com" },
  { name: "Saveetha Medical College", location: "Chennai, Tamil Nadu", state: "Tamil Nadu", type: "Deemed University", ranking: 15, fees: "₹14L/yr", admission: "NEET UG", website: "https://www.saveetha.com" },
];

const DESIGN_COLLEGES: College[] = [
  { name: "NID Ahmedabad", location: "Ahmedabad, Gujarat", state: "Gujarat", type: "Institute of National Importance", ranking: 1, fees: "₹2.8L/yr", admission: "NID DAT", website: "https://www.nid.edu" },
  { name: "NID Bangalore", location: "Bangalore, Karnataka", state: "Karnataka", type: "Institute of National Importance", ranking: 2, fees: "₹2.8L/yr", admission: "NID DAT", website: "https://nidbengluru.ac.in" },
  { name: "NIFT Delhi", location: "New Delhi", state: "Delhi", type: "Institute of National Importance", ranking: 1, fees: "₹1.9L/yr", admission: "NIFT Entrance", website: "https://www.nift.ac.in" },
  { name: "NIFT Mumbai", location: "Mumbai, Maharashtra", state: "Maharashtra", type: "Institute of National Importance", ranking: 2, fees: "₹1.9L/yr", admission: "NIFT Entrance", website: "https://www.nift.ac.in/mumbai" },
  { name: "NIFT Bangalore", location: "Bangalore, Karnataka", state: "Karnataka", type: "Institute of National Importance", ranking: 3, fees: "₹1.9L/yr", admission: "NIFT Entrance", website: "https://www.nift.ac.in/bengaluru" },
  { name: "Srishti Manipal Institute of Art", location: "Bangalore, Karnataka", state: "Karnataka", type: "Deemed University", ranking: 5, fees: "₹3.2L/yr", admission: "Portfolio + Interview", website: "https://www.srishtimanipalinstitute.in" },
  { name: "MIT Institute of Design Pune", location: "Pune, Maharashtra", state: "Maharashtra", type: "Private University", ranking: 6, fees: "₹3.5L/yr", admission: "MITID DAT", website: "https://www.mitid.edu.in" },
  { name: "Pearl Academy Delhi", location: "New Delhi", state: "Delhi", type: "Private University", ranking: 7, fees: "₹4.5L/yr", admission: "Portfolio + Interview", website: "https://www.pearlacademy.com" },
  { name: "Symbiosis Institute of Design", location: "Pune, Maharashtra", state: "Maharashtra", type: "Deemed University", ranking: 8, fees: "₹2.8L/yr", admission: "SET", website: "https://sid.edu.in" },
  { name: "Industrial Design Centre, IIT Bombay", location: "Mumbai, Maharashtra", state: "Maharashtra", type: "IIT", ranking: 3, fees: "₹2.5L/yr", admission: "CEED", website: "https://www.idc.iitb.ac.in" },
  { name: "Unitedworld Institute of Design", location: "Ahmedabad, Gujarat", state: "Gujarat", type: "Private University", ranking: 10, fees: "₹2.2L/yr", admission: "UID DAT", website: "https://uid.ac.in" },
  { name: "Arena Animation (Pan India)", location: "Multiple Cities", state: "Pan India", type: "Autonomous College", ranking: 15, fees: "₹1.5L/yr", admission: "Merit", website: "https://www.arenaanimation.com" },
];

const LAW_COLLEGES: College[] = [
  { name: "NLSIU Bangalore", location: "Bangalore, Karnataka", state: "Karnataka", type: "Institute of National Importance", ranking: 1, fees: "₹3.5L/yr", admission: "CLAT", website: "https://nls.ac.in" },
  { name: "NALSAR Hyderabad", location: "Hyderabad, Telangana", state: "Telangana", type: "Institute of National Importance", ranking: 2, fees: "₹2.8L/yr", admission: "CLAT", website: "https://nalsar.ac.in" },
  { name: "NLU Delhi", location: "New Delhi", state: "Delhi", type: "Institute of National Importance", ranking: 3, fees: "₹3.2L/yr", admission: "AILET", website: "https://nludelhi.ac.in" },
  { name: "WBNUJS Kolkata", location: "Kolkata, West Bengal", state: "West Bengal", type: "Institute of National Importance", ranking: 4, fees: "₹2L/yr", admission: "CLAT", website: "https://nujs.edu" },
  { name: "NLU Jodhpur", location: "Jodhpur, Rajasthan", state: "Rajasthan", type: "Institute of National Importance", ranking: 5, fees: "₹2.5L/yr", admission: "CLAT", website: "https://nlujodhpur.ac.in" },
  { name: "Jindal Global Law School", location: "Sonipat, Haryana", state: "Haryana", type: "Deemed University", ranking: 6, fees: "₹6L/yr", admission: "JSAT / CLAT", website: "https://jgls.edu.in" },
  { name: "Symbiosis Law School Pune", location: "Pune, Maharashtra", state: "Maharashtra", type: "Deemed University", ranking: 7, fees: "₹3L/yr", admission: "SET", website: "https://symlaw.ac.in" },
  { name: "Faculty of Law, DU", location: "New Delhi", state: "Delhi", type: "Central University", ranking: 8, fees: "₹25K/yr", admission: "DU CUET", website: "https://legalstudies.du.ac.in" },
  { name: "GNLU Gandhinagar", location: "Gandhinagar, Gujarat", state: "Gujarat", type: "Institute of National Importance", ranking: 9, fees: "₹2.2L/yr", admission: "CLAT", website: "https://gnlu.ac.in" },
  { name: "RMLNLU Lucknow", location: "Lucknow, Uttar Pradesh", state: "Uttar Pradesh", type: "Institute of National Importance", ranking: 10, fees: "₹1.8L/yr", admission: "CLAT", website: "https://rmlnlu.ac.in" },
];

const MEDIA_COLLEGES: College[] = [
  { name: "Indian Institute of Mass Communication", location: "New Delhi", state: "Delhi", type: "Autonomous College", ranking: 1, fees: "₹1.5L/yr", admission: "IIMC Entrance", website: "https://iimc.gov.in" },
  { name: "Xavier Institute of Communications", location: "Mumbai, Maharashtra", state: "Maharashtra", type: "Autonomous College", ranking: 2, fees: "₹1.8L/yr", admission: "Entrance + Interview", website: "https://xaviercomm.org" },
  { name: "Symbiosis Institute of Media & Communication", location: "Pune, Maharashtra", state: "Maharashtra", type: "Deemed University", ranking: 3, fees: "₹2.5L/yr", admission: "SET", website: "https://simc.edu" },
  { name: "AJK MCRC, Jamia", location: "New Delhi", state: "Delhi", type: "Central University", ranking: 4, fees: "₹35K/yr", admission: "Jamia Entrance", website: "https://www.jamia.ac.in" },
  { name: "Mudra Institute of Communications (MICA)", location: "Ahmedabad, Gujarat", state: "Gujarat", type: "Deemed University", ranking: 5, fees: "₹8L/yr", admission: "MICAT + CAT", website: "https://www.mica.ac.in" },
  { name: "Christ University - Media & Journalism", location: "Bangalore, Karnataka", state: "Karnataka", type: "Deemed University", ranking: 6, fees: "₹1.2L/yr", admission: "CUET / Merit", website: "https://www.christuniversity.in" },
  { name: "Amity School of Communication", location: "Noida, Uttar Pradesh", state: "Uttar Pradesh", type: "Private University", ranking: 7, fees: "₹2L/yr", admission: "Merit", website: "https://www.amity.edu/ascom" },
  { name: "St. Xavier's College Mumbai (BMM)", location: "Mumbai, Maharashtra", state: "Maharashtra", type: "Autonomous College", ranking: 8, fees: "₹30K/yr", admission: "MH CET", website: "https://www.xaviers.edu" },
  { name: "Manipal Institute of Communication", location: "Manipal, Karnataka", state: "Karnataka", type: "Deemed University", ranking: 9, fees: "₹2.5L/yr", admission: "MET / Merit", website: "https://manipal.edu" },
];

const SCIENCE_COLLEGES: College[] = [
  { name: "Indian Institute of Science (IISc)", location: "Bangalore, Karnataka", state: "Karnataka", type: "Institute of National Importance", ranking: 1, fees: "₹35K/yr", admission: "JEE Advanced / KVPY / CUET", website: "https://www.iisc.ac.in" },
  { name: "TIFR Mumbai", location: "Mumbai, Maharashtra", state: "Maharashtra", type: "Central University", ranking: 2, fees: "₹15K/yr", admission: "TIFR GS", website: "https://www.tifr.res.in" },
  { name: "Bose Institute Kolkata", location: "Kolkata, West Bengal", state: "West Bengal", type: "Autonomous College", ranking: 3, fees: "₹20K/yr", admission: "JGEEBILS", website: "https://www.boseinst.ernet.in" },
  { name: "Delhi University (Science colleges)", location: "New Delhi", state: "Delhi", type: "Central University", ranking: 4, fees: "₹20K/yr", admission: "DU CUET", website: "https://www.du.ac.in" },
  { name: "Presidency University Kolkata", location: "Kolkata, West Bengal", state: "West Bengal", type: "State University", ranking: 5, fees: "₹10K/yr", admission: "Merit", website: "https://www.presiuniv.ac.in" },
  { name: "St. Stephen's College Delhi", location: "New Delhi", state: "Delhi", type: "Autonomous College", ranking: 6, fees: "₹25K/yr", admission: "DU CUET", website: "https://www.ststephens.edu" },
  { name: "Fergusson College Pune", location: "Pune, Maharashtra", state: "Maharashtra", type: "Autonomous College", ranking: 7, fees: "₹15K/yr", admission: "Merit", website: "https://www.fergusson.edu" },
  { name: "Miranda House Delhi", location: "New Delhi", state: "Delhi", type: "Autonomous College", ranking: 8, fees: "₹20K/yr", admission: "DU CUET", website: "https://www.mirandahouse.ac.in" },
  { name: "IISERs (Multiple)", location: "Multiple Cities", state: "Pan India", type: "Institute of National Importance", ranking: 3, fees: "₹60K/yr", admission: "IIT JEE / KVPY / SCB", website: "https://www.iiserpune.ac.in" },
  { name: "NISER Bhubaneswar", location: "Bhubaneswar, Odisha", state: "Odisha", type: "Central University", ranking: 5, fees: "₹40K/yr", admission: "NEST", website: "https://www.niser.ac.in" },
];

export type CollegeCategory =
  | "Technology"
  | "Business & Technology"
  | "Finance"
  | "Healthcare"
  | "Arts & Design"
  | "Law"
  | "Marketing & Media"
  | "Science"
  | "Education"
  | "Government"
  | "Sports";

const CAREER_TO_COLLEGE_CATEGORY: Record<string, CollegeCategory> = {
  "Technology": "Technology",
  "Business & Technology": "Business & Technology",
  "Finance": "Finance",
  "Healthcare": "Healthcare",
  "Arts & Design": "Arts & Design",
  "Design & Technology": "Arts & Design",
  "Law": "Law",
  "Marketing & Media": "Marketing & Media",
  "Science": "Science",
  "Education": "Technology",
  "Government": "Law",
  "Sports": "Science",
};

const COLLEGE_MAP: Record<CollegeCategory, College[]> = {
  Technology: TECH_COLLEGES,
  "Business & Technology": BUSINESS_COLLEGES,
  Finance: FINANCE_COLLEGES,
  Healthcare: HEALTHCARE_COLLEGES,
  "Arts & Design": DESIGN_COLLEGES,
  Law: LAW_COLLEGES,
  "Marketing & Media": MEDIA_COLLEGES,
  Science: SCIENCE_COLLEGES,
  Education: TECH_COLLEGES,
  Government: LAW_COLLEGES,
  Sports: SCIENCE_COLLEGES,
};

export function getCollegesForCategory(careerCategory: string): College[] {
  const mapped = CAREER_TO_COLLEGE_CATEGORY[careerCategory] ?? "Technology";
  return COLLEGE_MAP[mapped] ?? TECH_COLLEGES;
}

export const ALL_STATES = [
  "All States",
  "Delhi",
  "Maharashtra",
  "Karnataka",
  "Tamil Nadu",
  "Telangana",
  "Uttar Pradesh",
  "Gujarat",
  "West Bengal",
  "Rajasthan",
  "Punjab",
  "Haryana",
  "Chandigarh",
  "Puducherry",
  "Kerala",
  "Uttarakhand",
  "Jharkhand",
  "Odisha",
  "Pan India",
];

export const COLLEGE_TYPES = [
  "All Types",
  "IIT",
  "NIT",
  "IIM",
  "IIIT",
  "AIIMS",
  "Institute of National Importance",
  "Central University",
  "State University",
  "Deemed University",
  "Private University",
  "Autonomous College",
];
