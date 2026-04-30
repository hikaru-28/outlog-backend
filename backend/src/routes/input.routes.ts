import { Router } from 'express';
import { authMiddleware } from '../middlewares/auth.middleware';
import {
    getAllInputs,
    getInput,
    createInput,
    updateInput,
    deleteInput
} from '../controllers/input.controller';

const router = Router();

router.get("/", authMiddleware, getAllInputs);
router.get("/:id", authMiddleware, getInput);
router.post("/", authMiddleware, createInput);
router.patch("/:id", authMiddleware, updateInput);
router.delete("/:id", authMiddleware, deleteInput);

export default router;