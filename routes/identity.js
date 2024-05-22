import express from 'express'
import { identifyCustomer } from '../controllers/indentify'
const router=express.Router()

router.post('/identity',identifyCustomer)

export default router
