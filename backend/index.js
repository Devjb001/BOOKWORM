import express, { json } from "express"
import "dotenv/config"
import cors from "cors"

import connectToDataBase from "./src/config/db.js";
import job from "./src/lib/cron.js"

import authRoute from './src/routes/authRoute.js'
import bookRoute from './src/routes/bookRoutes.js'

const app = express();

job.start();
app.use(cors());
app.use(express.json())
const PORT = process.env.PORT;

connectToDataBase();

app.use('/api/auth', authRoute)
app.use('/api/book', bookRoute)


app.get("/" , (req , res)=> {
    console.log("HOME ROUTE")
    res.status(200).json({
        message : "This is home route"
    })
})

app.listen(PORT, ()=> {
    console.log(`Sever is listenting on http://localhost:${PORT}`)
})