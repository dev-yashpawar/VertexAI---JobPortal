import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../.env') });

const testRegister = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        const testEmail = "testuser_" + Date.now() + "@gmail.com";
        const user = await User.create({
            name: "Yash Pawar",
            email: testEmail,
            password: "password123",
            role: "student"
        });
        
        console.log("REGISTRATION_RESULT: SUCCESS");
        console.log("CREATED_USER_ID:", user._id);
        
        await User.deleteOne({ _id: user._id }); // Cleanup
        process.exit(0);
    } catch (error) {
        console.error("REGISTRATION_RESULT: FAILED", error.message);
        process.exit(1);
    }
};

testRegister();
