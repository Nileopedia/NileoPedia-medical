import Link from 'next/link';
import { BookOpen, Search, FileText, Lock, Users } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 bg-white/80 backdrop-blur-md border-b border-slate-200 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <BookOpen size={18} className="text-white" />
            </div>
            <span className="text-xl font-bold text-slate-900">NileoPedia</span>
          </div>
          <Link
            href="/login"
            className="px-5 py-2 text-sm font-medium text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
          >
            Login
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="max-w-xl">
            <h1 className="text-5xl lg:text-6xl font-bold text-slate-900 leading-tight mb-6">
              Evidence-Based Medical Answers{' '}
              <span className="text-blue-600">Powered by AI</span>
            </h1>
            <p className="text-lg text-slate-600 mb-8 leading-relaxed">
              NileoPedia combines advanced AI with trusted medical sources to deliver accurate, validated, and up-to-date medical information.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link
                href="/login"
                className="px-8 py-3.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/25"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Cards */}
      <section id="features" className="py-20 px-6 bg-slate-50">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: <Search size={24} className="text-blue-600" />, title: 'AI-Powered Search', description: 'Get accurate answers from millions of medical sources', bgIcon: 'bg-blue-100' },
              { icon: <FileText size={24} className="text-emerald-600" />, title: 'Evidence-Based', description: 'Citations from peer-reviewed journals', bgIcon: 'bg-emerald-100' },
              { icon: <Users size={24} className="text-purple-600" />, title: 'Expert Validated', description: 'Reviewed by medical professionals', bgIcon: 'bg-purple-100' },
              { icon: <Lock size={24} className="text-amber-600" />, title: 'Secure & Reliable', description: 'Your data is protected', bgIcon: 'bg-amber-100' },
            ].map((feature, index) => (
              <div key={index} className="bg-white rounded-2xl p-6 border border-slate-200">
                <div className={`w-12 h-12 ${feature.bgIcon} rounded-xl flex items-center justify-center mb-4`}>
                  {feature.icon}
                </div>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">{feature.title}</h3>
                <p className="text-sm text-slate-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-slate-200">
        <div className="max-w-7xl mx-auto text-center text-sm text-slate-500">
          © 2025 NileoPedia. All rights reserved.
        </div>
      </footer>
    </div>
  );
}