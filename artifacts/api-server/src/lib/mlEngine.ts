// ─────────────────────────────────────────────────────────────────────────────
// CareerVerse ML Recommendation Engine
// Implements: Random Forest, XGBoost (Gradient Boosting), Neural Network, SVM
// All algorithms written in pure TypeScript — no external ML libraries
// ─────────────────────────────────────────────────────────────────────────────

// ─── Career feature data (ML-relevant fields only) ───────────────────────────
export const CAREER_DATA = [
  { id: "ai-ml-engineer",        title: "AI / ML Engineer",          interests: ["Technology","Science"],         skills: ["Programming","Mathematics","Data Analysis","Problem Solving"], goalMatch: ["Get a Job","Higher Education"],              riskLevel: "medium", salaryMin: 12, salaryMax: 40 },
  { id: "data-scientist",        title: "Data Scientist",             interests: ["Technology","Science"],         skills: ["Programming","Mathematics","Data Analysis","Problem Solving"], goalMatch: ["Get a Job","Higher Education"],              riskLevel: "medium", salaryMin: 10, salaryMax: 30 },
  { id: "software-engineer",     title: "Software Engineer",          interests: ["Technology"],                   skills: ["Programming","Problem Solving","Mathematics","Communication"],   goalMatch: ["Get a Job"],                                riskLevel: "low",    salaryMin: 8,  salaryMax: 35 },
  { id: "product-manager",       title: "Product Manager",            interests: ["Technology","Business"],        skills: ["Leadership","Communication","Problem Solving","Data Analysis"],  goalMatch: ["Get a Job","Start a Business"],              riskLevel: "medium", salaryMin: 12, salaryMax: 40 },
  { id: "ux-designer",           title: "UX Designer",                interests: ["Arts & Design","Technology"],   skills: ["Design","Creativity","Communication","Problem Solving"],          goalMatch: ["Get a Job","Start a Business"],              riskLevel: "low",    salaryMin: 6,  salaryMax: 25 },
  { id: "cybersecurity-analyst", title: "Cybersecurity Analyst",      interests: ["Technology","Science"],         skills: ["Programming","Problem Solving","Mathematics","Communication"],   goalMatch: ["Get a Job"],                                riskLevel: "medium", salaryMin: 8,  salaryMax: 30 },
  { id: "doctor-mbbs",           title: "Doctor (MBBS / MD)",         interests: ["Healthcare","Science"],         skills: ["Problem Solving","Communication","Science","Leadership"],         goalMatch: ["Get a Job","Higher Education"],              riskLevel: "low",    salaryMin: 8,  salaryMax: 50 },
  { id: "chartered-accountant",  title: "Chartered Accountant (CA)",  interests: ["Finance","Business"],           skills: ["Mathematics","Data Analysis","Problem Solving","Communication"],  goalMatch: ["Get a Job","Start a Business"],              riskLevel: "low",    salaryMin: 8,  salaryMax: 30 },
  { id: "investment-banker",     title: "Investment Banker",          interests: ["Finance","Business"],           skills: ["Mathematics","Data Analysis","Leadership","Communication"],       goalMatch: ["Get a Job"],                                riskLevel: "high",   salaryMin: 15, salaryMax: 80 },
  { id: "digital-marketer",      title: "Digital Marketer",           interests: ["Business","Media"],             skills: ["Marketing","Creativity","Communication","Data Analysis"],         goalMatch: ["Get a Job","Start a Business"],              riskLevel: "low",    salaryMin: 4,  salaryMax: 20 },
  { id: "lawyer",                title: "Lawyer",                     interests: ["Law"],                          skills: ["Writing","Communication","Problem Solving","Leadership"],          goalMatch: ["Get a Job","Start a Business"],              riskLevel: "medium", salaryMin: 5,  salaryMax: 50 },
  { id: "civil-services",        title: "IAS / IPS Officer",          interests: ["Government","Social Work"],     skills: ["Leadership","Communication","Writing","Problem Solving"],          goalMatch: ["Government Job"],                           riskLevel: "low",    salaryMin: 7,  salaryMax: 15 },
  { id: "content-creator",       title: "Content Creator",            interests: ["Media","Arts & Design"],        skills: ["Writing","Creativity","Communication","Marketing"],                goalMatch: ["Get a Job","Start a Business"],              riskLevel: "high",   salaryMin: 2,  salaryMax: 20 },
  { id: "entrepreneur",          title: "Entrepreneur / Startup Founder", interests: ["Business","Technology"],   skills: ["Leadership","Creativity","Problem Solving","Communication"],       goalMatch: ["Start a Business"],                         riskLevel: "high",   salaryMin: 0,  salaryMax: 100 },
  { id: "teacher",               title: "Teacher / Educator",         interests: ["Teaching","Social Work"],       skills: ["Communication","Writing","Leadership","Problem Solving"],          goalMatch: ["Get a Job","Government Job"],                riskLevel: "low",    salaryMin: 3,  salaryMax: 12 },
  { id: "financial-analyst",     title: "Financial Analyst",          interests: ["Finance","Business"],           skills: ["Mathematics","Data Analysis","Problem Solving","Communication"],  goalMatch: ["Get a Job"],                                riskLevel: "medium", salaryMin: 6,  salaryMax: 25 },
  { id: "graphic-designer",      title: "Graphic Designer",           interests: ["Arts & Design","Media"],        skills: ["Design","Creativity","Communication","Writing"],                   goalMatch: ["Get a Job","Start a Business"],              riskLevel: "low",    salaryMin: 3,  salaryMax: 15 },
  { id: "nursing",               title: "Nurse",                      interests: ["Healthcare","Social Work"],     skills: ["Communication","Problem Solving","Science","Leadership"],          goalMatch: ["Get a Job"],                                riskLevel: "low",    salaryMin: 3,  salaryMax: 12 },
  { id: "mechanical-engineer",   title: "Mechanical Engineer",        interests: ["Science","Technology"],         skills: ["Mathematics","Problem Solving","Design","Data Analysis"],           goalMatch: ["Get a Job","Higher Education"],              riskLevel: "low",    salaryMin: 5,  salaryMax: 20 },
  { id: "sports-coach",          title: "Sports Coach",               interests: ["Sports","Social Work"],         skills: ["Leadership","Communication","Creativity","Problem Solving"],       goalMatch: ["Get a Job","Start a Business"],              riskLevel: "medium", salaryMin: 3,  salaryMax: 15 },
];

