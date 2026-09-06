import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { 
  ArrowLeft, 
  Send, 
  MapPin, 
  DollarSign, 
  Tags, 
  Briefcase,
  FileText,
  AlertCircle,
  Loader2,
  CheckCircle2
} from 'lucide-react';
import api from '../../lib/api';

export default function CreateJob() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    requiredSkills: '',
    stipend: '',
    location: '',
    jobType: 'internship'
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      // Process skills from comma-separated string to array
      const skillsArray = formData.requiredSkills.split(',').map(s => s.trim()).filter(s => s !== '');
      
      const payload = {
        ...formData,
        requiredSkills: skillsArray
      };

      await api.post('/recruiter/jobs', payload);
      setSuccess(true);
      setTimeout(() => navigate('/recruiter/jobs'), 2000);
    } catch (err) {
      console.error('Create Job Error:', err);
      alert('Failed to create job. Please check all fields.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="flex flex-col items-center justify-center h-[70vh] animate-in zoom-in duration-300">
        <div className="bg-green-100 p-4 rounded-full mb-6">
          <CheckCircle2 size={64} className="text-green-600" />
        </div>
        <h2 className="text-3xl font-bold text-primary mb-2">Job Posted Successfully!</h2>
        <p className="text-secondary text-lg mb-8 text-center max-w-md">
          Your job is now live for students immediately. You will be redirected to the management page shortly.
        </p>
        <div className="flex gap-4">
           <Button variant="outline" onClick={() => navigate('/recruiter/jobs')}>View My Jobs</Button>
           <Button onClick={() => setSuccess(false)}>Post Another</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-10">
      <div className="flex items-center gap-4">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => navigate('/recruiter/jobs')}
          className="rounded-full hover:bg-gray-100"
        >
          <ArrowLeft size={20} />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-primary">Create a New Opportunity</h1>
          <p className="text-secondary text-sm">Fill in the details below to find your next great hire.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 items-start">
        <div className="lg:col-span-2 space-y-6">
          <Card className="p-4 sm:p-6 lg:p-8 border-border/50 shadow-sm space-y-6 bg-white">
            <div className="space-y-2">
              <label className="text-sm font-bold text-primary flex items-center gap-2">
                <Briefcase size={16} className="text-accent" /> Job Title
              </label>
              <Input 
                name="title" 
                placeholder="e.g. Senior Frontend Developer (React)"
                required
                value={formData.title}
                onChange={handleChange}
                className="h-11 sm:h-12 text-sm sm:text-base font-medium rounded-xl border-border/50 focus:ring-accent"
              />
              <p className="text-[10px] text-gray-400">Keep it clear and specific to attract relevant candidates.</p>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-primary flex items-center gap-2">
                <FileText size={16} className="text-accent" /> Job Description
              </label>
              <textarea 
                name="description" 
                rows={8}
                required
                value={formData.description}
                onChange={handleChange}
                className="w-full border border-border/50 rounded-xl p-4 text-sm focus:ring-2 focus:ring-accent outline-none bg-background resize-none"
                placeholder="Detail the role, responsibilities, and impact..."
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-primary flex items-center gap-2">
                <Tags size={16} className="text-accent" /> Required Skills (Comma separated)
              </label>
              <Input 
                name="requiredSkills" 
                placeholder="React, Tailwind, Node.js, TypeScript..."
                required
                value={formData.requiredSkills}
                onChange={handleChange}
                className="h-11 sm:h-12 text-sm font-medium rounded-xl border-border/50 focus:ring-accent"
              />
              <div className="flex flex-wrap gap-2 mt-2">
                {formData.requiredSkills.split(',').filter(s => s.trim() !== '').map((skill, idx) => (
                  <span key={idx} className="bg-accent/10 text-accent px-3 py-1 rounded-full text-[10px] font-bold border border-accent/20">
                    {skill.trim()}
                  </span>
                ))}
              </div>
            </div>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="p-4 sm:p-6 border-border/50 shadow-sm space-y-6 bg-white sticky top-24">
            <div className="space-y-4 sm:space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-primary flex items-center gap-2">
                  <MapPin size={16} className="text-accent" /> Location
                </label>
                <Input 
                  name="location" 
                  placeholder="Remote, Bangalore, Mumbai..."
                  required
                  value={formData.location}
                  onChange={handleChange}
                  className="rounded-xl border-border/50 focus:ring-accent h-11"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-primary flex items-center gap-2">
                  <DollarSign size={16} className="text-accent" /> Stipend / Salary
                </label>
                <Input 
                  name="stipend" 
                  placeholder="e.g. 20k-25k / Month or Unpaid"
                  value={formData.stipend}
                  onChange={handleChange}
                  className="rounded-xl border-border/50 focus:ring-accent h-11"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-primary">Job Type</label>
                <div className="grid grid-cols-2 lg:grid-cols-1 gap-2">
                   <button 
                     type="button" 
                     onClick={() => setFormData(prev => ({...prev, jobType: 'internship'}))}
                     className={`p-3 rounded-xl border text-sm font-bold transition-all ${formData.jobType === 'internship' ? 'bg-primary text-white border-primary shadow-md' : 'bg-white text-secondary border-border hover:bg-gray-50'}`}
                   >
                     Internship
                   </button>
                   <button 
                     type="button" 
                     onClick={() => setFormData(prev => ({...prev, jobType: 'full-time'}))}
                     className={`p-3 rounded-xl border text-sm font-bold transition-all ${formData.jobType === 'full-time' ? 'bg-primary text-white border-primary shadow-md' : 'bg-white text-secondary border-border hover:bg-gray-50'}`}
                   >
                     Full-time
                   </button>
                </div>
              </div>

              <hr className="border-border/50" />

              <div className="bg-yellow-50/50 border border-yellow-100 p-4 rounded-xl flex gap-3">
                 <AlertCircle size={20} className="text-yellow-600 shrink-0 mt-0.5" />
                 <p className="text-[10px] text-yellow-800 leading-relaxed font-medium">
                   New jobs publish directly to students. Admin now monitors listings instead of acting as a publish gate.
                 </p>
              </div>

              <Button 
                type="submit" 
                disabled={loading}
                className="w-full h-12 sm:h-14 bg-accent hover:bg-accent/90 text-white font-bold text-base sm:text-lg rounded-xl shadow-lg shadow-accent/20 flex items-center justify-center gap-2 group"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                  <>
                    Publish Job <Send size={20} className="hidden sm:inline group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                  </>
                )}
              </Button>
            </div>
          </Card>
        </div>
      </form>
    </div>
  );
}
