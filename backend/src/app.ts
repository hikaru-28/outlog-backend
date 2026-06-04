import express from 'express'
import cors from 'cors'
import authRoutes from './routes/auth.routes'
import inputRoutes from './routes/input.routes'
import outputRoutes from './routes/output.routes'
import statsRoutes from './routes/stats.routes'

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

app.get('/health', (req, res) => {
    res.json({ status: 'ok' })
})

export default app;