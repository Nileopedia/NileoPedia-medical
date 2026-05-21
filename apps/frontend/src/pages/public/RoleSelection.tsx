import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BookOpen, User, Shield, Settings, HelpCircle, Lock } from 'lucide-react';
import { useAppStore } from '../../store/appStore';

export const RoleSelection: React.FC = () => {
  const navigate = useNavigate();
  const { setUser } = useAppStore();

  const handleRoleSelect = (role: 'user' | 'validator' | 'admin') => {
    setUser({
      id: '1',
      name: 'Dr. Sarah Johnson',
      email: 'sarah@nileopedia.com',
      role,
      title: role === 'admin' ? 'Administrator' : role === 'validator' ? 'Medical Validator' : 'Medical User',
    });
    navigate('/app');
  };

  const roles = [
    {
      id: 'user',
      icon: <User size={32} className="text-blue-600" />,
      title: 'Medical User',
      description: 'Ask medical questions and get evidence-based answers.',
      cta: 'Continue as User',
      highlighted: false,
    },
    {
      id: 'validator',
      icon: <Shield size={32} className="text-blue-600" />,
      title: 'Validator',
      description: 'Review and validate AI-generated medical responses.',
      cta: 'Continue as Validator',
      highlighted: true,
    },
    {
      id: 'admin',
      icon: <Settings size={32} className="text-blue-600" />,
      title: 'Administrator',
      description: 'Manage users, validators and system settings.',
      cta: 'Continue as Admin',
      highlighted: false,
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Navbar */}
      <nav className="border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <BookOpen size={18} className="text-white" />
            </div>
            <span className="text-xl font-bold text-slate-900">NileoPedia</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <span>Need help?</span>
            <button className="p-1 hover:text-slate-700">
              <HelpCircle size={18} />
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-5xl mx-auto px-6 py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h1 className="text-3xl font-bold text-slate-900 mb-3">Choose Your Role</h1>
          <p className="text-slate-500 text-lg">Select the role that best describes you to continue</p>
        </motion.div>

        <motion.div
          initial="initial"
          animate="animate"
          variants={{
            animate: {
              transition: {
                staggerChildren: 0.1,
              },
            },
          }}
          className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto"
        >
          {roles.map((role, index) => (
            <motion.div
              key={role.id}
              variants={{
                initial: { opacity: 0, y: 20 },
                animate: { opacity: 1, y: 0 },
              }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className={`relative bg-white rounded-2xl p-8 border-2 transition-all hover:shadow-lg ${
                role.highlighted
                  ? 'border-blue-500 shadow-md shadow-blue-100'
                  : 'border-slate-200 hover:border-blue-300'
              }`}
            >
              {role.highlighted && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-blue-600 text-white text-xs font-medium rounded-full">
                  Protected Role
                </div>
              )}
              <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-6">
                {role.icon}
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-3 text-center">{role.title}</h3>
              <p className="text-sm text-slate-500 mb-8 text-center leading-relaxed">{role.description}</p>
              <button
                onClick={() => handleRoleSelect(role.id as 'user' | 'validator' | 'admin')}
                className={`w-full py-3 font-medium rounded-lg transition-all ${
                  role.highlighted
                    ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-md shadow-blue-200'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                {role.cta}
              </button>
            </motion.div>
          ))}
        </motion.div>

        {/* Bottom Security Notice */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="text-center mt-16"
        >
          <div className="inline-flex items-center gap-2 text-slate-600 mb-2">
            <Lock size={16} />
            <span className="font-medium">Secure. Private. Trusted.</span>
          </div>
          <p className="text-sm text-slate-400">
            We follow strict data protection and privacy standards.
          </p>
        </motion.div>
      </div>
    </div>
  );
};
