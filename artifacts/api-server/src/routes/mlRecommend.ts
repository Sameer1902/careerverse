import { Router } from "express";
import { mlRecommend, type UserProfile } from "../lib/mlEngine.js";

const router = Router();

// Warm up models on first import (runs in background)
let warmupDone = false;
function warmup() {
  if (warmupDone) return;
  warmupDone = true;
  import("../lib/mlEngine.js").then(({ getModels }) => {
    getModels();
  });
}
warmup();

router.post("/career/ml-recommend", (req, res) => {
  try {
    const { answers } = req.body as { answers: Record<string, string | string[]> };

    if (!answers) {
      res.status(400).json({ error: "answers required" });
      return;
    }

    function parseSingle(raw: string): string {
      return raw?.includes("::") ? raw.split("::")[1] : (raw ?? "");
    }
    function parseMulti(raw: string[]): string[] {
      return (raw ?? []).map(v => v.includes("::") ? v.split("::")[1] : v);
    }

    const user: UserProfile = {
      interests:  parseMulti((answers["4"] as string[]) || []),
      skills:     parseMulti((answers["5"] as string[]) || []),
      goal:       parseSingle((answers["3"] as string) || ""),
      risk:       parseSingle((answers["8"] as string) || "medium"),
      salary:     parseSingle((answers["7"] as string) || "10-20"),
      education:  parseSingle((answers["1"] as string) || "Bachelors"),
    };

    const results = mlRecommend(user);
    res.json({ results, model: "XGBoost+Ensemble", features: ["interests","skills","goal","risk","salary","education"] });
  } catch (err) {
    req.log.error({ err }, "ML recommend failed");
    res.status(500).json({ error: "ML prediction failed" });
  }
});

export default router;
