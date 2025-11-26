import express from 'express';
import { authenticate } from '../middlewares/auth.js';
import { createTicket, getTicket, getTickets,  updateTicket, deleteTicket} from '../controllers/ticket.js';

const router = express.Router();


router.get('/', authenticate, getTickets)
router.post('/', authenticate, createTicket)
router.get('/:id', authenticate, getTicket)
router.put('/:id', authenticate, updateTicket)
router.delete('/:id', authenticate, deleteTicket)

export default router;