import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { Request, Response } from 'express';
import prisma from '../prisma';

const register = async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;

        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) {
            res.status(400).json({ message: 'このメールアドレスは既に登録されています' });
            return;
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await prisma.user.create({
            data: { email, password: hashedPassword },
        });

        res.status(201).json({ message: 'ユーザー登録に成功しました', userId: user.id });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'ユーザー登録に失敗しました' });
    }
};

const login = async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;

        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) {
            res.status(401).json({ message: 'メールアドレスまたはパスワードが違います' });
            return;
        }
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            res.status(401).json({ message: 'メールアドレスまたはパスワードが違います' });
            return;
        }

        const { password: _, ...userWithoutPassword } = user;

        const token = jwt.sign(
            { userId: user.id },
            process.env.JWT_SECRET!,
            { expiresIn: '1d' }
        );

        res.status(200).json({ token, user: userWithoutPassword });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'ログインに失敗しました' });
    }
};

export { register, login };