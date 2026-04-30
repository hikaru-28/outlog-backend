import { Router } from 'express';
import { authMiddleware } from '../middlewares/auth.middleware';
import {
    getOutput,
    createOutput,
    updateOutput
} from '../controllers/output.controller';

const router = Router({ mergeParams: true });

router.get("/", authMiddleware, getOutput);
router.post("/", authMiddleware, createOutput);
router.patch("/", authMiddleware, updateOutput);

export default router;