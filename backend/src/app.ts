import express from 'express';
import authRoutes from './routes/auth.routes';
import inputRoutes from './routes/input.routes';
import outputRoutes from './routes/output.routes';

const app = express();

app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/inputs', inputRoutes);
app.use('/api/inputs/:inputId/output', outputRoutes);

app.get('/health', (req, res) => {
    res.json({ status: 'ok' });
});

export default app;