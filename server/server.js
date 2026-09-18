import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import { connectDB } from './config/db.js';
import authRouter from './routes/authRoutes.js';
import studentRouter from './routes/studentRoutes.js';
import bookRouter from './routes/bookRoutes.js';

const PORT = 5000;
const app = express();

// ============ Middlewares ============
app.use(cors());             
app.use(express.json());   

// ============ Routes ============
app.use("/api/auth", authRouter);
app.use("/api/students", studentRouter);
app.use('/api/books',bookRouter)

// ============ DB Connected ============
const startServer = async () => {
    try {
        await connectDB();
        console.log('✅ متصل به MongoDB');

        // ============ Routes ============
        app.use('/api/auth', authRouter);

        // ============ Start Server ============
        app.listen(PORT, () => {
            console.log(`✅ Server Running on Port ${PORT}`);
        });
    } catch (error) {
        console.error('❌ خطا در اتصال به دیتابیس:', error);
        process.exit(1);
    }
};

startServer();