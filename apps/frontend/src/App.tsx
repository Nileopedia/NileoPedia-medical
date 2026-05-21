import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from './context/ThemeContext';
import { AppLayout } from './components/layout/AppLayout';
import { Dashboard } from './pages/Dashboard';
import { Register } from './pages/Register';
import { AskQuestion } from './pages/AskQuestion';
import { QueryHistory } from './pages/QueryHistory';
import { SavedResponses } from './pages/SavedResponses';
import { Analytics } from './pages/Analytics';
import { Reports } from './pages/Reports';
import { UserManagement } from './pages/UserManagement';
import { SystemHealth } from './pages/SystemHealth';
import { Settings } from './pages/Settings';
import { Profile } from './pages/Profile';
import { ValidatorQueue } from './pages/validator/ValidatorQueue';
import { ReviewWorkspace } from './pages/validator/ReviewWorkspace';
import { ValidatorHistoryPage } from './pages/validator/ValidatorHistoryPage';
import { FeedbackReports } from './pages/validator/FeedbackReports';
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { ValidatorManagement } from './pages/admin/ValidatorManagement';
import { CreateValidator } from './pages/admin/CreateValidator';
import { AIActivity } from './pages/admin/AIActivity';
import { SystemLogs } from './pages/admin/SystemLogs';
import { PlatformSettings } from './pages/admin/PlatformSettings';
// Public Pages
import { LandingPage } from './pages/public/LandingPage';
import { PublicLogin } from './pages/public/PublicLogin';
import { RoleSelection } from './pages/public/RoleSelection';
import { ForgotPassword } from './pages/public/ForgotPassword';
import { PublicOtpVerify } from './pages/public/PublicOtpVerify';

const queryClient = new QueryClient();

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return <>{children}</>;
};

export const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <BrowserRouter>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<PublicLogin />} />
            <Route path="/register" element={<Register />} />
            <Route path="/role-select" element={<RoleSelection />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/otp-verify" element={<PublicOtpVerify />} />
            
            {/* Protected App Routes */}
            <Route path="/app" element={<ProtectedRoute><AppLayout><Dashboard /></AppLayout></ProtectedRoute>} />
            <Route path="/app/ask" element={<ProtectedRoute><AppLayout><AskQuestion /></AppLayout></ProtectedRoute>} />
            <Route path="/app/history" element={<ProtectedRoute><AppLayout><QueryHistory /></AppLayout></ProtectedRoute>} />
            <Route path="/app/saved" element={<ProtectedRoute><AppLayout><SavedResponses /></AppLayout></ProtectedRoute>} />
            <Route path="/app/profile" element={<ProtectedRoute><AppLayout><Profile /></AppLayout></ProtectedRoute>} />
            <Route path="/app/settings" element={<ProtectedRoute><AppLayout><Settings /></AppLayout></ProtectedRoute>} />
            <Route path="/app/analytics" element={<ProtectedRoute><AppLayout><Analytics /></AppLayout></ProtectedRoute>} />
            <Route path="/app/reports" element={<ProtectedRoute><AppLayout><Reports /></AppLayout></ProtectedRoute>} />
            
            {/* Validator Routes */}
            <Route path="/app/validator" element={<ProtectedRoute><AppLayout><ValidatorQueue /></AppLayout></ProtectedRoute>} />
            <Route path="/app/validator/review/:id" element={<ProtectedRoute><ReviewWorkspace /></ProtectedRoute>} />
            <Route path="/app/validator/history" element={<ProtectedRoute><AppLayout><ValidatorHistoryPage /></AppLayout></ProtectedRoute>} />
            <Route path="/app/validator/feedback" element={<ProtectedRoute><AppLayout><FeedbackReports /></AppLayout></ProtectedRoute>} />
            <Route path="/app/validator/approved" element={<ProtectedRoute><AppLayout><ValidatorHistoryPage /></AppLayout></ProtectedRoute>} />
            <Route path="/app/validator/rejected" element={<ProtectedRoute><AppLayout><ValidatorHistoryPage /></AppLayout></ProtectedRoute>} />
            
            {/* Admin Routes */}
            <Route path="/app/admin" element={<ProtectedRoute><AppLayout><AdminDashboard /></AppLayout></ProtectedRoute>} />
            <Route path="/app/admin/users" element={<ProtectedRoute><AppLayout><UserManagement /></AppLayout></ProtectedRoute>} />
            <Route path="/app/admin/validators" element={<ProtectedRoute><AppLayout><ValidatorManagement /></AppLayout></ProtectedRoute>} />
            <Route path="/app/admin/validators/create" element={<ProtectedRoute><AppLayout><CreateValidator /></AppLayout></ProtectedRoute>} />
            <Route path="/app/admin/analytics" element={<ProtectedRoute><AppLayout><Analytics /></AppLayout></ProtectedRoute>} />
            <Route path="/app/admin/system" element={<ProtectedRoute><AppLayout><SystemHealth /></AppLayout></ProtectedRoute>} />
            <Route path="/app/admin/ai-activity" element={<ProtectedRoute><AppLayout><AIActivity /></AppLayout></ProtectedRoute>} />
            <Route path="/app/admin/logs" element={<ProtectedRoute><AppLayout><SystemLogs /></AppLayout></ProtectedRoute>} />
            <Route path="/app/admin/settings" element={<ProtectedRoute><AppLayout><PlatformSettings /></AppLayout></ProtectedRoute>} />
            
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default App;
