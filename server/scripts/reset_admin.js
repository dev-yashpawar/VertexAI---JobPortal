import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';
import bcrypt from 'bcryptjs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../.env') });

const resetPassword = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        const email = "admin@example.com";
        const password = "password123";

        const salt = await bcrypt.genSalt(10);
        const hashed = await bcrypt.hash(password, salt);

        const result = await User.updateOne({ email }, { password: hashed });
        console.log("PASSWORD_RESET:", result.modifiedCount > 0 ? "SUCCESS" : "FAILED");
        
        process.exit(0);
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

resetPassword();
