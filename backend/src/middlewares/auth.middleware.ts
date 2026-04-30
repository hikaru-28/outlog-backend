import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface AuthRequest extends Request {
    userId?: string
}

export const authMiddleware = (req: AuthRequest, res: Response, next: NextFunction): void => {
    try {
        const authHeader = req.headers.authorization;
        const token = authHeader?.split(' ')[1];
        if (!token) {
            res.status(401).json({ message: '認証トークンが必要です' });
            return;
        }
        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string };
        req.userId = decoded.userId;
        next();
    } catch (error) {
        res.status(401).json({ message: '無効な認証トークンです' });
    }
}