'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardHeader, CardContent } from '../../components/ui/Card';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../components/ui/Table';
import { Search, ExternalLink, Trash2, ChevronLeft, ChevronRight, Bookmark } from 'lucide-react';
import { api } from '../../lib/api';
import { Query } from '../../types';
import { AppLayout } from '../../components/layout/AppLayout';
import { useRouter } from 'next/navigation';

export default function HistoryPage() {
   const [search, setSearch] = useState('');
   const [queries, setQueries] = useState<Query[]>([]);
   const [loading, setLoading] = useState(true);
   const [page, setPage] = useState(1);
   const [totalPages, setTotalPages] = useState(1);
   const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
   const [dateFilter, setDateFilter] = useState('');
   const [categoryFilter, setCategoryFilter] = useState('');
   const router = useRouter();

   useEffect(() => {
     fetchHistory();
   }, [page]);

const fetchHistory = async () => {
     setLoading(true);
     try {
       const history = await api.getHistory();
       const formatted: Query[] = history.map((q) => ({
         id: q.id,
         question: q.question,
         category: q.category || 'General',
         status: (q.status || 'pending') as 'pending' | 'approved' | 'rejected' | 'in_review',
         createdAt: new Date(q.createdAt).toLocaleDateString(),
         updatedAt: new Date(q.updatedAt).toLocaleDateString(),
         userId: q.userId,
         isSaved: q.isSaved,
       }));
       setQueries(formatted);
       setTotalPages(1);
     } catch (err) {
       if ((err as Error).message === 'Please sign in to continue') {
         router.push('/login');
       }
     } finally {
       setLoading(false);
     }
   };

   const handleDelete = async (queryId: string) => {
     if (!confirm('Are you sure you want to delete this query?')) return;
     try {
       await api.request(`/questions/${queryId}`, { method: 'DELETE' });
       setQueries((prev) => prev.filter((q) => q.id !== queryId));
     } catch (err) {
       console.error('Failed to delete query:', err);
     }
   };

   const handleSave = async (queryId: string) => {
     try {
       await api.saveResponse(queryId);
       setQueries((prev) => prev.map((q) => q.id === queryId ? { ...q, isSaved: true } : q));
     } catch (err) {
       console.error('Failed to save response:', err);
     }
   };

   const filteredQueries = queries.filter((q) => {
     const matchesSearch = q.question.toLowerCase().includes(search.toLowerCase()) ||
       q.category.toLowerCase().includes(search.toLowerCase());
     const matchesStatus = statusFilter === 'all' || q.status === statusFilter;
     const matchesCategory = !categoryFilter || q.category.toLowerCase().includes(categoryFilter.toLowerCase());
     return matchesSearch && matchesStatus && matchesCategory;
   });

   return (
     <AppLayout>
       <div className="space-y-4 sm:space-y-6">
         <div>
           <h1 className="text-xl sm:text-2xl font-bold text-foreground mb-1 sm:mb-2">Query History</h1>
           <p className="text-sm text-muted-foreground">View all your previous medical queries</p>
         </div>

         <Card>
           <CardHeader>
             <div className="flex flex-col sm:flex-row sm:items-center gap-3">
               <div className="relative flex-1">
                 <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                 <input
                   type="text"
                   placeholder="Search queries..."
                   value={search}
                   onChange={(e) => setSearch(e.target.value)}
                   className="w-full pl-10 pr-4 py-2 border border-border rounded-lg bg-input text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                 />
               </div>
<select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as 'all' | 'pending' | 'approved' | 'rejected')}
                  className="px-3 py-2 border border-border rounded-lg bg-input text-xs sm:text-sm"
                >
                 <option value="all">All Status</option>
                 <option value="pending">Pending</option>
                 <option value="approved">Approved</option>
                 <option value="rejected">Rejected</option>
               </select>
               <input
                 type="date"
                 value={dateFilter}
                 onChange={(e) => setDateFilter(e.target.value)}
                 className="px-3 py-2 border border-border rounded-lg bg-input text-xs sm:text-sm"
               />
               <input
                 type="text"
                 placeholder="Category..."
                 value={categoryFilter}
                 onChange={(e) => setCategoryFilter(e.target.value)}
                 className="px-3 py-2 border border-border rounded-lg bg-input text-xs sm:text-sm"
               />
             </div>
           </CardHeader>
           <CardContent>
             {loading ? (
               <div className="text-center py-6 sm:py-8 text-sm">Loading history...</div>
             ) : (
               <>
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
                         <TableCell className="text-right space-x-1.5 sm:space-x-2">
                           <button className="text-primary hover:text-primary/80" title="View details" onClick={() => window.location.href = `/history/${query.id}`}>
                             <ExternalLink size={16} />
                           </button>
                           {!query.isSaved && (
                             <button className="text-primary hover:text-primary/80" title="Save" onClick={() => handleSave(query.id)}>
                               <Bookmark size={16} />
                             </button>
                           )}
                           <button className="text-red-600 hover:text-red-700" title="Delete" onClick={() => handleDelete(query.id)}>
                             <Trash2 size={16} />
                           </button>
                         </TableCell>
                       </TableRow>
                     ))}
                   </TableBody>
                 </Table>

                 {totalPages > 1 && (
                   <div className="flex items-center justify-between mt-3 sm:mt-4">
                     <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="px-3 py-1 text-sm border border-border rounded-lg hover:bg-muted transition-colors disabled:opacity-50">
                       <ChevronLeft size={14} /> Previous
                     </button>
                     <span className="text-xs sm:text-sm text-muted-foreground">Page {page} of {totalPages}</span>
                     <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="px-3 py-1 text-sm border border-border rounded-lg hover:bg-muted transition-colors disabled:opacity-50">
                       Next <ChevronRight size={14} />
                     </button>
                   </div>
                 )}
               </>
             )}
           </CardContent>
         </Card>
       </div>
     </AppLayout>
   );
}