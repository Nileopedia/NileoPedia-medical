'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AppLayout } from '@/components/layout/AppLayout';
import { QueryInput } from '@/components/query/QueryInput';
import { ResponseViewer } from '@/components/query/ResponseViewer';
import { StatCard } from '@/components/dashboard/StatCard';
import { TopCategories } from '@/components/dashboard/TopCategories';
import { RecentActivity } from '@/components/dashboard/RecentActivity';
import { useAppStore } from '@/store/appStore';
import { MessageCircleQuestion, History, Bookmark, Clock } from 'lucide-react';
import { api } from '@/lib/api';
import type { AIResponse, CategoryStat, Activity } from '@/types';

export default function AppPage() {
   const user = useAppStore((state) => state.user);
   const router = useRouter();
   const [showResponse, setShowResponse] = useState(false);
   const [loading, setLoading] = useState(false);
   const [response, setResponse] = useState<AIResponse | null>(null);
   const [error, setError] = useState<string | null>(null);
   const [stats, setStats] = useState({
     totalQueries: 0,
     pendingReviews: 0,
     savedResponses: 0,
     avgResponseTime: '2.4s',
   });
   const [categoryStats, setCategoryStats] = useState<CategoryStat[]>([]);
   const [recentActivities, setRecentActivities] = useState<Activity[]>([]);

   useEffect(() => {
     fetchDashboardStats();
   }, []);

   const fetchDashboardStats = async () => {
     try {
       const history = await api.getHistory();
       const saved = await api.getSavedResponses();
       
       setStats({
         totalQueries: history.length,
         pendingReviews: history.filter(q => q.status === 'pending' || q.status === 'in_review').length,
         savedResponses: saved.length,
         avgResponseTime: '2.4s',
       });

       const categoryCounts: Record<string, number> = {};
       history.forEach(q => {
         const cat = q.category || 'General';
         categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
       });
       
       const colors = ['#2563EB', '#3B82F6', '#60A5FA', '#93C5FD', '#BFDBFE'];
       const statsItems = Object.entries(categoryCounts).map(([name, value], i) => ({
         name,
         value,
         color: colors[i % colors.length],
       }));
       setCategoryStats(statsItems);

       const activities: Activity[] = history.slice(0, 5).map((q) => ({
         id: q.id,
         type: 'query_submitted' as const,
         title: q.question,
         description: `${q.category || 'General'} - ${q.status}`,
         status: (q.status === 'approved' || q.status === 'rejected' || q.status === 'pending') ? q.status : 'pending',
         timestamp: q.createdAt || 'Recently',
       }));
       setRecentActivities(activities);
     } catch (err) {
       console.error('Failed to fetch dashboard stats:', err);
     }
   };

   const handleSubmitQuery = async (query: string) => {
     setLoading(true);
     setError(null);
     try {
       const result = await api.askQuestion(query);
       if (!result || !result.questionId) throw new Error('Invalid response from AI service');

       const aiResponse: AIResponse = {
         id: `resp-${result.questionId}`,
         queryId: result.questionId,
         title: query,
         summary: 'Your question is being processed by our AI system.',
         keyRecommendations: [],
         sections: {},
         citations: [],
         status: 'pending',
         confidenceScore: 0,
         model: 'Processing',
         generatedAt: new Date().toISOString(),
         tags: [],
         source: 'real' as const,
       };
       setResponse(aiResponse);
       setShowResponse(true);

       const pollForFullResponse = async (questionId: string) => {
         let attempts = 0;
         const maxAttempts = 60;

         const check = async () => {
           try {
             const data = await api.getQuestion(questionId);
             if (data.aiResponse && data.aiResponse.status !== 'pending') {
               setResponse(data.aiResponse);
             } else if (attempts < maxAttempts) {
               attempts++;
               setTimeout(check, 2000);
             } else {
               setError('AI processing is taking longer than usual. Please check back in history later.');
             }
           } catch (err) {
             if (err instanceof Error && err.message === 'Please sign in to continue') {
               router.push('/login');
               return;
             }
             if (attempts < maxAttempts) {
               attempts++;
               setTimeout(check, 3000);
             }
           }
         };
         setTimeout(check, 2000);
       };
       pollForFullResponse(result.questionId);
     } catch (err) {
       if (err instanceof Error && err.message === 'Please sign in to continue') {
         router.push('/login');
       } else {
         console.error('Failed to submit query:', err);
         setError(err instanceof Error ? err.message : 'Failed to reach AI service');
       }
     } finally {
       setLoading(false);
     }
   };

   return (
     <AppLayout>
       <div className="space-y-4 sm:space-y-6">
         <div>
           <h1 className="text-xl sm:text-2xl font-bold text-foreground mb-1 sm:mb-2">Welcome back, {user?.name?.split(' ')[0] || 'User'}</h1>
           <p className="text-sm text-muted-foreground">Ask medical questions and get evidence-based answers validated by experts</p>
         </div>

         {user?.role === 'admin' && (
           <div className="bg-red-100 dark:bg-red-900 p-3 sm:p-4 rounded-lg text-red-800 dark:text-red-200 border border-red-200 dark:border-red-700">
             <p className="font-semibold text-sm sm:text-base">Admin Dashboard Access:</p>
             <p className="text-xs sm:text-sm">As an administrator, you have elevated privileges. Access admin-specific tools and reports here.</p>
             <Link href="/admin" className="text-red-600 hover:underline mt-1.5 sm:mt-2 block">Go to Admin Panel</Link>
           </div>
         )}

         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
           <StatCard title="Total Queries" value={stats.totalQueries.toString()} icon={<MessageCircleQuestion size={20} className="text-blue-600" />} />
           <StatCard title="Pending Reviews" value={stats.pendingReviews.toString()} icon={<Clock size={20} className="text-amber-600" />} />
           <StatCard title="Saved Responses" value={stats.savedResponses.toString()} icon={<Bookmark size={20} className="text-emerald-600" />} />
           <StatCard title="Avg Response Time" value={stats.avgResponseTime} icon={<History size={20} className="text-purple-600" />} />
         </div>

         <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
           <div className="lg:col-span-2 space-y-4 sm:space-y-6">
             <QueryInput onSubmit={handleSubmitQuery} loading={loading} />
             {error && (
               <div className="p-3 sm:p-4 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm">
                 {error}
               </div>
             )}
             {showResponse && response && <ResponseViewer response={response} />}
           </div>
           <div className="space-y-4 sm:space-y-6">
             <TopCategories categories={categoryStats} />
             <RecentActivity activities={recentActivities} />
           </div>
         </div>
       </div>
     </AppLayout>
   );
}