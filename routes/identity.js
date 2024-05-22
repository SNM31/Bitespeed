import express from 'express'
import { identifyCustomer } from '../controllers/indentify.js'

const router=express.Router()

console.log('code reached in route');

router.post('/',identifyCustomer)

export default router
