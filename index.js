import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import userRouter from './routes/user.js';

const PORT = process.env.PORT || 3000;
const app = express();

app.use(cors());
app.use(express.json());
app.use("/api/auth",userRouter)


mongoose
.connect(process.env.MONGO_URI )
.then(() => {
    console.log('MongoDB connected ✅');
    app.listen(PORT, () => {
        console.log('Server at http://localhost:3000 ✅');
    });
})
.catch((error) => {
    console.error(' ❎ MongoDB connection error:', error);
});