// ─── Feature encoding constants ────────────────────────────────────────────
export const ALL_INTERESTS = ["Technology","Science","Finance","Business","Healthcare","Arts & Design","Law","Media","Teaching","Social Work","Sports","Government"];
export const ALL_SKILLS    = ["Programming","Mathematics","Data Analysis","Problem Solving","Communication","Leadership","Design","Writing","Creativity","Marketing","Science","Management"];
export const ALL_GOALS     = ["Get a Job","Start a Business","Higher Education","Government Job"];
export const SALARY_MAP: Record<string, number> = { "3-5": 0.1, "5-10": 0.3, "10-20": 0.5, "20-50": 0.75, "50+": 1.0 };
export const RISK_MAP:   Record<string, number> = { low: 0.0, medium: 0.5, high: 1.0 };
export const EDU_MAP:    Record<string, number> = { "Class 10th": 0, "Class 12th": 0.2, "Diploma": 0.35, "Bachelors": 0.6, "Masters": 0.8, "Working": 1.0 };

// Feature vector length = 12 (interests) + 12 (skills) + 4 (goals) + 1 (risk) + 1 (salary) + 1 (edu) + 5 (derived) = 36
export const FEATURE_DIM = 36;

export interface UserProfile {
  interests: string[];
  skills: string[];
  goal: string;
  risk: string;
  salary: string;
  education: string;
}

export interface CareerResult {
  id: string;
  title: string;
  matchScore: number;
  modelScores: Record<string, number>;
  bestModel: string;
}

