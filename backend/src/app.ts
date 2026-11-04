import express from 'express'
import cors from 'cors'
import authRoutes from './routes/auth.routes'
import inputRoutes from './routes/input.routes'
import outputRoutes from './routes/output.routes'
import statsRoutes from './routes/stats.routes'
import prisma from './prisma'

const app = express();

app.use(cors({
    origin: [
        'http://localhost:5173',
        'https://outlog-frontend.vercel.app'
    ],
    credentials: true
}))

app.use(express.json())
app.use('/api/auth', authRoutes)
app.use('/api/inputs', inputRoutes)
app.use('/api/inputs/:inputId/output', outputRoutes)
app.use('/api/stats', statsRoutes)

// Supabaseの自動一時停止を防ぐため、DBにも軽くクエリを投げる
app.get('/health', async (req, res) => {
    try {
        await prisma.$queryRaw`SELECT 1`
        res.json({ status: 'ok', db: 'ok' })
    } catch {
        res.status(503).json({ status: 'error', db: 'unreachable' })
    }
})

export default app;