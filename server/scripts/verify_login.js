import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';
import bcrypt from 'bcryptjs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../.env') });

const verifyLogin = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        const email = "admin@example.com";
        const password = "password123";

        const user = await User.findOne({ email });
        if (!user) {
            console.log("USER_NOT_FOUND");
            process.exit(0);
        }

        const isMatch = await user.matchPassword(password);
        console.log("LOGIN_RESULT:", isMatch ? "SUCCESS" : "FAILED");
        console.log("HASHED_PASSWORD_IN_DB:", user.password);
        
        process.exit(0);
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

verifyLogin();
