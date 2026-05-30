'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardHeader, CardTitle, CardContent } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/Badge';
import { Upload, FileText, CheckCircle, XCircle, Clock, Search } from 'lucide-react';

interface Document {
  id: string;
  name: string;
  type: string;
  status: 'processed' | 'processing' | 'failed';
  uploadedAt: string;
  size: string;
}

const mockDocuments: Document[] = [
  { id: '1', name: 'ADA_Standards_2024.pdf', type: 'Guideline', status: 'processed', uploadedAt: '2 days ago', size: '2.4 MB' },
  { id: '2', name: 'EASD_Clinical_Guidelines.pdf', type: 'Guideline', status: 'processing', uploadedAt: '1 hour ago', size: '1.8 MB' },
  { id: '3', name: 'Lancet_Diabetes_Study.pdf', type: 'Research', status: 'processed', uploadedAt: '1 week ago', size: '3.2 MB' },
];

export default function DocumentsPage() {
  const [search, setSearch] = useState('');
  const [documents] = useState<Document[]>(mockDocuments);

  const filteredDocuments = documents.filter(d =>
    d.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-50 mb-2">Documents</h1>
        <p className="text-slate-600 dark:text-slate-400">Manage medical documents and knowledge base</p>
      </motion.div>

      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input
            type="text"
            placeholder="Search documents..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <Button className="gap-2">
          <Upload size={16} />
          Upload Document
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Document Library</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {filteredDocuments.map((doc) => (
              <div key={doc.id} className="flex items-center justify-between p-4 border border-slate-200 dark:border-slate-700 rounded-lg">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                    <FileText size={20} className="text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium text-slate-900 dark:text-slate-50">{doc.name}</p>
                    <p className="text-sm text-slate-500 dark:text-slate-400">{doc.type} &bull; {doc.size}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant={doc.status === 'processed' ? 'success' : doc.status === 'processing' ? 'warning' : 'default'}>
                    {doc.status}
                  </Badge>
                  <span className="text-sm text-slate-500 dark:text-slate-400">{doc.uploadedAt}</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}