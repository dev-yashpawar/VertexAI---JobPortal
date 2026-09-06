import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../.env') });

const checkAdmin = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        const admins = await User.find({ role: 'admin' }).select('email name');
        if (admins.length > 0) {
            console.log("ADMINS_FOUND:", JSON.stringify(admins));
        } else {
            console.log("NO_ADMINS_FOUND");
        }
        process.exit(0);
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

checkAdmin();
