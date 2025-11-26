import express from 'express';
import { authenticate } from '../middlewares/auth.js';
import { createTicket, getTicket, getTickets } from '../controllers/ticket.js';

const router = express.Router();


router.get('/tickets', authenticate, getTickets)
router.post('/create-ticket', authenticate, createTicket)
router.get('/ticket/:id', authenticate, getTicket)

export default router;