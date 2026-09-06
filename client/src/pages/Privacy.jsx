import { Card } from '../components/ui/card';

export default function Privacy() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-12 space-y-8">
      <div className="space-y-3">
        <h1 className="text-4xl font-black text-primary">Privacy Policy</h1>
        <p className="text-secondary text-lg">
          We collect only the information needed to provide job matching, account access, resume analysis, and recruiting workflows.
        </p>
      </div>

      <Card className="p-6 space-y-4">
        <div>
          <h2 className="text-lg font-bold text-primary mb-2">What We Store</h2>
          <p className="text-secondary">Profile details, resume uploads, applications, saved jobs, and platform activity needed for core product features.</p>
        </div>
        <div>
          <h2 className="text-lg font-bold text-primary mb-2">How We Use It</h2>
          <p className="text-secondary">To support authentication, personalized recommendations, application tracking, recruiter workflows, and support requests.</p>
        </div>
        <div>
          <h2 className="text-lg font-bold text-primary mb-2">Contact</h2>
          <p className="text-secondary">For privacy-related questions, contact <span className="font-semibold text-primary">vertexjob.company.pvt@gmail.com</span>.</p>
        </div>
      </Card>
    </div>
  );
}
