import express from 'express'
import cors from 'cors'
import 'dotenv/config'
import { connectDB } from './config/db.js'

const PORT = 5000

const app =express()

//*Middlawers
app.use(cors)
app.use(express.json())

//*DB connected
connectDB()

//Routes
app.get('/',(req,res)=>{
    res.send('Web App')
})

app.listen(PORT,()=>{
    console.log(`Server Running on Port ${PORT}`)
})