import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { mockResponse, mockReviewQueue } from '../../data/mockData';
import { ChevronRight, Check, X, Shield, Users, FileText, Target, Bot, Clock } from 'lucide-react';

export const ReviewWorkspace: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [feedback, setFeedback] = useState('');
  const [score, setScore] = useState(90);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const item = mockReviewQueue.find((q) => q.id === id) || mockReviewQueue[0];

  const handleAction = (_action: 'approve' | 'reject') => {
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      navigate('/validator');
    }, 1000);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] -mx-6 -mb-6 bg-slate-50">
      {/* Top Bar */}
      <div className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
        <div>
          <nav className="flex items-center gap-2 text-sm mb-2">
            <Link to="/validator" className="text-blue-600 hover:text-blue-700 font-medium">Pending Reviews</Link>
            <ChevronRight size={14} className="text-slate-400" />
            <span className="text-slate-500">Review Workspace</span>
          </nav>
          <h1 className="text-xl font-bold text-slate-900">{item.title}</h1>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="warning">Pending Review</Badge>
          <Badge variant="outline">Due: {item.dueDate}</Badge>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-6 p-6 overflow-y-auto bg-slate-50">
        {/* LEFT: AI Response */}
        <div className="space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="flex items-center gap-2">
                <Bot size={20} className="text-blue-600" />
                AI Generated Response
              </CardTitle>
              <div className="flex items-center gap-2 text-sm text-slate-500">
                <Clock size={14} />
                {mockResponse.generatedAt}
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="text-sm font-semibold text-slate-900 mb-2 flex items-center gap-2">
                  <Target size={16} className="text-blue-600" /> Summary
                </h3>
                <p className="text-sm text-slate-700 leading-relaxed">{mockResponse.summary}</p>
                <ol className="list-decimal list-inside space-y-2 text-sm text-slate-700 mt-3 ml-2">
                  {mockResponse.keyFindings.map((finding, index) => (
                    <li key={index} className="leading-relaxed">{finding}</li>
                  ))}
                </ol>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-slate-900 mb-2 flex items-center gap-2">
                  <FileText size={16} className="text-blue-600" /> Detailed Explanation
                </h3>
                <div className="text-sm text-slate-700 leading-relaxed whitespace-pre-line bg-slate-50 p-4 rounded-lg border border-slate-100">
                  {mockResponse.detailedExplanation}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* RIGHT: Citations & Validation Tools */}
        <div className="space-y-6">
          {/* Citations */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Evidence & Citations ({mockResponse.citations.length})</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {mockResponse.citations.map((citation, index) => (
                <div key={citation.id} className="p-3 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
                  <div className="flex items-start gap-3">
                    <span className="flex-shrink-0 w-6 h-6 bg-slate-100 rounded-full flex items-center justify-center text-xs font-medium text-slate-600">
                      {index + 1}
                    </span>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs font-semibold text-slate-900 mb-1 line-clamp-2">{citation.title}</h4>
                      <p className="text-[10px] text-slate-500 mb-2">
                        {citation.journal}, {citation.year}
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        <Badge variant="info" className="text-[10px] px-1.5 py-0">{citation.type}</Badge>
                        {citation.organization && <Badge variant="outline" className="text-[10px] px-1.5 py-0">{citation.organization}</Badge>}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Validation Tools */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Shield size={18} className="text-emerald-600" />
                Validation Tools
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Evidence Confidence */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-slate-700">Evidence Confidence Score</span>
                  <span className="text-lg font-bold text-emerald-600">{mockResponse.confidenceScore}%</span>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full transition-all duration-500" style={{ width: `${mockResponse.confidenceScore}%` }} />
                </div>
              </div>

              {/* Multiple Validators */}
              <div>
                <h4 className="text-sm font-medium text-slate-700 mb-3 flex items-center gap-2">
                  <Users size={16} /> Multiple Validators
                </h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-emerald-50 border border-emerald-100 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-emerald-200 rounded-full flex items-center justify-center text-xs font-bold text-emerald-700">SJ</div>
                      <div>
                        <p className="text-sm font-medium text-slate-900">Dr. Sarah Johnson</p>
                        <p className="text-xs text-slate-500">Validator A</p>
                      </div>
                    </div>
                    <Badge variant="success">Approved</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-amber-50 border border-amber-100 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-amber-200 rounded-full flex items-center justify-center text-xs font-bold text-amber-700">MC</div>
                      <div>
                        <p className="text-sm font-medium text-slate-900">Dr. Michael Chen</p>
                        <p className="text-xs text-slate-500">Validator B (You)</p>
                      </div>
                    </div>
                    <Badge variant="warning">Pending</Badge>
                  </div>
                  <div className="p-3 bg-blue-50 border border-blue-100 rounded-lg text-center">
                    <p className="text-xs text-blue-700 font-medium">Waiting for Validator B to complete review for Final Approval.</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* BOTTOM: Action Bar */}
      <div className="fixed bottom-0 left-64 right-0 bg-white border-t border-slate-200 p-4 px-6 flex flex-col sm:flex-row items-center justify-between gap-4 z-20 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
        <div className="flex items-center gap-6 w-full sm:w-auto">
          <div className="flex-1 sm:flex-none">
            <label className="block text-xs font-medium text-slate-600 mb-1">Your Validation Score (0-100)</label>
            <div className="flex items-center gap-3">
              <input 
                type="range" 
                min="0" 
                max="100" 
                value={score} 
                onChange={(e) => setScore(Number(e.target.value))}
                className="w-32 h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
              <span className="text-lg font-bold text-slate-900 w-8">{score}</span>
            </div>
          </div>
          <div className="flex-1 sm:w-64">
            <label className="block text-xs font-medium text-slate-600 mb-1">Medical Feedback</label>
            <textarea
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              rows={1}
              placeholder="Add clinical feedback or corrections..."
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
            />
          </div>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
          <Button variant="danger" className="gap-2 flex-1 sm:flex-none" onClick={() => handleAction('reject')} disabled={isSubmitting}>
            <X size={16} />
            Reject
          </Button>
          <Button className="gap-2 bg-emerald-600 hover:bg-emerald-700 flex-1 sm:flex-none" onClick={() => handleAction('approve')} disabled={isSubmitting}>
            <Check size={16} />
            Approve
          </Button>
        </div>
      </div>
    </div>
  );
};
