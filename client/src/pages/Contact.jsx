import { useState } from 'react';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import api from '../lib/api';

const CONTACT_EMAIL = 'vertexjob.company.pvt@gmail.com';

export default function Contact() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    type: 'feedback',
    subject: '',
    message: '',
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const handleChange = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccess('');
    setError('');

    try {
      const res = await api.post('/contact/feedback', form);
      setSuccess(res.data?.message || 'Feedback sent successfully.');
      setForm({
        name: '',
        email: '',
        type: 'feedback',
        subject: '',
        message: '',
      });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send feedback.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-6 py-12 grid lg:grid-cols-2 gap-8">
      <div className="space-y-5">
        <h1 className="text-4xl font-black text-primary">Contact Us</h1>
        <p className="text-secondary text-lg">
          Send support requests, partnership questions, bug reports, or product feedback directly from this page.
        </p>
        <Card className="p-6 space-y-4">
          <div>
            <p className="text-sm uppercase tracking-wider font-bold text-secondary">Contact Email</p>
            <p className="text-xl font-bold text-primary">{CONTACT_EMAIL}</p>
          </div>
          <div>
            <p className="text-sm uppercase tracking-wider font-bold text-secondary">Feedback Form</p>
            <p className="text-secondary">Use the form to send feature requests, issues, or general feedback to our team.</p>
          </div>
        </Card>
      </div>

      <Card className="p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <h2 className="text-2xl font-bold text-primary">Feedback Form</h2>
          {success ? <div className="bg-green-50 border border-green-200 text-green-700 rounded-lg p-3 text-sm">{success}</div> : null}
          {error ? <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-3 text-sm">{error}</div> : null}

          <Input placeholder="Your name" value={form.name} onChange={handleChange('name')} required />
          <Input type="email" placeholder="Your email" value={form.email} onChange={handleChange('email')} required />
          <select
            value={form.type}
            onChange={handleChange('type')}
            className="w-full h-10 rounded-lg border border-border px-3 bg-white text-primary"
          >
            <option value="feedback">Feedback</option>
            <option value="support">Support</option>
            <option value="bug-report">Bug Report</option>
            <option value="business">Business Inquiry</option>
          </select>
          <Input placeholder="Subject" value={form.subject} onChange={handleChange('subject')} required />
          <textarea
            value={form.message}
            onChange={handleChange('message')}
            placeholder="Write your message here..."
            rows={7}
            className="w-full rounded-lg border border-border px-3 py-3 bg-white text-primary"
            required
          />

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Sending...' : 'Send Feedback'}
          </Button>
        </form>
      </Card>
    </div>
  );
}