// ─── Feature extraction ─────────────────────────────────────────────────────
export function encodeFeatures(user: UserProfile, career: typeof CAREER_DATA[0]): number[] {
  const vec: number[] = [];

  // User interests multi-hot (12)
  for (const interest of ALL_INTERESTS) {
    vec.push(user.interests.includes(interest) ? 1 : 0);
  }

  // User skills multi-hot (12)
  for (const skill of ALL_SKILLS) {
    vec.push(user.skills.includes(skill) ? 1 : 0);
  }

  // User goal one-hot (4)
  for (const goal of ALL_GOALS) {
    vec.push(user.goal === goal ? 1 : 0);
  }

  // Risk ordinal (1)
  vec.push(RISK_MAP[user.risk] ?? 0.5);

  // Salary ordinal (1)
  vec.push(SALARY_MAP[user.salary] ?? 0.5);

  // Education level (1)
  vec.push(EDU_MAP[user.education] ?? 0.5);

  // Derived features (5)
  const interestOverlap = career.interests.filter(i => user.interests.includes(i)).length / Math.max(career.interests.length, 1);
  const skillOverlap    = career.skills.filter(s => user.skills.includes(s)).length / Math.max(career.skills.length, 1);
  const goalMatch       = career.goalMatch.includes(user.goal) ? 1 : 0;
  const riskMatch       = career.riskLevel === user.risk ? 1 : (Math.abs((RISK_MAP[career.riskLevel] ?? 0.5) - (RISK_MAP[user.risk] ?? 0.5)) < 0.4 ? 0.5 : 0);
  const salaryFit       = SALARY_MAP[user.salary] !== undefined && career.salaryMax >= (SALARY_MAP[user.salary] * 100) / 3 ? 1 : 0.3;

  vec.push(interestOverlap, skillOverlap, goalMatch, riskMatch, salaryFit);

  return vec;
}

// ─── Rule-based scorer (ground truth for training) ─────────────────────────
function ruleBasedScore(user: UserProfile, career: typeof CAREER_DATA[0]): number {
  let score = 0;
  const interestOverlap = career.interests.filter(i => user.interests.includes(i)).length;
  score += Math.min(30, interestOverlap * 12);
  const skillOverlap = career.skills.filter(s => user.skills.includes(s)).length;
  score += Math.min(25, skillOverlap * 8);
  if (career.goalMatch.includes(user.goal)) score += 20;
  if (career.riskLevel === user.risk) score += 15;
  const salaryVal = SALARY_MAP[user.salary] ?? 0;
  if (salaryVal >= 0.75 && career.salaryMax >= 50) score += 5;
  else if (salaryVal >= 0.5 && career.salaryMax >= 20) score += 5;
  else if (salaryVal >= 0.3 && career.salaryMax >= 10) score += 4;
  else if (salaryVal >= 0.1 && career.salaryMax >= 5) score += 3;
  return Math.max(35, Math.min(98, score + 35));
}

// ─── Training data generation ───────────────────────────────────────────────
const INTERESTS_POOL = ALL_INTERESTS;
const SKILLS_POOL = ALL_SKILLS;

function randomProfile(seed: number): UserProfile {
  const rng = mulberry32(seed);
  const nInterests = 1 + Math.floor(rng() * 3);
  const nSkills    = 1 + Math.floor(rng() * 4);
  const interests  = shuffleSeeded([...INTERESTS_POOL], rng).slice(0, nInterests);
  const skills     = shuffleSeeded([...SKILLS_POOL], rng).slice(0, nSkills);
  const goal       = ALL_GOALS[Math.floor(rng() * ALL_GOALS.length)];
  const riskKeys   = Object.keys(RISK_MAP);
  const risk       = riskKeys[Math.floor(rng() * riskKeys.length)];
  const salaryKeys = Object.keys(SALARY_MAP);
  const salary     = salaryKeys[Math.floor(rng() * salaryKeys.length)];
  const eduKeys    = Object.keys(EDU_MAP);
  const education  = eduKeys[Math.floor(rng() * eduKeys.length)];
  return { interests, skills, goal, risk, salary, education };
}

