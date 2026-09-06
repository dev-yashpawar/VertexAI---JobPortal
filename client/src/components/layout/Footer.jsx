import { Link } from 'react-router-dom';
import { Activity, Users, Globe } from 'lucide-react';
import BrandLogo from '../brand/BrandLogo';

export default function Footer() {
  return (
    <footer className="bg-white border-t border-border mt-20">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="max-w-xs">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <BrandLogo
                logoClassName="h-9 w-auto"
                nameClassName="font-bold text-xl text-primary tracking-tight"
              />
            </Link>
            <p className="text-secondary text-sm leading-relaxed">
              Empowering students and recruiters with AI-driven matching and smart talent acquisition tools.
            </p>
          </div>

          <div className="flex gap-12 font-medium">
            <div className="flex flex-col gap-3">
              <span className="text-primary font-bold mb-2">Platform</span>
              <Link to="/jobs" className="text-secondary hover:text-accent transition">Explore Jobs</Link>
              <a href="/#features" className="text-secondary hover:text-accent transition">Features</a>
              <a href="/#pricing" className="text-secondary hover:text-accent transition">Pricing</a>
            </div>
            <div className="flex flex-col gap-3">
              <span className="text-primary font-bold mb-2">Company</span>
              <Link to="/about" className="text-secondary hover:text-accent transition">About Us</Link>
              <Link to="/contact" className="text-secondary hover:text-accent transition">Contact</Link>
              <Link to="/privacy" className="text-secondary hover:text-accent transition">Privacy Policy</Link>
            </div>
          </div>
        </div>

        <div className="flex flex-col md:flex-row justify-between items-center mt-12 pt-8 border-t border-border gap-4">
          <p className="text-secondary text-sm">&copy; {new Date().getFullYear()} VertexJob. All rights reserved.</p>
          <div className="flex gap-4">
            <Link to="/contact" className="text-secondary hover:text-primary transition"><Activity size={20} /></Link>
            <Link to="/about" className="text-secondary hover:text-primary transition"><Users size={20} /></Link>
            <Link to="/privacy" className="text-secondary hover:text-primary transition"><Globe size={20} /></Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
