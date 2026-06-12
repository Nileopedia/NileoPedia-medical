'use client';

import React, { useState, useEffect, useRef } from 'react';
import { TextArea } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Send, Loader2, Stethoscope } from 'lucide-react';
import { AppLayout } from '../../components/layout/AppLayout';
import { api } from '../../lib/api';
import { AIResponse } from '../../types';
import { ResponseViewer } from '../../components/query/ResponseViewer';
import { io, type Socket } from 'socket.io-client';
import { useAppStore } from '../../store/appStore';
import { useToast } from '../../components/ui/Toast';

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3001';

export default function AskPage() {
  const [question, setQuestion] = useState('');
  const [specialty, setSpecialty] = useState<string>('general');
  const [loading, setLoading] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [response, setResponse] = useState<AIResponse | null>(null);
  const [partialFindings, setPartialFindings] = useState<string[]>([]);
  const [streamingVisible, setStreamingVisible] = useState<boolean[]>([]);
  const [progress, setProgress] = useState(0);
  const [socketConnected, setSocketConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [questionId, setQuestionId] = useState<string | null>(null);
  const user = useAppStore((state) => state.user);
  const { addToast } = useToast();

  useEffect(() => {
    if (!questionId) return;

    // Poll for response since worker runs in separate process
    let pollInterval: NodeJS.Timeout;
    let attempts = 0;
    const maxAttempts = 60;

    const pollForResponse = async () => {
      try {
        const data = await api.getQuestion(questionId);
        
        if (data.aiResponse) {
          setResponse(data.aiResponse);
          setProcessing(false);
          setProgress(100);
          setPartialFindings(data.aiResponse.keyFindings || []);
          setStreamingVisible((data.aiResponse.keyFindings || []).map(() => true));
          clearInterval(pollInterval);
        } else if (attempts < maxAttempts) {
          attempts++;
          setProcessing(true);
          setProgress(Math.min(90, attempts * 15));
        }
      } catch {
        if (attempts < maxAttempts) {
          attempts++;
          setProgress(Math.min(90, attempts * 15));
        }
      }
    };

    // Start polling immediately
    setProcessing(true);
    setProgress(5);
    pollForResponse();
    pollInterval = setInterval(pollForResponse, 1500);

    // Also try socket for real-time updates (will only work if in same process)
    const socket: Socket = io(SOCKET_URL, {
      transports: ['websocket'],
      reconnection: false,
    });

    socket.on('connect', () => {
      setSocketConnected(true);
    });

    socket.on('disconnect', () => {
      setSocketConnected(false);
    });

    socket.on('ai-status', (data: { status: string; message: string }) => {
      setProcessing(true);
    });

    socket.on('ai-key-findings', (data: { keyFindings: string[] }) => {
      setPartialFindings(data.keyFindings);
    });

    socket.on('ai-progress', (data: { progress: number }) => {
      setProgress(data.progress);
    });

    socket.on('ai-response-complete', () => {
      setProcessing(false);
      setProgress(100);
    });

    socket.on('ai-error', (data: { error: string }) => {
      setError(data.error);
      setProcessing(false);
      setLoading(false);
      addToast({ type: 'error', title: 'AI Processing Failed', message: data.error });
    });

    // Join the question room after a small delay to ensure question exists
    setTimeout(() => {
      socket.emit('stream-question', questionId);
    }, 100);

    return () => {
      clearInterval(pollInterval);
      socket.disconnect();
    };
  }, [questionId, user, addToast]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim()) return;

    setLoading(true);
    setError(null);
    setResponse(null);
    setPartialFindings([]);
    setQuestionId(null);

    try {
      const result = await api.askQuestion(question.trim(), specialty === 'general' ? undefined : specialty);
      setQuestionId(result.questionId);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit question');
      setLoading(false);
    }
  };

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-50">Ask AI</h1>
          <div className={`px-2 py-1 text-xs rounded-full ${
            socketConnected ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'
          }`}>
            {socketConnected ? 'Connected' : 'Disconnected'}
          </div>
        </div>
        <p className="text-slate-600 dark:text-slate-400 mb-6">Submit your medical question for AI-powered evidence-based response</p>

        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">New Question</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Specialty (Optional)
                </label>
                <div className="relative">
                  <Stethoscope className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <select
                    value={specialty}
                    onChange={(e) => setSpecialty(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  >
                    <option value="general">General Medicine</option>
                    <option value="cardiology">Cardiology</option>
                    <option value="endocrinology">Endocrinology</option>
                    <option value="oncology">Oncology</option>
                    <option value="neurology">Neurology</option>
                    <option value="gastroenterology">Gastroenterology</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Medical Question
                </label>
                <TextArea
                  placeholder="Enter your medical question... (e.g., What are the latest guidelines for hypertension management in elderly patients?)"
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  rows={5}
                  required
                />
              </div>
              <Button type="submit" disabled={loading || !question.trim()}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating Response...
                  </>
                ) : (
                  <>
                    <Send className="mr-2 h-4 w-4" />
                    Submit Query
                  </>
                )}
              </Button>
            </form>
          </div>

          {processing && !response && (
            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
              <div className="flex items-center justify-center py-8">
                <Loader2 className="mr-2 h-6 w-6 animate-spin text-blue-600" />
                <span className="text-slate-600">Processing your query... Streaming response</span>
              </div>
              {progress > 0 && (
                <div className="mt-4">
                  <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                    <div 
                      className="h-full bg-blue-600 transition-all duration-300" 
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <span className="text-xs text-slate-500 mt-1 block">{progress}%</span>
                </div>
              )}
              {partialFindings.length > 0 && (
                <div className="mt-4">
                  <h3 className="text-sm font-medium text-slate-700 mb-2">Key Findings (streaming):</h3>
                  <ul className="list-disc list-inside text-sm text-slate-600 space-y-1">
                    {partialFindings.map((finding, i) => {
                      const isVisible = streamingVisible[i];
                      return (
                        <li 
                          key={i} 
                          className={`transition-all duration-500 ease-out ${
                            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
                          }`}
                          style={{ transitionDelay: `${i * 100}ms` }}
                        >
                          {finding}
                        </li>
                      );
                    })}
                  </ul>
                </div>
              )}
            </div>
          )}

          {response && (
            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-slate-900 mb-4">AI Response</h2>
              <ResponseViewer response={response} />
            </div>
          )}

          {error && (
            <div className="bg-white rounded-xl border border-red-200 p-4">
              <p className="text-red-600 dark:text-red-400">{error}</p>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}