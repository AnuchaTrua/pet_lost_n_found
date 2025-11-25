import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import path from 'path';
import reportRoutes from './routes/reportRoutes';
import { env } from './config/env';
import { errorMiddleware } from './middleware/errorMiddleware';

const app = express();

app.use(
  cors({
    origin: env.clientUrl,
  }),
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

app.use('/uploads', express.static(path.resolve(process.cwd(), env.uploadsDir)));

app.use('/api/reports', reportRoutes);

app.use(errorMiddleware);

export default app;

