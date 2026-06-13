import { Router, type IRouter } from "express";
import healthRouter from "./health";
import aiRouter from "./ai";
import usersRouter from "./users";
import reportsRouter from "./reports";
import resourcesRouter from "./resources";
import volunteersRouter from "./volunteers";
import tasksRouter from "./tasks";
import allocationsRouter from "./allocations";
import ngosRouter from "./ngos";
import statsRouter from "./stats";

const router: IRouter = Router();

router.use(healthRouter);
router.use(aiRouter);
router.use(usersRouter);
router.use(reportsRouter);
router.use(resourcesRouter);
router.use(volunteersRouter);
router.use(tasksRouter);
router.use(allocationsRouter);
router.use(ngosRouter);
router.use(statsRouter);

export default router;
