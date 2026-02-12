import express from 'express';
import adminContextRouter from './routes/admin.routes';
import projectContextRouter from './routes/project.routes';
import emailVerificationRouter from './modules/email_verification/emailVerification.router';
import { errorHandler } from './middleware/errorHandler';

const app = express();

app.use(express.json());

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use('/api/auth/email-verification', emailVerificationRouter);
app.use('/api/admin', adminContextRouter);
app.use('/api', projectContextRouter);

app.use(errorHandler);

export default app;
