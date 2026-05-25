import { Router, type IRouter } from "express";
import healthRouter from "./health";
import resumeRouter from "./resume";
import careerTestRouter from "./careerTest";
import mlRecommendRouter from "./mlRecommend";

const router: IRouter = Router();

router.use(healthRouter);
router.use(resumeRouter);
router.use(careerTestRouter);
router.use(mlRecommendRouter);

export default router;
