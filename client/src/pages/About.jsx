import { Card } from '../components/ui/card';

export default function About() {
  return (
    <div className="max-w-5xl mx-auto px-6 py-12 space-y-8">
      <div className="space-y-3">
        <h1 className="text-4xl font-black text-primary">About VertexJob</h1>
        <p className="text-secondary text-lg max-w-3xl">
          VertexJob helps students and recruiters connect faster with AI-assisted profile analysis, job discovery, and smarter hiring workflows.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <Card className="p-6">
          <h2 className="text-xl font-bold text-primary mb-2">For Students</h2>
          <p className="text-secondary">Build a stronger profile, analyze resumes, discover better-fit roles, and track applications in one place.</p>
        </Card>
        <Card className="p-6">
          <h2 className="text-xl font-bold text-primary mb-2">For Recruiters</h2>
          <p className="text-secondary">Post jobs, review applicants, compare skills, and manage hiring pipelines with less manual effort.</p>
        </Card>
        <Card className="p-6">
          <h2 className="text-xl font-bold text-primary mb-2">Our Focus</h2>
          <p className="text-secondary">Practical tools, cleaner matching, and a better experience for both applicants and employers.</p>
        </Card>
      </div>
    </div>
  );
}
