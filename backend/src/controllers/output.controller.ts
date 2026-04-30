import { Response } from 'express';
import { AuthRequest } from '../middlewares/auth.middleware';
import prisma from '../prisma';

const getOutput = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.userId;
        const inputId = req.params.inputId as string;
        const input = await prisma.input.findUnique({ where: { id: inputId, userId: userId } });
        if (!input) {
            res.status(404).json({ message: 'inputが存在しません' });
            return;
        }
        const output = await prisma.output.findUnique({ where: { inputId: inputId } })
        res.status(200).json(output);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'outputの取得に失敗しました' });
    }
};

const createOutput = async (req: AuthRequest, res: Response) => {
    try {
        const inputId = req.params.inputId as string;
        const userId = req.userId;

        const input = await prisma.input.findUnique({ where: { id: inputId, userId: userId } });
        if (!input) {
            res.status(404).json({ message: 'inputが存在しません' });
            return;
        };

        const { content } = req.body;
        const [outputResult, inputResult] = await prisma.$transaction([
            prisma.output.create({ data: { content, inputId } }),
            prisma.input.update({ where: { id: inputId }, data: { isOutputDone: true } })
        ]);

        res.status(201).json(outputResult);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'outputの作成に失敗しました' });
    }
};

const updateOutput = async (req: AuthRequest, res: Response) => {
    try {
        const inputId = req.params.inputId as string;
        const userId = req.userId;

        const input = await prisma.input.findUnique({ where: { id: inputId, userId: userId } });
        if (!input) {
            res.status(404).json({ message: 'inputが存在しません' });
            return;
        };

        const { content } = req.body;

        const [outputResult, inputResult] = await prisma.$transaction([
            prisma.output.update({ where: { inputId }, data: { content } }),
            prisma.input.update({ where: { id: inputId }, data: { isOutputDone: true } })
        ]);

        res.status(200).json(outputResult);
    } catch (error) {
        res.status(500).json({ message: 'outputの更新に失敗しました' });
    }
};

export { getOutput, createOutput, updateOutput };