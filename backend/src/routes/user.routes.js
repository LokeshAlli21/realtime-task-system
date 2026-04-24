import express from 'express'
import { getMe, getAllUsers, getUserById } from '../controllers/user.controller.js'
import {protect} from '../middlewares/auth.middleware.js'

const router = express.Router()

router.get('/me', protect, getMe)
router.get("/", protect, getAllUsers);
router.get("/:id", protect, getUserById);

export default router