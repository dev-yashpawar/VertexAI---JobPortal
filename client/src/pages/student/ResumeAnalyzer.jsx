import { useState } from 'react';
import { Card } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { 
  FileText, 
  UploadCloud, 
  Loader2, 
  Zap, 
  CheckCircle2, 
  Info,
  TrendingUp,
  BrainCircuit,
  Target
} from 'lucide-react';
import api from '../../lib/api';
import useAuthStore from '../../store/useAuthStore';

export default function ResumeAnalyzer() {
  const { user, updateUser } = useAuthStore();
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [analysis, setAnalysis] = useState(user.aiAnalysis || null);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('resume', file);

    try {
      // 1. Upload
      const uploadRes = await api.post('/student/resume/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      // 2. Analyze
      const analyzeRes = await api.post('/ai/analyze-resume', { resumeUrl: uploadRes.data.resumeUrl });
      const profileRes = await api.get('/student/profile');
      
      setAnalysis(analyzeRes.data);
      updateUser({
        ...profileRes.data,
        aiAnalysis: analyzeRes.data,
        aiCredits: analyzeRes.data.credits
      });
      
    } catch (err) {
      alert(err.response?.data?.message || 'Analysis failed');
    } finally {
      setUploading(false);
      setFile(null);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in slide-in-from-top-4 duration-500">
      <div>
        <h1 className="text-3xl font-bold text-primary tracking-tight">AI Resume Analyzer</h1>
        <p className="text-secondary mt-1">Harness high-precision AI to optimize your profile for ATS algorithms.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Upload Area (5 cols) */}
        <div className="lg:col-span-5">
           <Card className="p-8 border-none shadow-xl shadow-gray-200/50 bg-white">
              <h2 className="text-xl font-bold text-primary mb-6 flex items-center gap-2">
                <UploadCloud size={20} className="text-accent" /> Upload Center
              </h2>
              
              <form onSubmit={handleUpload} className="space-y-6">
                <div className="border-2 border-dashed border-border rounded-2xl p-8 text-center bg-gray-50/50 hover:bg-gray-50 hover:border-accent transition-all cursor-pointer relative group">
                  <Input 
                    type="file" 
                    onChange={handleFileChange} 
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" 
                    accept=".pdf,.doc,.docx" 
                  />
                  <div className="w-16 h-16 bg-white rounded-2xl border border-border shadow-sm mx-auto flex items-center justify-center text-secondary group-hover:text-accent mb-4 transition-colors">
                    <FileText size={32} />
                  </div>
                  <p className="text-sm font-bold text-primary">
                    {file ? file.name : 'Click to browse or drag & drop'}
                  </p>
                  <p className="text-xs text-secondary mt-1">PDF, DOCX up to 2MB</p>
                </div>

                <Button 
                  type="submit" 
                  disabled={!file || uploading || (user?.aiCredits < 2)} 
                  variant="primary" 
                  className="w-full py-6 text-lg font-bold shadow-lg shadow-accent/20 relative overflow-hidden group"
                >
                  <div className="absolute top-0 right-0 bg-yellow-400 text-black text-[10px] px-2 py-0.5 font-black uppercase tracking-tighter rounded-bl-lg">
                    COST: 2 CREDITS
                  </div>
                  {uploading ? (
                    <><Loader2 className="animate-spin mr-2" /> Analyzing Data...</>
                  ) : user?.aiCredits < 2 ? (
                    <>Insufficient Credits</>
                  ) : (
                    <><Zap size={20} className="mr-2" /> Start AI Analysis</>
                  )}
                </Button>
              </form>

              <div className="mt-8 p-4 bg-blue-50/50 border border-blue-100 rounded-xl flex gap-3">
                 <Info size={18} className="text-blue-500 shrink-0" />
                 <p className="text-[10px] text-blue-800 leading-relaxed font-medium">
                   Our AI extracts technical skills, experience years, and industry keywords to match you with the best available roles.
                 </p>
              </div>
           </Card>
        </div>

        {/* Results Area (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
            {analysis ? (
              <>
                <Card className="p-6 border-none shadow-xl shadow-gray-200/50">
                  <h3 className="text-xl font-bold text-primary mb-6 flex items-center gap-2">
                    <Target size={20} className="text-accent" /> Analysis Results
                  </h3>
                  
                  <div className="grid grid-cols-3 gap-6 mb-8">
                     <div className="text-center">
                        <p className="text-xs font-bold text-secondary uppercase tracking-wider mb-1">ATS Score</p>
                        <p className="text-3xl font-black text-accent">{analysis.score}%</p>
                     </div>
                     <div className="text-center">
                        <p className="text-xs font-bold text-secondary uppercase tracking-wider mb-1">Skills Found</p>
                        <p className="text-3xl font-black text-primary">{analysis.skills?.length || 0}</p>
                     </div>
                     <div className="text-center">
                        <p className="text-xs font-bold text-secondary uppercase tracking-wider mb-1">Format</p>
                        <p className="text-3xl font-black text-green-500 flex items-center justify-center gap-1"><CheckCircle2 size={24} /> OK</p>
                     </div>
                  </div>

                  <div className="space-y-6">
                    <div>
                      <h4 className="text-sm font-bold text-primary mb-3 flex items-center gap-2">
                        <BrainCircuit size={16} className="text-accent" /> Extracted Skills
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {analysis.skills?.length ? analysis.skills.map(skill => (
                          <span key={skill} className="bg-gray-100 text-primary px-3 py-1 rounded-lg text-xs font-bold border border-border">
                            {skill}
                          </span>
                        )) : (
                          <p className="text-sm text-secondary">No clear skills were detected from this resume yet.</p>
                        )}
                      </div>
                    </div>

                    <div>
                      <h4 className="text-sm font-bold text-primary mb-3 flex items-center gap-2">
                        <TrendingUp size={16} className="text-accent" /> Career Insights
                      </h4>
                      <div className="space-y-3">
                        {analysis.fallback ? (
                          <p className="text-xs font-semibold text-amber-700 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
                            Live Gemini analysis was temporarily unavailable, so these results were generated from resume content using a local fallback analyzer.
                          </p>
                        ) : null}
                        <div className="bg-gray-50 p-4 rounded-xl">
                          {analysis.suggestions?.length ? (
                            <div className="space-y-2">
                              {analysis.suggestions.map((suggestion, index) => (
                                <p key={`${index}-${suggestion}`} className="text-sm text-secondary leading-relaxed italic">
                                  {suggestion}
                                </p>
                              ))}
                            </div>
                          ) : (
                            <p className="text-sm text-secondary leading-relaxed italic">
                              Your resume analysis is ready. Add more project impact, technical depth, and measurable outcomes to improve ATS performance.
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              </>
            ) : (
              <Card className="p-20 text-center border-dashed border-2 flex flex-col items-center justify-center h-full">
                 <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center text-gray-200 mb-6 border border-border">
                   <Zap size={32} />
                 </div>
                 <h3 className="text-lg font-bold text-primary">No record found</h3>
                 <p className="text-sm text-secondary mt-1">Upload your resume on the left to begin the AI journey.</p>
              </Card>
            )}
        </div>
      </div>
    </div>
  );
}
