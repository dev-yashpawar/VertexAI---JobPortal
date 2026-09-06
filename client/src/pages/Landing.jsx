import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { 
  CheckCircle2, AlertCircle, ArrowRight, BrainCircuit, 
  FileText, TrendingUp, Users, Filter, BarChart3, Star
} from 'lucide-react';

export default function Landing() {
  const [activeTab, setActiveTab] = useState('student');

  return (
    <div className="flex flex-col w-full overflow-hidden">
      {/* 1. HERO SECTION */}
      <section className="bg-surface py-20 px-6 border-b border-border">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="max-w-xl">
            <h1 className="text-4xl lg:text-5xl font-extrabold text-primary leading-tight mb-6 tracking-tight">
              Get Matched with the Right Jobs Using <span className="text-accent">AI</span>
            </h1>
            <p className="text-lg text-secondary mb-8 leading-relaxed">
              An intelligent career platform that analyzes your skills, recommends the best opportunities, and helps you track your applications seamlessly.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link to="/register?role=student">
                <Button size="lg" className="w-full sm:w-auto shadow-sm">
                  Get Started as Student
                </Button>
              </Link>
              <Link to="/register?role=recruiter">
                <Button variant="secondary" size="lg" className="w-full sm:w-auto font-medium">
                  Hire Talent
                </Button>
              </Link>
            </div>
            <div className="mt-6 flex items-center gap-2 text-sm text-secondary font-medium">
              <Link to="/jobs" className="flex items-center gap-1 hover:text-primary transition-colors">
                Explore Jobs <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
          
          <div className="relative mx-auto w-full max-w-lg lg:max-w-none">
            {/* Dashboard Mockup Illustration */}
            <div className="bg-background border border-border rounded-xl shadow-lg overflow-hidden transform rotate-2 hover:rotate-0 transition-transform duration-500 relative">
              <div className="bg-gray-100 flex items-center px-4 py-2 border-b border-border">
                <div className="flex gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-400"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                  <div className="w-3 h-3 rounded-full bg-green-400"></div>
                </div>
              </div>
              <div className="p-6 h-[400px] flex flex-col gap-4">
                {/* Mock Card */}
                <div className="bg-white border-l-4 border-accent shadow-sm rounded-lg p-4 flex justify-between items-center">
                   <div>
                     <h4 className="font-bold text-primary">Senior Frontend Developer</h4>
                     <p className="text-sm text-secondary truncate">TechFlow Inc. • San Francisco</p>
                   </div>
                   <div className="bg-accent-light text-accent font-bold px-3 py-1 rounded text-sm">98% Match</div>
                </div>
                {/* Mock Card */}
                <div className="bg-white border text-primary shadow-sm rounded-lg p-4 flex justify-between items-center opacity-80">
                   <div>
                     <h4 className="font-bold text-primary">UI/UX Designer</h4>
                     <p className="text-sm text-secondary">CreativeSynergy • Remote</p>
                   </div>
                   <div className="bg-green-100 text-green-700 font-bold px-3 py-1 rounded text-sm">85% Match</div>
                </div>
                {/* Mock Card */}
                <div className="bg-white border text-primary shadow-sm rounded-lg p-4 flex justify-between items-center opacity-60">
                   <div>
                     <h4 className="font-bold text-primary">Backend Internship</h4>
                     <p className="text-sm text-secondary">DataCore • New York</p>
                   </div>
                   <div className="bg-gray-100 text-secondary font-bold px-3 py-1 rounded text-sm">Waiting</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. PROBLEM -> SOLUTION SECTION */}
      <section id="features" className="py-20 px-6 bg-background">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-primary tracking-tight">Fixing the Broken Hiring Process</h2>
            <p className="text-secondary mt-4 max-w-2xl mx-auto">We identified the core issues in student hiring and built AI-driven solutions to solve them.</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 text-center sm:text-left">
            <Card className="flex flex-col items-center sm:items-start p-8 hover:-translate-y-1 transition duration-300">
              <div className="bg-red-50 p-3 rounded-full mb-6">
                <AlertCircle className="w-8 h-8 text-danger" />
              </div>
              <h3 className="font-bold text-lg text-primary mb-2 line-through text-red-500/80">
                <span className="text-primary no-underline">Fake or irrelevant internships</span>
              </h3>
              <p className="text-secondary mb-6 text-sm">Students waste hours applying to expired or fraudulent jobs.</p>
              
              <div className="mt-auto border-t border-border pt-6 w-full text-left">
                <div className="flex gap-2 text-accent font-medium items-start">
                   <CheckCircle2 className="w-5 h-5 shrink-0" />
                   <span>Verified job listings</span>
                </div>
              </div>
            </Card>

            <Card className="flex flex-col items-center sm:items-start p-8 hover:-translate-y-1 transition duration-300">
              <div className="bg-red-50 p-3 rounded-full mb-6">
                <AlertCircle className="w-8 h-8 text-danger" />
              </div>
              <h3 className="font-bold text-lg text-primary mb-2 line-through text-red-500/80">
                <span className="text-primary no-underline">No clarity on required skills</span>
              </h3>
              <p className="text-secondary mb-6 text-sm">Job descriptions are vague, causing students to guess what they need.</p>
              
              <div className="mt-auto border-t border-border pt-6 w-full text-left">
                <div className="flex gap-2 text-accent font-medium items-start">
                   <BrainCircuit className="w-5 h-5 shrink-0" />
                   <span>AI skill matching & gap analysis</span>
                </div>
              </div>
            </Card>

            <Card className="flex flex-col items-center sm:items-start p-8 hover:-translate-y-1 transition duration-300">
              <div className="bg-red-50 p-3 rounded-full mb-6">
                <AlertCircle className="w-8 h-8 text-danger" />
              </div>
              <h3 className="font-bold text-lg text-primary mb-2 line-through text-red-500/80">
                <span className="text-primary no-underline">Unfiltered applications</span>
              </h3>
              <p className="text-secondary mb-6 text-sm">Recruiters get spammed with irrelevant resumes.</p>
              
              <div className="mt-auto border-t border-border pt-6 w-full text-left">
                <div className="flex gap-2 text-accent font-medium items-start">
                   <Filter className="w-5 h-5 shrink-0" />
                   <span>Smart candidate ranking system</span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* 3. FEATURES GRID SECTION */}
      <section className="py-20 px-6 bg-surface border-y border-border">
         <div className="max-w-7xl mx-auto">
           <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-primary tracking-tight">One Platform, Dual Power</h2>
              <p className="text-secondary mt-4 max-w-2xl mx-auto">Tailored feature sets giving complete transparency to both applicants and employers.</p>
           </div>
           
           <div className="grid md:grid-cols-2 gap-12">
             {/* For Students */}
             <div>
               <h3 className="text-2xl font-bold text-primary mb-6 border-b border-border pb-4 flex items-center gap-2"><div className="w-2 h-6 bg-accent rounded" /> For Students</h3>
               <div className="grid gap-6">
                 <div className="flex items-start gap-4">
                   <div className="bg-accent/10 p-3 rounded-xl shrink-0"><BrainCircuit className="w-6 h-6 text-accent" /></div>
                   <div>
                      <h4 className="font-bold text-primary mb-1">AI Job Matching</h4>
                      <p className="text-sm text-secondary leading-relaxed">Instantly know your compatibility score for any job based on a deep analysis of your skills.</p>
                   </div>
                 </div>
                 <div className="flex items-start gap-4">
                   <div className="bg-accent/10 p-3 rounded-xl shrink-0"><FileText className="w-6 h-6 text-accent" /></div>
                   <div>
                      <h4 className="font-bold text-primary mb-1">Resume Analyzer (ATS)</h4>
                      <p className="text-sm text-secondary leading-relaxed">Upload your PDF resume to extract skills, get actionable feedback, and increase your ATS score.</p>
                   </div>
                 </div>
                 <div className="flex items-start gap-4">
                   <div className="bg-accent/10 p-3 rounded-xl shrink-0"><TrendingUp className="w-6 h-6 text-accent" /></div>
                   <div>
                      <h4 className="font-bold text-primary mb-1">Application Tracker</h4>
                      <p className="text-sm text-secondary leading-relaxed">A clean kanban-like dashboard to monitor the status of every application in real-time.</p>
                   </div>
                 </div>
               </div>
             </div>
             
             {/* For Recruiters */}
             <div>
               <h3 className="text-2xl font-bold text-primary mb-6 border-b border-border pb-4 flex items-center gap-2"><div className="w-2 h-6 bg-blue-600 rounded" /> For Recruiters</h3>
               <div className="grid gap-6">
                 <div className="flex items-start gap-4">
                   <div className="bg-blue-50 p-3 rounded-xl shrink-0"><Users className="w-6 h-6 text-blue-600" /></div>
                   <div>
                      <h4 className="font-bold text-primary mb-1">Candidate Ranking System</h4>
                      <p className="text-sm text-secondary leading-relaxed">Stop reading bad resumes. View an AI-ranked list sorted directly by candidate relevance.</p>
                   </div>
                 </div>
                 <div className="flex items-start gap-4">
                   <div className="bg-blue-50 p-3 rounded-xl shrink-0"><Filter className="w-6 h-6 text-blue-600" /></div>
                   <div>
                      <h4 className="font-bold text-primary mb-1">Smart Profile Filtering</h4>
                      <p className="text-sm text-secondary leading-relaxed">Filter candidates instantly by specific skill stacks, experience layers, or minimum AI match quotas.</p>
                   </div>
                 </div>
                 <div className="flex items-start gap-4">
                   <div className="bg-blue-50 p-3 rounded-xl shrink-0"><BarChart3 className="w-6 h-6 text-blue-600" /></div>
                   <div>
                      <h4 className="font-bold text-primary mb-1">Hiring Analytics</h4>
                      <p className="text-sm text-secondary leading-relaxed">Dashboard metrics providing conversion rates, application volume trends, and funnel health.</p>
                   </div>
                 </div>
               </div>
             </div>
           </div>
         </div>
      </section>

      {/* 4. HOW IT WORKS SECTION */}
      <section id="how-it-works" className="py-20 px-6 bg-background">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-primary tracking-tight mb-8">How It Works</h2>
          
          <div className="inline-flex bg-surface border border-border rounded-lg p-1 mb-12">
             <button 
               className={`px-8 py-2 rounded-md font-medium text-sm transition ${activeTab === 'student' ? 'bg-accent text-white shadow' : 'text-secondary hover:text-primary'}`}
               onClick={() => setActiveTab('student')}
             >
               Students
             </button>
             <button 
               className={`px-8 py-2 rounded-md font-medium text-sm transition ${activeTab === 'recruiter' ? 'bg-primary text-white shadow' : 'text-secondary hover:text-primary'}`}
               onClick={() => setActiveTab('recruiter')}
             >
               Recruiters
             </button>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {activeTab === 'student' ? (
              <>
                 <div className="flex flex-col items-center">
                    <div className="w-16 h-16 rounded-full bg-accent/10 border border-accent/20 flex items-center justify-center text-accent font-bold text-2xl mb-4">1</div>
                    <h4 className="font-bold text-primary text-lg mb-2">Upload Resume</h4>
                    <p className="text-secondary text-sm">Our AI parses your PDF and builds an intelligent skill profile instantly.</p>
                 </div>
                 <div className="flex flex-col items-center relative">
                    <div className="hidden md:block absolute top-8 -left-[20%] w-[40%] h-[2px] bg-gradient-to-r from-accent/0 to-accent/50"></div>
                    <div className="w-16 h-16 rounded-full bg-accent text-white shadow-lg flex items-center justify-center font-bold text-2xl mb-4 z-10">2</div>
                    <h4 className="font-bold text-primary text-lg mb-2">Get AI Recommendations</h4>
                    <p className="text-secondary text-sm">Browse jobs sorted by your exact capability match percentage.</p>
                    <div className="hidden md:block absolute top-8 -right-[20%] w-[40%] h-[2px] bg-gradient-to-l from-accent/0 to-accent"></div>
                 </div>
                 <div className="flex flex-col items-center">
                    <div className="w-16 h-16 rounded-full bg-accent/10 border border-accent/20 flex items-center justify-center text-accent font-bold text-2xl mb-4">3</div>
                    <h4 className="font-bold text-primary text-lg mb-2">Apply & Track</h4>
                    <p className="text-secondary text-sm">Submit your profile securely and monitor status updates in real-time.</p>
                 </div>
              </>
            ) : (
              <>
                 <div className="flex flex-col items-center">
                    <div className="w-16 h-16 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-bold text-2xl mb-4">1</div>
                    <h4 className="font-bold text-primary text-lg mb-2">Post a Job</h4>
                    <p className="text-secondary text-sm">Define required skills and job specifics in seconds. No clutter.</p>
                 </div>
                 <div className="flex flex-col items-center relative">
                    <div className="hidden md:block absolute top-8 -left-[20%] w-[40%] h-[2px] bg-gradient-to-r from-primary/0 to-primary/50"></div>
                    <div className="w-16 h-16 rounded-full bg-primary text-white shadow-lg flex items-center justify-center font-bold text-2xl mb-4 z-10">2</div>
                    <h4 className="font-bold text-primary text-lg mb-2">Get Ranked Candidates</h4>
                    <p className="text-secondary text-sm">Review an automated leaderboard of candidates ordered by pure skill fit.</p>
                    <div className="hidden md:block absolute top-8 -right-[20%] w-[40%] h-[2px] bg-gradient-to-l from-primary/0 to-primary"></div>
                 </div>
                 <div className="flex flex-col items-center">
                    <div className="w-16 h-16 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-bold text-2xl mb-4">3</div>
                    <h4 className="font-bold text-primary text-lg mb-2">Shortlist & Manage</h4>
                    <p className="text-secondary text-sm">Move candidates through your pipeline and leave internal review notes.</p>
                 </div>
              </>
            )}
          </div>
        </div>
      </section>

      {/* 5. TESTIMONIALS SECTION */}
      <section className="py-20 px-6 bg-surface border-y border-border">
         <div className="max-w-7xl mx-auto">
           <h2 className="text-3xl font-bold text-center text-primary tracking-tight mb-16">What Our Users Say</h2>
           <div className="grid md:grid-cols-3 gap-8">
             <Card className="p-8 relative">
               <Star className="w-8 h-8 text-yellow-400 absolute top-6 right-6 opacity-30 fill-yellow-400" />
               <p className="text-secondary italic mb-6">"The AI match score changed everything. I stopped wasting time applying to jobs I had no chance at, and landed an internship exactly matching my React skills in 2 weeks."</p>
               <div className="flex items-center gap-3">
                 <div className="w-10 h-10 rounded-full bg-accent text-white flex items-center justify-center font-bold">SM</div>
                 <div>
                   <h5 className="font-bold text-primary text-sm">Sarah Mitchell</h5>
                   <p className="text-xs text-secondary">Student, CS Major</p>
                 </div>
               </div>
             </Card>
             <Card className="p-8 relative bg-primary text-white border-0 shadow-lg scale-100 md:scale-105 z-10">
               <Star className="w-8 h-8 text-yellow-400 absolute top-6 right-6 fill-yellow-400" />
               <p className="text-gray-300 italic mb-6">"As a startup recruiter, I don't have time to read 500 identical resumes. This platform hands me the top 10 most technically qualified candidates immediately. It's magic."</p>
               <div className="flex items-center gap-3 border-t border-gray-700 pt-4">
                 <div className="w-10 h-10 rounded-full bg-white text-primary flex items-center justify-center font-bold">DR</div>
                 <div>
                   <h5 className="font-bold text-white text-sm">David Rodriguez</h5>
                   <p className="text-xs text-gray-400">Head of Engineering, TechFlow</p>
                 </div>
               </div>
             </Card>
             <Card className="p-8 relative">
               <Star className="w-8 h-8 text-yellow-400 absolute top-6 right-6 opacity-30 fill-yellow-400" />
               <p className="text-secondary italic mb-6">"The ATS resume analyzer told me exactly what I was missing. I added the recommended keywords, tracked my applications, and finally got past the screening phase!"</p>
               <div className="flex items-center gap-3">
                 <div className="w-10 h-10 rounded-full bg-accent text-white flex items-center justify-center font-bold">JP</div>
                 <div>
                   <h5 className="font-bold text-primary text-sm">James Peterson</h5>
                   <p className="text-xs text-secondary">Recent Graduate</p>
                 </div>
               </div>
             </Card>
           </div>
         </div>
      </section>

      {/* 6. FINAL CTA */}
      <section className="py-24 px-6 bg-primary">
         <div className="max-w-4xl mx-auto text-center text-white">
           <h2 className="text-3xl md:text-5xl font-extrabold mb-6 tracking-tight">Start Your Career Journey Today</h2>
           <p className="text-xl text-gray-400 mb-10 max-w-2xl mx-auto leading-relaxed">
             Join thousands of ambitious students and modern recruiters using AI to simplify the hiring complexity.
           </p>
           <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link to="/register?role=student">
                 <Button size="lg" className="w-full sm:w-auto bg-accent text-white hover:bg-green-600 px-8 py-6 text-lg">
                   Sign Up as Student
                 </Button>
              </Link>
              <Link to="/register?role=recruiter">
                 <Button size="lg" className="w-full sm:w-auto bg-white text-primary border-0 hover:bg-gray-100 px-8 py-6 text-lg">
                   Post a Job
                 </Button>
              </Link>
           </div>
         </div>
      </section>
    </div>
  );
}
