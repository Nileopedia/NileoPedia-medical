'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardHeader, CardContent } from '../../components/ui/Card';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../components/ui/Table';
import { Search, ExternalLink } from 'lucide-react';
import { api } from '../../lib/api';
import { Query } from '../../types';
import { AppLayout } from '../../components/layout/AppLayout';
import { useRouter } from 'next/navigation';

export default function HistoryPage() {
   const [search, setSearch] = useState('');
    const [queries, setQueries] = useState<Query[]>([]);
    const router = useRouter();
    const mockQueries: Query[] = [
      { id: '1', question: 'What are the latest guidelines for AF management?', category: 'Cardiology', status: 'approved', createdAt: '2 min ago', updatedAt: '2 min ago', userId: '1' },
      { id: '2', question: 'How to manage acute asthma in children?', category: 'Pediatrics', status: 'pending', createdAt: '15 min ago', updatedAt: '15 min ago', userId: '1' },
    ];

    useEffect(() => {
      const fetchHistory = async () => {
        const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
        if (!token) {
          setQueries(mockQueries);
          return;
        }
        try {
          const data = await api.getHistory();
          const formatted: Query[] = data.map((q) => ({
            id: q.id,
            question: q.question,
            category: q.category || 'General',
            status: (q.status || 'pending') as 'pending' | 'approved' | 'rejected' | 'in_review',
            createdAt: new Date(q.createdAt).toLocaleDateString(),
            updatedAt: new Date(q.updatedAt).toLocaleDateString(),
            userId: q.userId,
          }));
          setQueries(formatted);
        } catch (error) {
          if (error instanceof Error && error.message === 'Please sign in to continue') {
            router.push('/login');
          } else {
            setQueries(mockQueries);
          }
        }
      };
      fetchHistory();
    }, [router]);

   const filteredQueries = queries.filter(q =>
     q.question.toLowerCase().includes(search.toLowerCase()) ||
     q.category.toLowerCase().includes(search.toLowerCase())
   );

   return (
     <AppLayout>
       <div className="space-y-4 sm:space-y-6">
         <div>
           <h1 className="text-xl sm:text-2xl font-bold text-foreground mb-1 sm:mb-2">Query History</h1>
           <p className="text-sm text-muted-foreground">View all your previous medical queries</p>
         </div>

         <Card>
           <CardHeader>
             <div className="relative">
               <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
               <input
                 type="text"
                 placeholder="Search queries..."
                 value={search}
                 onChange={(e) => setSearch(e.target.value)}
                 className="w-full pl-10 pr-4 py-2 border border-border rounded-lg bg-input text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
               />
             </div>
           </CardHeader>
           <CardContent>
             <Table>
               <TableHeader>
                 <TableRow>
                   <TableHead>Question</TableHead>
                   <TableHead>Category</TableHead>
                   <TableHead>Status</TableHead>
                   <TableHead>Date</TableHead>
                   <TableHead className="text-right">Actions</TableHead>
                 </TableRow>
               </TableHeader>
               <TableBody>
                 {filteredQueries.map((query) => (
                   <TableRow key={query.id}>
                     <TableCell className="font-medium text-foreground">{query.question}</TableCell>
                     <TableCell className="text-muted-foreground">{query.category}</TableCell>
                     <TableCell>
                       <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                         query.status === 'approved' ? 'bg-emerald-100 text-emerald-700' :
                         query.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                         'bg-muted text-muted-foreground'
                       }`}>
                         {query.status}
                       </span>
                     </TableCell>
                     <TableCell className="text-muted-foreground">{query.createdAt}</TableCell>
                     <TableCell className="text-right">
                       <button className="text-primary hover:text-primary/80" title="View details">
                         <ExternalLink size={16} />
                       </button>
                     </TableCell>
                   </TableRow>
                 ))}
               </TableBody>
             </Table>
           </CardContent>
         </Card>
       </div>
     </AppLayout>
   );
}