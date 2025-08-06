import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();


export const connectDB = async () => {
    try {
        const connection = await mongoose.connect(process.env.MONGODB_URI);
        console.log(`Connected to MongoDB: ${connection.connection.host}`);
    } catch (error) {
        console.log(error);
    }
}

