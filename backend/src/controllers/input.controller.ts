import { Response } from 'express';
import { AuthRequest } from '../middlewares/auth.middleware';
import prisma from '../prisma';

const getAllInputs = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.userId;
        const inputs = await prisma.input.findMany({ where: { userId: userId } });

        res.status(200).json(inputs);
    } catch (error) {
        res.status(500).json({ message: 'inputの取得に失敗しました' });
    }
};

const getInput = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.userId;
        const inputId = req.params.id as string;
        const input = await prisma.input.findUnique({ where: { id: inputId, userId: userId } });

        if (!input) {
            res.status(404).json({ message: 'inputが存在しません' });
            return;
        }

        res.status(200).json(input);
    } catch (error) {
        res.status(500).json({ message: 'inputの取得に失敗しました' });
    }
};

const createInput = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.userId;

        if (!userId) {
            res.status(401).json({ message: '認証が必要です' })
            return
        }

        const { title, type, memo } = req.body;
        const newInput = await prisma.input.create({
            data: {
                title,
                type,
                memo,
                userId
            }
        });
        res.status(201).json(newInput);

    } catch (error) {
        res.status(500).json({ message: 'inputの作成に失敗しました' })
    }
};

const deleteInput = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.userId;
        const inputId = req.params.id as string;

        const input = await prisma.input.findUnique({ where: { id: inputId, userId: userId } });

        if (!input) {
            res.status(404).json({ message: 'inputが存在しません' });
            return;
        }

        const deletedInput = await prisma.input.delete({ where: { id: inputId } });
        res.status(200).json(deletedInput);
    } catch (error) {
        res.status(500).json({ message: 'inputの削除に失敗しました' });
    }
};

const updateInput = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.userId;
        const inputId = req.params.id as string;
        const { title, type, memo } = req.body;

        const input = await prisma.input.findUnique({ where: { id: inputId, userId: userId } });

        if (!input) {
            res.status(404).json({ message: 'inputが存在しません' });
            return;
        }

        const updatedInput = await prisma.input.update({
            where: { id: inputId },
            data: { title, type, memo }
        });
        res.status(200).json(updatedInput);

    } catch (error) {
        res.status(500).json({ message: 'inputの更新に失敗しました' });
    }
};

export { getAllInputs, getInput, createInput, deleteInput, updateInput };