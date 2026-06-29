'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Check, X } from 'lucide-react';
import { AppLayout } from '../../components/layout/AppLayout';
import { api, ValidationReview } from '../../lib/api';
import { useAppStore } from '../../store/appStore';
import { useRouter } from 'next/navigation';

export default function ValidatorPage() {
   const [reviewQueue, setReviewQueue] = useState<Array<{ id: string; title: string; category: string; submittedAt: string; dueDate: string; priority: string; aiResponseId?: string }>>([]);
   const [validationHistory, setValidationHistory] = useState<ValidationReview[]>([]);
   const [activeTab, setActiveTab] = useState<'pending' | 'history'>('pending');
   const [loading, setLoading] = useState(false);
   const [actionLoading, setActionLoading] = useState<string | null>(null);
   const router = useRouter();
   const user = useAppStore((state) => state.user);
   const isInitialized = useAppStore((state) => state.isInitialized);

   useEffect(() => {
     if (isInitialized && (user?.role === 'validator' || user?.role === 'admin')) {
       fetchPendingReviews();
       fetchHistory();
     }
   }, [user, isInitialized]);

   const fetchPendingReviews = async () => {
     setLoading(true);
     try {
       const reviews = await api.getPendingReviews();
       setReviewQueue(reviews);
     } catch (error) {
       if (error instanceof Error && error.message === 'Please sign in to continue') {
         router.push('/login');
       } else {
         console.error('Failed to fetch pending reviews:', error);
       }
     } finally {
       setLoading(false);
     }
   };

const fetchHistory = async () => {
      try {
        const result = await api.getValidationHistory(1, 10);
        setValidationHistory(result.reviews);
      } catch (error) {
        if (error instanceof Error && error.message === 'Please sign in to continue') {
          router.push('/login');
        } else {
          console.error('Failed to fetch validation history:', error);
        }
      }
    };

   const handleApprove = async (responseId: string) => {
     setActionLoading(responseId);
     try {
       await api.approveReview(responseId, 5, 'Looks good');
       setReviewQueue((prev) => prev.filter((item) => item.id !== responseId));
       fetchHistory();
     } catch (error) {
       console.error('Failed to approve:', error);
     } finally {
       setActionLoading(null);
     }
   };

   const handleReject = async (responseId: string) => {
     setActionLoading(responseId);
     try {
       await api.rejectReview(responseId, 'Not accurate');
       setReviewQueue((prev) => prev.filter((item) => item.id !== responseId));
       fetchHistory();
     } catch (error) {
       console.error('Failed to reject:', error);
     } finally {
       setActionLoading(null);
     }
   };

   const formatDate = (dateString: string) => {
     const date = new Date(dateString);
     return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
   };

   return (
     <AppLayout>
       <div className="space-y-4 sm:space-y-6">
         <div>
           <h1 className="text-xl sm:text-2xl font-bold text-foreground mb-1 sm:mb-2">Validation Center</h1>
           <p className="text-sm text-muted-foreground">Review and validate AI-generated responses</p>
         </div>

         <div className="flex gap-2 border-b border-border overflow-x-auto -mx-2 sm:mx-0 px-2 sm:px-0">
           <button
             onClick={() => setActiveTab('pending')}
             className={`px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
               activeTab === 'pending'
                 ? 'border-blue-500 text-blue-600'
                 : 'border-transparent text-slate-600 hover:text-slate-900'
             }`}
           >
             Pending Reviews ({reviewQueue.length})
           </button>
           <button
             onClick={() => setActiveTab('history')}
             className={`px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
               activeTab === 'history'
                 ? 'border-blue-500 text-blue-600'
                 : 'border-transparent text-slate-600 hover:text-slate-900'
             }`}
           >
             Validation History ({validationHistory.length})
           </button>
         </div>

         {loading && activeTab === 'pending' ? (
           <div className="text-center py-6 sm:py-8 text-muted-foreground text-sm">Loading pending reviews...</div>
         ) : activeTab === 'pending' ? (
           <div className="grid gap-3 sm:gap-4">
             {reviewQueue.length === 0 ? (
               <Card>
                 <CardContent className="p-4 sm:p-6 text-center text-muted-foreground text-sm">
                   No pending reviews available
                 </CardContent>
               </Card>
             ) : (
               reviewQueue.map((item) => (
                 <Card key={item.id}>
                   <CardContent className="p-4 sm:p-6">
                     <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-3 sm:mb-4 gap-2">
                       <div>
                         <h3 className="text-base sm:text-lg font-semibold text-foreground mb-1">{item.title}</h3>
                         <p className="text-xs sm:text-sm text-muted-foreground">
                           {item.category} &bull; Submitted {formatDate(item.submittedAt)}
                         </p>
                       </div>
                       <span
                         className={`px-2 py-1 text-xs font-medium rounded w-fit ${
                           item.priority === 'high' ? 'bg-amber-100 text-amber-700' : 'bg-muted text-muted-foreground'
                         }`}
                       >
                         {item.priority} priority
                       </span>
                     </div>
                     <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-xs sm:text-sm text-muted-foreground mb-3 sm:mb-4">
                       <span>Due: {item.dueDate || 'No due date'}</span>
                     </div>
                     <div className="flex flex-col sm:flex-row gap-2">
                       <Button
                         variant="success"
                         size="sm"
                         onClick={() => handleApprove(item.id)}
                         disabled={actionLoading === item.id}
                         className="w-full sm:w-auto"
                       >
                         <Check size={16} className="mr-1" />
                         {actionLoading === item.id ? 'Processing...' : 'Approve'}
                       </Button>
                       <Button
                         variant="destructive"
                         size="sm"
                         onClick={() => handleReject(item.id)}
                         disabled={actionLoading === item.id}
                         className="w-full sm:w-auto"
                       >
                         <X size={16} className="mr-1" />
                         {actionLoading === item.id ? 'Processing...' : 'Reject'}
                       </Button>
                       <Button variant="outline" size="sm" className="w-full sm:w-auto" onClick={() => window.location.href = `/validator/${item.id}`}>
                         View Details
                       </Button>
                     </div>
                   </CardContent>
                 </Card>
               ))
             )}
           </div>
         ) : (
           <div className="grid gap-3 sm:gap-4">
             {validationHistory.length === 0 ? (
               <Card>
                 <CardContent className="p-4 sm:p-6 text-center text-muted-foreground text-sm">
                   No validation history available
                 </CardContent>
               </Card>
             ) : (
               validationHistory.map((item) => (
                 <Card key={item.id}>
                   <CardContent className="p-4 sm:p-6">
                     <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-3 sm:mb-4 gap-2">
                       <div>
                         <h3 className="text-base sm:text-lg font-semibold text-foreground mb-1">
                           {item.aiResponse?.title || 'Untitled Response'}
                         </h3>
                         <p className="text-xs sm:text-sm text-muted-foreground">
                           {item.aiResponse?.question?.questionText || 'Unknown query'}
                         </p>
                       </div>
                       <span
                         className={`px-2 py-1 text-xs font-medium rounded w-fit ${
                           item.status === 'approved'
                             ? 'bg-emerald-100 text-emerald-700'
                             : item.status === 'rejected'
                             ? 'bg-red-100 text-red-700'
                             : 'bg-muted text-muted-foreground'
                         }`}
                       >
                         {item.status}
                       </span>
                     </div>
                     <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-xs sm:text-sm text-muted-foreground mb-3 sm:mb-4">
                       <span>Reviewed: {formatDate(item.reviewedAt)}</span>
                       {item.score && <span>Score: {item.score}/5</span>}
                     </div>
                     {item.feedback && (
                       <div className="text-xs sm:text-sm text-muted-foreground mb-3 sm:mb-4 p-2.5 sm:p-3 bg-muted rounded">
                         <strong>Feedback:</strong> {item.feedback}
                       </div>
                     )}
                     <Button variant="outline" size="sm" className="w-full sm:w-auto">
                       View Details
                     </Button>
                   </CardContent>
                 </Card>
               ))
             )}
           </div>
         )}
       </div>
     </AppLayout>
   );
}