import { Response } from 'express';
import { AuthRequest } from '../middlewares/auth.middleware';
import prisma from '../prisma';

const getStreak = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.userId
        //アウトプットを作成した日付一覧を取得
        const outputs = await prisma.output.findMany({
            where: {
                input: { userId }
            },
            select: { createdAt: true },
            orderBy: { createdAt: 'desc' }
        })

        // 日付ごとにグループ化
        const activeDates = [...new Set(
            outputs.map((output) => output.createdAt.toISOString().split('T')[0])
        )].sort((a, b) => b.localeCompare(a))

        // 現在の連続日数を計算
        let currentStreak = 0
        const today = new Date().toISOString().split('T')[0]
        const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0]

        if (activeDates[0] === today || activeDates[0] === yesterday) {
            currentStreak = 1
            for (let i = 1; i < activeDates.length; i++) {
                const prev = new Date(activeDates[i - 1])
                const curr = new Date(activeDates[i])
                const diff = (prev.getTime() - curr.getTime()) / 86400000
                if (diff === 1) {
                    currentStreak++
                } else {
                    break
                }
            }
        }

        // 最長連続日数を計算
        let longestStreak = 0
        let tempStreak = 1
        for (let i = 1; i < activeDates.length; i++) {
            const prev = new Date(activeDates[i - 1])
            const curr = new Date(activeDates[i])
            const diff = (prev.getTime() - curr.getTime()) / 86400000
            if (diff === 1) {
                tempStreak++
            } else {
                longestStreak = Math.max(longestStreak, tempStreak)
                tempStreak = 1
            }
        }
        longestStreak = Math.max(longestStreak, tempStreak)

        // カレンダー用データ (過去一年分)
        const activityMap = new Map<string, number>()
        outputs.forEach(output => {
            const date = output.createdAt.toISOString().split('T')[0]
            activityMap.set(date, (activityMap.get(date) || 0) + 1)
        })

        const activityData = []
        for (let i = 364; i >= 0; i--) {
            const date = new Date(Date.now() - i * 86400000).toISOString().split('T')[0]
            activityData.push({ date, count: activityMap.get(date) || 0 })
        }

        res.status(200).json({ currentStreak, longestStreak, activityData })
    } catch (error) {
        res.status(500).json({ message: 'ストリークの取得に失敗しました' })
    }

}

export { getStreak }