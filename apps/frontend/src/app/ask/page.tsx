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
import { useRouter } from 'next/navigation';

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3001';

export default function AskPage() {
   const [question, setQuestion] = useState('');
    const [specialty, setSpecialty] = useState<string>('general');
    const [loading, setLoading] = useState(false);
    const [processing, setProcessing] = useState(false);
    const [response, setResponse] = useState<AIResponse | null>(null);
    const [partialRecommendations, setPartialRecommendations] = useState<string[]>([]);
    const [streamingVisible, setStreamingVisible] = useState<boolean[]>([]);
    const [progress, setProgress] = useState(0);
    const [socketConnected, setSocketConnected] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [questionId, setQuestionId] = useState<string | null>(null);
    const router = useRouter();
    const user = useAppStore((state) => state.user);
    const { addToast } = useToast();

   useEffect(() => {
     if (!questionId) return;

     let pollInterval: ReturnType<typeof setInterval> | undefined;
     let attempts = 0;
     const maxAttempts = 60;

    const pollForResponse = async () => {
        try {
          const data = await api.getQuestion(questionId);
          
          if (data.aiResponse) {
            setResponse(data.aiResponse);
            setProcessing(false);
            setProgress(100);
            setPartialRecommendations(data.aiResponse.keyRecommendations || []);
            setStreamingVisible((data.aiResponse.keyRecommendations || []).map(() => true));
            if (pollInterval) clearInterval(pollInterval);
          } else if (attempts < maxAttempts) {
            attempts++;
            setProcessing(true);
            setProgress(Math.min(90, attempts * 15));
          }
        } catch (err: any) {
          if (err instanceof Error && err.message === 'Please sign in to continue') {
            if (pollInterval) clearInterval(pollInterval);
            router.push('/login');
            return;
          }
          if (err?.message?.includes('HTTP_429') || err?.message?.includes('Too Many Requests')) {
            console.warn('Rate limit hit, stopping polling');
            if (pollInterval) clearInterval(pollInterval);
            setError('Rate limit reached. Please wait a moment and try again.');
            setLoading(false);
            return;
          }
          if (attempts < maxAttempts) {
            attempts++;
            setProgress(Math.min(90, attempts * 15));
          }
        }
      };

     setProcessing(true);
     setProgress(5);
     pollForResponse();
     pollInterval = setInterval(pollForResponse, 1500);

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
       setPartialRecommendations(data.keyFindings);
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

     setTimeout(() => {
       socket.emit('stream-question', questionId);
     }, 100);

     return () => {
       if (pollInterval) clearInterval(pollInterval);
       socket.disconnect();
     };
   }, [questionId, user, addToast]);

 const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!question.trim()) return;

      setLoading(true);
      setError(null);
      setResponse(null);
      setPartialRecommendations([]);
      setStreamingVisible([]);
      setQuestionId(null);

      try {
        const result = await api.askQuestion(question.trim(), specialty === 'general' ? undefined : specialty);
        setQuestionId(result.questionId);
      } catch (err) {
        if (err instanceof Error && err.message === 'Please sign in to continue') {
          router.push('/login');
        } else {
          setError(err instanceof Error ? err.message : 'Failed to submit question');
        }
        setLoading(false);
      }
    };

   return (
     <AppLayout>
       <div className="max-w-4xl mx-auto">
         <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-1 sm:mb-2 gap-2">
           <h1 className="text-xl sm:text-2xl font-bold text-foreground">Ask AI</h1>
           <div className={`px-2 py-0.5 text-xs rounded-full w-fit ${
             socketConnected ? 'bg-emerald-100 text-emerald-700' : 'bg-muted text-muted-foreground'
           }`}>
             {socketConnected ? 'Connected' : 'Disconnected'}
           </div>
         </div>
         <p className="text-sm text-muted-foreground mb-4 sm:mb-6">Submit your medical question for AI-powered evidence-based response</p>

         <div className="space-y-4 sm:space-y-6">
           <div className="bg-card rounded-xl border border-border p-4 sm:p-6 shadow-sm">
             <h2 className="text-base sm:text-lg font-semibold text-foreground mb-3 sm:mb-4">New Question</h2>
             <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
               <div>
                 <label className="block text-xs sm:text-sm font-medium text-foreground mb-1.5 sm:mb-2">
                   Specialty (Optional)
                 </label>
                 <div className="relative">
                   <Stethoscope className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                   <select
                     value={specialty}
                     onChange={(e) => setSpecialty(e.target.value)}
                     className="w-full pl-10 pr-4 py-2.5 sm:py-3 border border-border rounded-lg bg-input text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
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
                 <label className="block text-xs sm:text-sm font-medium text-foreground mb-1.5 sm:mb-2">
                   Medical Question
                 </label>
                 <TextArea
                   placeholder="Enter your medical question... (e.g., What are the latest guidelines for hypertension management?)"
                   value={question}
                   onChange={(e) => setQuestion(e.target.value)}
                   onKeyDown={(e) => {
                     if (e.key === 'Enter' && !e.shiftKey) {
                       e.preventDefault();
                       handleSubmit(e as any);
                     }
                     // Shift+Enter allows new line (default behavior)
                   }}
                   rows={4}
                   required
                 />
               </div>
               <Button type="submit" disabled={loading || !question.trim()} className="w-full sm:w-auto">
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
             <div className="bg-card rounded-xl border border-border p-4 sm:p-6 shadow-sm">
               <div className="flex items-center justify-center py-6 sm:py-8">
                 <Loader2 className="mr-2 h-5 w-5 sm:h-6 sm:w-6 animate-spin text-primary" />
                 <span className="text-muted-foreground text-sm">Processing your query... Streaming response</span>
               </div>
               {progress > 0 && (
                 <div className="mt-3 sm:mt-4">
                   <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                     <div 
                       className="h-full bg-primary transition-all duration-300" 
                       style={{ width: `${progress}%` }}
                     />
                   </div>
                   <span className="text-xs text-muted-foreground mt-1 block">{progress}%</span>
                 </div>
               )}
                {partialRecommendations.length > 0 && (
                  <div className="mt-3 sm:mt-4">
                    <h3 className="text-xs sm:text-sm font-medium text-foreground mb-1.5 sm:mb-2">Key Findings (streaming):</h3>
                    <ul className="list-disc list-inside text-xs sm:text-sm text-muted-foreground space-y-0.5 sm:space-y-1">
                      {partialRecommendations.map((rec, i) => {
                        const isVisible = streamingVisible[i];
                        return (
                          <li 
                            key={i} 
                            className={`transition-all duration-500 ease-out ${
                              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
                            }`}
                            style={{ transitionDelay: `${i * 100}ms` }}
                          >
                            {rec}
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                )}
             </div>
           )}

           {response && (
             <div className="bg-card rounded-xl border border-border p-4 sm:p-6 shadow-sm">
               <h2 className="text-base sm:text-lg font-semibold text-foreground mb-3 sm:mb-4">AI Response</h2>
               <ResponseViewer response={response} />
             </div>
           )}

           {error && (
             <div className="bg-card rounded-xl border border-red-200 p-3 sm:p-4">
               <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
             </div>
           )}
         </div>
       </div>
     </AppLayout>
   );
}