import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import Job from '../models/Job.js';
import Application from '../models/Application.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure the .env path is correctly pointed at the server root
dotenv.config({ path: path.join(__dirname, '../.env') });

const seedDatabase = async () => {
    try {
        if (!process.env.MONGODB_URI) {
            console.error("MONGODB_URI is not defined in your environment.");
            process.exit(1);
        }

        console.log("Connecting to MongoDB...");
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("Connected Successfully.");

        // 1. Clear existing data
        console.log("Cleaning Database...");
        await User.deleteMany({});
        await Job.deleteMany({});
        await Application.deleteMany({});

        // 2. Create Users
        console.log("Creating Sample Users...");
        
        // ADMIN
        const adminUser = await User.create({
            name: "Platform Administrator",
            email: "admin@example.com",
            password: "password123",
            role: "admin"
        });

        // RECRUITERS
        const recruiter1 = await User.create({
            name: "Hrithik Roshan",
            email: "hrithik@techflow.com",
            password: "password123",
            role: "recruiter",
            companyName: "TechFlow Inc."
        });

        const recruiter2 = await User.create({
            name: "Sara Ali Khan",
            email: "sara@creativesynergy.com",
            password: "password123",
            role: "recruiter",
            companyName: "CreativeSynergy"
        });

        // STUDENTS
        const student1 = await User.create({
            name: "Rahul Khanna",
            email: "rahul@student.com",
            password: "password123",
            role: "student",
            skills: ["React", "Node.js", "Python", "Problem Solving"]
        });

        const student2 = await User.create({
            name: "Anjali Gupta",
            email: "anjali@student.com",
            password: "password123",
            role: "student",
            skills: ["UI/UX", "Figma", "Tailwind CSS", "Storytelling"]
        });

        console.log("Users Created.");

        // 3. Create Sample Jobs
        console.log("Posting Sample Jobs...");
        
        // Pending approval job for admin to see
        const pendingJob = await Job.create({
            title: "Senior AI Researcher",
            description: "We are looking for someone to lead our AI research for the next-gen recommendation systems.",
            requiredSkills: ["PyTorch", "TensorFlow", "NLP", "Machine Learning"],
            location: "Bangalore (Remote)",
            jobType: "full-time",
            stipend: "₹250k - ₹350k / month",
            postedBy: recruiter1._id,
            status: "pending"
        });

        // Approved active job
        const activeJob = await Job.create({
            title: "Frontend Developer (React)",
            description: "Join our core UI team to build beautiful dashboard components.",
            requiredSkills: ["React", "JavaScript", "Tailwind CSS"],
            location: "Hyderabad",
            jobType: "full-time",
            stipend: "₹1,200k / year",
            postedBy: recruiter1._id,
            status: "approved"
        });

        // Rejected job
        await Job.create({
            title: "Data Monkey",
            description: "Tons of manual data entry with almost zero growth potential.",
            requiredSkills: ["Excel", "Typing"],
            location: "New York",
            jobType: "internship",
            stipend: "₹0",
            postedBy: recruiter2._id,
            status: "rejected"
        });

        console.log("Jobs Posted.");

        // 4. Create Applications
        console.log("Simulating Applications...");
        
        await Application.create({
            userId: student1._id,
            jobId: activeJob._id,
            matchScore: 92,
            finalScore: 88,
            status: "shortlisted",
            notes: "Excellent technical test results. High React proficiency."
        });

        await Application.create({
            userId: student2._id,
            jobId: activeJob._id,
            matchScore: 65,
            finalScore: 70,
            status: "applied"
        });

        console.log("Seeding Completed Successfully.");
        process.exit(0);

    } catch (error) {
        console.error("Critical Seeding Error:", error);
        process.exit(1);
    }
};

seedDatabase();
