import express from "express"
import cors from 'cors'
import cookieParser from "cookie-parser"
import AuthRoutes from "./routes/AuthRoutes.js"
import userRoutes from './routes/userRoutes.js'

const app =express()
app.use(cookieParser())

app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
  })
);
app.use(express.json())

app.use('/api/auth',AuthRoutes)
app.use('/api/users',userRoutes)



export default app