function mulberry32(seed: number) {
  return function () {
    seed |= 0; seed = seed + 0x6D2B79F5 | 0;
    let t = Math.imul(seed ^ seed >>> 15, 1 | seed);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}

function shuffleSeeded<T>(arr: T[], rng: () => number): T[] {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function generateTrainingData(): { X: number[][], y: number[] } {
  const X: number[][] = [];
  const y: number[]   = [];
  const N_PROFILES = 300;
  for (let p = 0; p < N_PROFILES; p++) {
    const profile = randomProfile(p * 7 + 13);
    for (const career of CAREER_DATA) {
      const features = encodeFeatures(profile, career);
      const score    = ruleBasedScore(profile, career) / 100;
      X.push(features);
      y.push(score);
    }
  }
  return { X, y };
}

// ─────────────────────────────────────────────────────────────────────────────
// DECISION TREE (base learner used by RF and GBM)
// ─────────────────────────────────────────────────────────────────────────────
interface TreeNode {
  feature?: number;
  threshold?: number;
  left?: TreeNode;
  right?: TreeNode;
  value?: number;
}

function variance(values: number[]): number {
  if (values.length === 0) return 0;
  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  return values.reduce((a, b) => a + (b - mean) ** 2, 0) / values.length;
}

function mean(values: number[]): number {
  if (values.length === 0) return 0;
  return values.reduce((a, b) => a + b, 0) / values.length;
}

function buildTree(X: number[][], y: number[], depth: number, maxDepth: number, features?: number[]): TreeNode {
  if (depth >= maxDepth || y.length <= 2 || variance(y) < 1e-6) {
    return { value: mean(y) };
  }

  const nFeatures = features ? features.length : X[0].length;
  const featureIndices = features ?? Array.from({ length: X[0].length }, (_, i) => i);
  
  let bestGain = -Infinity;
  let bestFeat = -1;
  let bestThreshold = 0;

  for (const fi of featureIndices) {
    const values = [...new Set(X.map(x => x[fi]))].sort((a, b) => a - b);
    for (let t = 0; t < values.length - 1; t++) {
      const threshold = (values[t] + values[t + 1]) / 2;
      const leftY  = y.filter((_, i) => X[i][fi] <= threshold);
      const rightY = y.filter((_, i) => X[i][fi] > threshold);
      if (leftY.length === 0 || rightY.length === 0) continue;
      const gain = variance(y) - (leftY.length / y.length) * variance(leftY) - (rightY.length / y.length) * variance(rightY);
      if (gain > bestGain) { bestGain = gain; bestFeat = fi; bestThreshold = threshold; }
    }
  }

  if (bestFeat === -1) return { value: mean(y) };

  const leftIdx  = X.map((_, i) => i).filter(i => X[i][bestFeat] <= bestThreshold);
  const rightIdx = X.map((_, i) => i).filter(i => X[i][bestFeat] > bestThreshold);
  const leftX  = leftIdx.map(i => X[i]);
  const leftY  = leftIdx.map(i => y[i]);
  const rightX = rightIdx.map(i => X[i]);
  const rightY = rightIdx.map(i => y[i]);

  return {
    feature: bestFeat,
    threshold: bestThreshold,
    left:  buildTree(leftX,  leftY,  depth + 1, maxDepth, features),
    right: buildTree(rightX, rightY, depth + 1, maxDepth, features),
  };
}

function predictTree(node: TreeNode, x: number[]): number {
  if (node.value !== undefined) return node.value;
  const go = x[node.feature!] <= node.threshold! ? node.left! : node.right!;
  return predictTree(go, x);
}

// ─────────────────────────────────────────────────────────────────────────────
// RANDOM FOREST
// ─────────────────────────────────────────────────────────────────────────────
interface RandomForestModel { trees: TreeNode[] }

function trainRandomForest(X: number[][], y: number[], nTrees = 18, maxDepth = 4): RandomForestModel {
  const trees: TreeNode[] = [];
  const n = X.length;
  const nFeats = Math.round(Math.sqrt(X[0].length));
  const rng = mulberry32(42);

  for (let t = 0; t < nTrees; t++) {
    // Bootstrap sample
    const idx = Array.from({ length: n }, () => Math.floor(rng() * n));
    const bX = idx.map(i => X[i]);
    const bY = idx.map(i => y[i]);
    // Random feature subset per tree
    const feats = shuffleSeeded(Array.from({ length: X[0].length }, (_, i) => i), rng).slice(0, nFeats);
    trees.push(buildTree(bX, bY, 0, maxDepth, feats));
  }
  return { trees };
}

function predictRandomForest(model: RandomForestModel, x: number[]): number {
  return mean(model.trees.map(t => predictTree(t, x)));
}

// ─────────────────────────────────────────────────────────────────────────────
// GRADIENT BOOSTING (XGBoost-like)
// ─────────────────────────────────────────────────────────────────────────────
interface GBModel { initialPred: number; trees: TreeNode[]; lr: number }

function trainGradientBoosting(X: number[][], y: number[], nRounds = 50, lr = 0.12, maxDepth = 3): GBModel {
  const initialPred = mean(y);
  const preds = new Array<number>(y.length).fill(initialPred);
  const trees: TreeNode[] = [];

  for (let r = 0; r < nRounds; r++) {
    // Negative gradient (MSE residuals)
    const residuals = y.map((yi, i) => yi - preds[i]);
    const tree = buildTree(X, residuals, 0, maxDepth);
    trees.push(tree);
    for (let i = 0; i < preds.length; i++) {
      preds[i] += lr * predictTree(tree, X[i]);
    }
  }
  return { initialPred, trees, lr };
}

function predictGradientBoosting(model: GBModel, x: number[]): number {
  return model.initialPred + model.trees.reduce((sum, t) => sum + model.lr * predictTree(t, x), 0);
}

// ─────────────────────────────────────────────────────────────────────────────
// NEURAL NETWORK (3-layer MLP: 36 → 64 → 32 → 1)
// ─────────────────────────────────────────────────────────────────────────────
interface NNModel {
  w1: number[][]; b1: number[];
  w2: number[][]; b2: number[];
  w3: number[];   b3: number;
}

function relu(x: number): number { return Math.max(0, x); }
function sigmoid(x: number): number { return 1 / (1 + Math.exp(-Math.max(-10, Math.min(10, x)))); }
function drelu(x: number): number { return x > 0 ? 1 : 0; }

function matMulVec(W: number[][], x: number[], b: number[]): number[] {
  return W.map((row, i) => row.reduce((s, w, j) => s + w * x[j], 0) + b[i]);
}

function initNNModel(rng: () => number): NNModel {
  const he = (fan_in: number) => Math.sqrt(2 / fan_in);
  const rand = (scale: number) => (rng() - 0.5) * 2 * scale;
  const w1 = Array.from({ length: 64 }, () => Array.from({ length: FEATURE_DIM }, () => rand(he(FEATURE_DIM))));
  const b1 = new Array(64).fill(0);
  const w2 = Array.from({ length: 32 }, () => Array.from({ length: 64 }, () => rand(he(64))));
  const b2 = new Array(32).fill(0);
  const w3 = Array.from({ length: 32 }, () => rand(he(32)));
  return { w1, b1, w2, b2, w3, b3: 0 };
}

function forwardNN(model: NNModel, x: number[]): { out: number; h1: number[]; h2: number[]; z1: number[]; z2: number[] } {
  const z1 = matMulVec(model.w1, x, model.b1);
  const h1 = z1.map(relu);
  const z2 = matMulVec(model.w2, h1, model.b2);
  const h2 = z2.map(relu);
  const out = sigmoid(h2.reduce((s, h, j) => s + model.w3[j] * h, 0) + model.b3);
  return { out, h1, h2, z1, z2 };
}

function trainNeuralNetwork(X: number[][], y: number[], epochs = 250, lr = 0.01): NNModel {
  const rng = mulberry32(1337);
  const model = initNNModel(rng);
  const n = X.length;

  for (let e = 0; e < epochs; e++) {
    const curLr = lr * (1 / (1 + 0.005 * e));
    // Mini-batch SGD, batch size 64
    const batchIdx = shuffleSeeded(Array.from({ length: n }, (_, i) => i), rng).slice(0, 64);

    for (const i of batchIdx) {
      const x = X[i];
      const { out, h1, h2, z1, z2 } = forwardNN(model, x);
      const err = out - y[i]; // MSE gradient

      // Output layer gradients
      const dOut = err * out * (1 - out);

      // Hidden layer 2 gradients
      const dH2 = h2.map((_, j) => dOut * model.w3[j] * drelu(z2[j]));

      // Hidden layer 1 gradients
      const dH1 = h1.map((_, j) => dH2.reduce((s, d, k) => s + d * model.w2[k][j], 0) * drelu(z1[j]));

      // Update weights
      for (let j = 0; j < model.w3.length; j++) {
        model.w3[j] -= curLr * dOut * h2[j];
      }
      model.b3 -= curLr * dOut;

      for (let k = 0; k < 32; k++) {
        for (let j = 0; j < 64; j++) model.w2[k][j] -= curLr * dH2[k] * h1[j];
        model.b2[k] -= curLr * dH2[k];
      }

      for (let j = 0; j < 64; j++) {
        for (let k = 0; k < FEATURE_DIM; k++) model.w1[j][k] -= curLr * dH1[j] * x[k];
        model.b1[j] -= curLr * dH1[j];
      }
    }
  }
  return model;
}

function predictNeuralNetwork(model: NNModel, x: number[]): number {
  return forwardNN(model, x).out;
}

// ─────────────────────────────────────────────────────────────────────────────
// SVM (Linear kernel, SGD with hinge loss, regression via epsilon-SVR)
// ─────────────────────────────────────────────────────────────────────────────
interface SVMModel { weights: number[]; bias: number }

function trainSVM(X: number[][], y: number[], epochs = 200, lr = 0.005, lambda = 0.001, epsilon = 0.1): SVMModel {
  const dim = X[0].length;
  const rng = mulberry32(99);
  const weights = Array.from({ length: dim }, () => (rng() - 0.5) * 0.01);
  let bias = 0;

  for (let e = 0; e < epochs; e++) {
    const curLr = lr * (1 / (1 + 0.01 * e));
    const indices = shuffleSeeded(Array.from({ length: X.length }, (_, i) => i), rng);

    for (const i of indices) {
      const pred = X[i].reduce((s, x, j) => s + weights[j] * x, 0) + bias;
      const residual = pred - y[i];

      // Epsilon-insensitive loss gradient
      if (Math.abs(residual) > epsilon) {
        const sign = residual > 0 ? 1 : -1;
        for (let j = 0; j < dim; j++) {
          weights[j] = (1 - curLr * lambda) * weights[j] - curLr * sign * X[i][j];
        }
        bias -= curLr * sign;
      } else {
        // L2 regularization only
        for (let j = 0; j < dim; j++) {
          weights[j] *= (1 - curLr * lambda);
        }
      }
    }
  }
  return { weights, bias };
}

function predictSVM(model: SVMModel, x: number[]): number {
  return x.reduce((s, xi, j) => s + model.weights[j] * xi, 0) + model.bias;
}

// ─────────────────────────────────────────────────────────────────────────────
// MODEL REGISTRY — trained once on startup, cached in memory
// ─────────────────────────────────────────────────────────────────────────────
interface ModelRegistry {
  rf:  RandomForestModel;
  gbm: GBModel;
  nn:  NNModel;
  svm: SVMModel;
}

let registry: ModelRegistry | null = null;

export function getModels(): ModelRegistry {
  if (registry) return registry;

  const { X, y } = generateTrainingData();

  registry = {
    rf:  trainRandomForest(X, y),
    gbm: trainGradientBoosting(X, y),
    nn:  trainNeuralNetwork(X, y),
    svm: trainSVM(X, y),
  };

  return registry;
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN PREDICTION FUNCTION
// ─────────────────────────────────────────────────────────────────────────────
export function mlRecommend(user: UserProfile): CareerResult[] {
  const models = getModels();

  return CAREER_DATA
    .map(career => {
      const x = encodeFeatures(user, career);

      const rfScore  = Math.max(0, Math.min(1, predictRandomForest(models.rf, x)));
      const gbmScore = Math.max(0, Math.min(1, predictGradientBoosting(models.gbm, x)));
      const nnScore  = Math.max(0, Math.min(1, predictNeuralNetwork(models.nn, x)));
      const svmScore = Math.max(0, Math.min(1, predictSVM(models.svm, x)));

      // Weighted ensemble: XGBoost 40%, RF 30%, NN 20%, SVM 10%
      const ensemble = gbmScore * 0.40 + rfScore * 0.30 + nnScore * 0.20 + svmScore * 0.10;

      const toPercent = (s: number) => Math.round(Math.max(35, Math.min(98, s * 100)));

      return {
        id: career.id,
        title: career.title,
        matchScore: toPercent(ensemble),
        modelScores: {
          XGBoost:       toPercent(gbmScore),
          RandomForest:  toPercent(rfScore),
          NeuralNetwork: toPercent(nnScore),
          SVM:           toPercent(svmScore),
        },
        bestModel: "XGBoost",
      };
    })
    .sort((a, b) => b.matchScore - a.matchScore)
    .slice(0, 10);
}
