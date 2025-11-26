import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import userRouter from './routes/user.js';
import ticketRouter from './routes/ticket.js';
import { serve } from 'inngest/express';
import {inngest} from './inngest/client.js';
import { onSignup } from './inngest/functions/on-signup.js';
import { onTicketCreate } from './inngest/functions/on-ticket-create.js';

import dotenv from 'dotenv';
dotenv.config();

const PORT = process.env.PORT || 3000;
const app = express();

app.use(cors());
app.use(express.json());
app.use("/api/auth",userRouter)
app.use("/api/tickets",ticketRouter)
app.use("/api/inngest", serve({client: inngest, functions: [onSignup, onTicketCreate] }))

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