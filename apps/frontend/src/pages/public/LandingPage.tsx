import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Search,
  Shield,
  FileText,
  Lock,
  Brain,
  Users,
  ChevronRight,
  BookOpen,
  Activity,
} from 'lucide-react';

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6 },
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};

export const LandingPage: React.FC = () => {
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
          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm text-slate-600 hover:text-slate-900 transition-colors">Features</a>
            <a href="#institutions" className="text-sm text-slate-600 hover:text-slate-900 transition-colors">For Institutions</a>
            <a href="#about" className="text-sm text-slate-600 hover:text-slate-900 transition-colors">About</a>
            <a href="#contact" className="text-sm text-slate-600 hover:text-slate-900 transition-colors">Contact</a>
          </div>
          <Link
            to="/login"
            className="px-5 py-2 text-sm font-medium text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
          >
            Login
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 rounded-full mb-6">
                <Brain size={14} className="text-blue-600" />
                <span className="text-sm text-blue-700 font-medium">AI-Powered • Evidence-Based • Trusted by Medical Professionals</span>
              </div>
              <h1 className="text-5xl lg:text-6xl font-bold text-slate-900 leading-tight mb-6">
                Evidence-Based Medical Answers{' '}
                <span className="text-blue-600">Powered by AI</span>
              </h1>
              <p className="text-lg text-slate-600 mb-8 leading-relaxed max-w-xl">
                NileoPedia combines advanced AI with trusted medical sources to deliver accurate, validated, and up-to-date medical information.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link
                  to="/login"
                  className="px-8 py-3.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/25 hover:shadow-blue-600/40"
                >
                  Get Started
                </Link>
                <a
                  href="#features"
                  className="px-8 py-3.5 bg-white text-slate-700 font-medium rounded-lg border border-slate-300 hover:bg-slate-50 transition-all"
                >
                  Learn More
                </a>
              </div>
            </motion.div>

            {/* AI Medical Illustration */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative"
            >
              <div className="relative w-full aspect-square max-w-lg mx-auto">
                {/* Background glow */}
                <div className="absolute inset-0 bg-gradient-to-br from-blue-100/50 to-blue-50/30 rounded-full blur-3xl" />
                
                {/* Central human figure */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="relative">
                    <div className="w-64 h-80 bg-gradient-to-b from-blue-200/40 to-blue-100/20 rounded-3xl backdrop-blur-sm border border-blue-200/50 flex items-center justify-center">
                      <div className="text-center">
                        <div className="w-32 h-48 mx-auto mb-4 relative">
                          {/* Human body outline */}
                          <svg viewBox="0 0 120 200" className="w-full h-full">
                            <path
                              d="M60 20 C70 20 75 30 75 40 C75 50 70 55 65 60 L75 80 L80 120 L75 180 L65 180 L60 140 L55 180 L45 180 L40 120 L45 80 L55 60 C50 55 45 50 45 40 C45 30 50 20 60 20Z"
                              fill="none"
                              stroke="#2563EB"
                              strokeWidth="1.5"
                              opacity="0.6"
                            />
                            {/* Heart */}
                            <path
                              d="M60 70 C65 65 72 65 72 72 C72 78 60 85 60 85 C60 85 48 78 48 72 C48 65 55 65 60 70Z"
                              fill="#EF4444"
                              opacity="0.8"
                            />
                            {/* Brain */}
                            <circle cx="60" cy="35" r="12" fill="none" stroke="#2563EB" strokeWidth="1" opacity="0.5" />
                            <path d="M52 35 Q60 28 68 35 Q60 42 52 35" fill="none" stroke="#2563EB" strokeWidth="1" opacity="0.5" />
                          </svg>
                        </div>
                      </div>
                    </div>
                    {/* Glowing base */}
                    <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-48 h-8 bg-blue-400/30 rounded-full blur-xl" />
                    <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-32 h-4 bg-blue-500/40 rounded-full blur-lg" />
                  </div>
                </div>

                {/* Floating cards */}
                <motion.div
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                  className="absolute top-8 left-0 bg-white rounded-xl shadow-lg border border-slate-200 p-3"
                >
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                      <Activity size={16} className="text-red-600" />
                    </div>
                    <div>
                      <p className="text-xs font-medium text-slate-900">Cardiology</p>
                      <p className="text-[10px] text-slate-500">98% accuracy</p>
                    </div>
                  </div>
                </motion.div>

                <motion.div
                  animate={{ y: [0, 10, 0] }}
                  transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
                  className="absolute top-16 right-0 bg-white rounded-xl shadow-lg border border-slate-200 p-3"
                >
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                      <FileText size={16} className="text-blue-600" />
                    </div>
                    <div>
                      <p className="text-xs font-medium text-slate-900">Research</p>
                      <p className="text-[10px] text-slate-500">50K+ sources</p>
                    </div>
                  </div>
                </motion.div>

                <motion.div
                  animate={{ y: [0, -8, 0] }}
                  transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
                  className="absolute bottom-20 left-0 bg-white rounded-xl shadow-lg border border-slate-200 p-3"
                >
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center">
                      <Shield size={16} className="text-emerald-600" />
                    </div>
                    <div>
                      <p className="text-xs font-medium text-slate-900">Validated</p>
                      <p className="text-[10px] text-slate-500">Expert reviewed</p>
                    </div>
                  </div>
                </motion.div>

                <motion.div
                  animate={{ y: [0, 12, 0] }}
                  transition={{ duration: 3.8, repeat: Infinity, ease: 'easeInOut', delay: 1.5 }}
                  className="absolute bottom-16 right-4 bg-white rounded-xl shadow-lg border border-slate-200 p-3"
                >
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                      <Brain size={16} className="text-purple-600" />
                    </div>
                    <div>
                      <p className="text-xs font-medium text-slate-900">AI Model</p>
                      <p className="text-[10px] text-slate-500">GPT-4o + RAG</p>
                    </div>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Feature Cards */}
      <section id="features" className="py-20 px-6 bg-slate-50">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="grid md:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {[
              {
                icon: <Search size={24} className="text-blue-600" />,
                title: 'AI-Powered Search',
                description: 'Get accurate answers from millions of medical sources',
                bgIcon: 'bg-blue-100',
              },
              {
                icon: <FileText size={24} className="text-emerald-600" />,
                title: 'Evidence-Based',
                description: 'Citations from peer-reviewed journals and guidelines',
                bgIcon: 'bg-emerald-100',
              },
              {
                icon: <Users size={24} className="text-purple-600" />,
                title: 'Expert Validated',
                description: 'Reviewed by medical professionals',
                bgIcon: 'bg-purple-100',
              },
              {
                icon: <Lock size={24} className="text-amber-600" />,
                title: 'Secure & Reliable',
                description: 'Your data is protected with enterprise-grade security',
                bgIcon: 'bg-amber-100',
              },
            ].map((feature, index) => (
              <motion.div
                key={index}
                variants={fadeInUp}
                className="bg-white rounded-2xl p-6 border border-slate-200 hover:shadow-lg hover:border-blue-200 transition-all group"
              >
                <div className={`w-12 h-12 ${feature.bgIcon} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  {feature.icon}
                </div>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">{feature.title}</h3>
                <p className="text-sm text-slate-600">{feature.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Evidence Section */}
      <section className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-6">
                Built on Trust, Powered by Evidence
              </h2>
              <p className="text-lg text-slate-600 mb-8 leading-relaxed">
                Every response on NileoPedia is backed by peer-reviewed research, clinical guidelines, and expert validation. Our AI doesn't just generate answers—it finds, cites, and validates them.
              </p>
              <ul className="space-y-4">
                {[
                  'Sourced from 50,000+ medical journals and guidelines',
                  'Validated by board-certified medical professionals',
                  'Updated continuously with latest research',
                  'Transparent citation system for every claim',
                ].map((item, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <ChevronRight size={14} className="text-blue-600" />
                    </div>
                    <span className="text-slate-700">{item}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="bg-gradient-to-br from-blue-50 to-slate-50 rounded-3xl p-8 border border-blue-100"
            >
              <div className="space-y-4">
                {[
                  { source: 'ADA 2024', type: 'Guideline', title: 'Standards of Care in Diabetes' },
                  { source: 'NEJM 2023', type: 'Journal', title: 'Cardiovascular Outcomes in Type 2 Diabetes' },
                  { source: 'WHO 2024', type: 'Guideline', title: 'Global Hypertension Guidelines' },
                ].map((item, index) => (
                  <div key={index} className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-medium rounded">
                        {item.type}
                      </span>
                      <span className="text-xs text-slate-500">{item.source}</span>
                    </div>
                    <p className="text-sm font-medium text-slate-900">{item.title}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6 bg-slate-900">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl lg:text-4xl font-bold text-white mb-6">
              Ready to Transform Medical Knowledge Access?
            </h2>
            <p className="text-lg text-slate-400 mb-8 max-w-2xl mx-auto">
              Join thousands of medical professionals who trust NileoPedia for evidence-based clinical decision support.
            </p>
            <Link
              to="/login"
              className="inline-flex items-center gap-2 px-8 py-4 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/25"
            >
              Get Started Now
              <ChevronRight size={18} />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-slate-200">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <BookOpen size={18} className="text-white" />
                </div>
                <span className="text-lg font-bold text-slate-900">NileoPedia</span>
              </div>
              <p className="text-sm text-slate-600">
                Evidence-based medical answers powered by AI.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-slate-900 mb-4">Product</h4>
              <ul className="space-y-2 text-sm text-slate-600">
                <li><a href="#features" className="hover:text-slate-900">Features</a></li>
                <li><a href="#" className="hover:text-slate-900">Pricing</a></li>
                <li><a href="#" className="hover:text-slate-900">API</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-slate-900 mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-slate-600">
                <li><a href="#about" className="hover:text-slate-900">About</a></li>
                <li><a href="#contact" className="hover:text-slate-900">Contact</a></li>
                <li><a href="#" className="hover:text-slate-900">Careers</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-slate-900 mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-slate-600">
                <li><a href="#" className="hover:text-slate-900">Privacy</a></li>
                <li><a href="#" className="hover:text-slate-900">Terms</a></li>
                <li><a href="#" className="hover:text-slate-900">Security</a></li>
              </ul>
            </div>
          </div>
          <div className="pt-8 border-t border-slate-200 text-center text-sm text-slate-500">
            © 2025 NileoPedia. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};
