'use client';

import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { FileUpload, FilePreview } from '../../components/ui/FileUpload';
import { Search as SearchIcon, FileText } from 'lucide-react';
import { AppLayout } from '../../components/layout/AppLayout';
import { api } from '../../lib/api';

interface Document {
  id: string;
  name: string;
  type: string;
  status: 'processed' | 'processing' | 'failed';
  uploadedAt: string;
  size: string;
}

export default function DocumentsPage() {
  const [search, setSearch] = useState('');
  const [documents, setDocuments] = useState<Document[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);

  const handleUpload = async () => {
    if (selectedFiles.length === 0) return;
    setUploading(true);
    try {
      for (const file of selectedFiles) {
        await api.uploadDocument(file);
        const newDoc: Document = {
          id: Date.now().toString(),
          name: file.name,
          type: file.name.split('.').pop()?.toUpperCase() || 'PDF',
          status: 'processing',
          uploadedAt: 'Just now',
          size: `${(file.size / 1024 / 1024).toFixed(2)} MB`,
        };
        setDocuments((prev) => [...prev, newDoc]);
      }
      setSelectedFiles([]);
    } catch (err) {
      const error = err instanceof Error ? err.message : 'Upload failed';
      // Check if unauthorized (need admin role)
      if (error.includes('401') || error.includes('Unauthorized') || error.includes('sign in')) {
        alert('Document upload requires admin privileges. Please sign in as an admin user.');
      } else if (error.includes('403') || error.includes('Forbidden')) {
        alert('You do not have permission to upload documents. Admin role required.');
      } else {
        console.error('Upload failed:', error);
      }
    } finally {
      setUploading(false);
    }
  };

  const handleFilesSelect = (files: File[]) => {
    setSelectedFiles((prev) => [...prev, ...files]);
  };

  const removeFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-50 mb-2">Documents</h1>
          <p className="text-slate-600 dark:text-slate-400">Manage medical documents and knowledge base</p>
        </div>

        {selectedFiles.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Selected Files</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 mb-4">
                {selectedFiles.map((file, index) => (
                  <FilePreview key={index} file={file} onRemove={() => removeFile(index)} />
                ))}
              </div>
              <Button onClick={handleUpload} loading={uploading} disabled={uploading} className="w-full">
                Upload {selectedFiles.length} file{selectedFiles.length > 1 ? 's' : ''}
              </Button>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Upload Document</CardTitle>
          </CardHeader>
          <CardContent>
            <FileUpload onUpload={handleFilesSelect} accept=".pdf,.doc,.docx,.txt" multiple />
          </CardContent>
        </Card>

        <div className="relative flex-1">
          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input
            type="text"
            placeholder="Search documents..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Document Library</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {documents.map((doc) => (
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
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                      doc.status === 'processed' ? 'bg-emerald-100 text-emerald-700' :
                      doc.status === 'processing' ? 'bg-amber-100 text-amber-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {doc.status}
                    </span>
                    <span className="text-sm text-slate-500 dark:text-slate-400">{doc.uploadedAt}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}