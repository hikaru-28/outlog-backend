import { Response } from 'express';
import { AuthRequest } from '../middlewares/auth.middleware';
import prisma from '../prisma';

const getAllInputs = async (req: AuthRequest, res: Response) => {
    try {
        const page = parseInt(req.query.page as string) || 1
        const limit = parseInt(req.query.limit as string) || 10
        const skip = (page - 1) * limit
        const userId = req.userId;

        const [inputs, total] = await prisma.$transaction([
            prisma.input.findMany({
                where: { userId },
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' }
            }),
            prisma.input.count({ where: { userId } })
        ])

        res.status(200).json({ inputs, total, page, limit });
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

        if (!title || !type) {
            res.status(400).json({ message: 'タイトルとタイプは必須です' })
            return
        }
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

        const [, deletedInput] = await prisma.$transaction([
            prisma.output.deleteMany({ where: { inputId } }),
            prisma.input.delete({ where: { id: inputId } })
        ])
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

        if (!title || !type) {
            res.status(400).json({ message: 'タイトルとタイプは必須です' })
            return
        }

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