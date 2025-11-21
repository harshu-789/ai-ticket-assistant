import express from 'express';
import { registerUser,loginUser , logoutUser, updateUser, getUsers} from '../controllers/user.js';
import { authenticate } from '../middlewares/auth.js';


const router = express.Router();


router.get('/users', authenticate,getUsers)
router.post('/update-user',authenticate,updateUser)
router.post('/register', registerUser)
router.post('/login', loginUser)
router.post('/logout', logoutUser)



export default router;