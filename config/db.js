import mongoose from 'mongoose'

const ConnectDb=async()=>{
    try {
        await mongoose.connect(process.env.MONGO_URL)
        console.log("Db connected")
        
    } catch (err) {
        console.log(err)
    }
}

export default ConnectDb