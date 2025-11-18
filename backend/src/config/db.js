import mongoose from 'mongoose'
import 'dotenv/config'

async function connectToDataBase(params) {
    try {
        const connection = await mongoose.connect(process.env.MONGO_URI)
        console.log(`Database connected to ${connection.connection.host}`)
    } catch (error) {
        console.log("Erro connecting to database", error)
        process.exit(1)
    }
}

export default connectToDataBase