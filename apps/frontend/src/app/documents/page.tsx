'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { FileUpload, FilePreview } from '../../components/ui/FileUpload';
import { Input } from '../../components/ui/Input';
import { AppLayout } from '../../components/layout/AppLayout';
import { api } from '../../lib/api';
import { FileText, Search as SearchIcon, Trash2, RefreshCw, ChevronLeft, ChevronRight, WifiOff, AlertTriangle, Edit, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useToast } from '../../components/ui/Toast';

interface Document {
  id: string;
  title: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  ingestionStatus: string;
  createdAt: string;
  specialty?: string;
  documentType?: string;
  source?: string;
}

export default function DocumentsPage() {
  const [search, setSearch] = useState('');
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [reingestingId, setReingestingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [deletingAll, setDeletingAll] = useState(false);
  const router = useRouter();
  const { addToast } = useToast();

  useEffect(() => {
    fetchDocuments();
  }, [page, search]);

  const fetchDocuments = async () => {
    setLoading(true);
    try {
      const response = await api.request<{ success: boolean; data: { documents: Document[]; pagination: { total: number; page: number; limit: number; totalPages: number } } }>(
        `/documents?page=${page}&limit=20&search=${encodeURIComponent(search)}`
      );
      setDocuments(response.data.documents);
      setTotalPages(response.data.pagination.totalPages);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to fetch documents';
      if (msg === 'Please sign in to continue') {
        router.push('/login');
      } else {
        setError(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0) return;
    setUploading(true);
    try {
      for (const file of selectedFiles) {
        await api.uploadDocument(file);
      }
      setSelectedFiles([]);
      fetchDocuments();
    } catch (err) {
      const error = err instanceof Error ? err.message : 'Upload failed';
      if (error.includes('401') || error.includes('sign in')) {
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

  const handleDeleteDocument = async (documentId: string) => {
    if (!confirm('Are you sure you want to delete this document?')) return;
    try {
      await api.request(`/documents/${documentId}`, { method: 'DELETE' });
      fetchDocuments();
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to delete document';
      if (msg === 'Please sign in to continue') {
        router.push('/login');
      } else if (msg.includes('404') || msg.includes('not found')) {
        fetchDocuments();
      } else {
        setError(msg);
      }
    }
  };

  const handleDeleteAllDocuments = async () => {
    const confirmed = confirm('Are you sure you want to delete ALL documents? This action cannot be undone.');
    if (!confirmed) return;

    setDeletingAll(true);
    setError(null);
    try {
      await api.deleteAllDocuments();
      addToast({ type: 'success', title: 'All documents deleted successfully' });
      fetchDocuments();
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to delete all documents';
      if (msg === 'Please sign in to continue') {
        router.push('/login');
      } else {
        setError(msg);
        addToast({ type: 'error', title: msg });
      }
    } finally {
      setDeletingAll(false);
    }
  };

  const handleReingestDocument = async (documentId: string) => {
    setReingestingId(documentId);
    try {
      await api.request(`/documents/${documentId}/verify`, { method: 'PATCH' });
      fetchDocuments();
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to re-ingest document';
      if (msg === 'Please sign in to continue') {
        router.push('/login');
      } else {
        setError(msg);
      }
    } finally {
      setReingestingId(null);
    }
  };

  return (
    <AppLayout>
      <div className="space-y-4 sm:space-y-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-foreground mb-1 sm:mb-2">Documents</h1>
          <p className="text-sm text-muted-foreground">Manage medical documents and knowledge base</p>
        </div>

        {error && (
          <div className="p-3 sm:p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 rounded-lg flex items-center gap-2">
            <WifiOff className="text-amber-600" size={16} />
            <p className="text-xs sm:text-sm text-amber-700">{error}</p>
          </div>
        )}

        {selectedFiles.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Selected Files</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 sm:space-y-3 mb-3 sm:mb-4">
                {selectedFiles.map((file, index) => (
                  <FilePreview key={index} file={file} onRemove={() => removeFile(index)} />
                ))}
              </div>
              <Button onClick={handleUpload} loading={uploading} disabled={uploading} className="w-full sm:w-auto">
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
            <FileUpload onUpload={handleFilesSelect} accept=".pdf,.doc,.docx,.txt,.html" multiple />
          </CardContent>
        </Card>

        <div className="relative flex-1">
          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
          <Input
            type="text"
            placeholder="Search documents..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-border rounded-lg bg-input text-foreground placeholder:text-muted-foreground"
          />
        </div>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Document Library</CardTitle>
            <Button
              variant="destructive"
              size="sm"
              disabled={documents.length === 0 || deletingAll}
              onClick={handleDeleteAllDocuments}
            >
              <Trash2 size={14} className="mr-1" />
              Delete All
            </Button>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-6 sm:py-8 text-sm">Loading documents...</div>
            ) : (
              <>
                <div className="space-y-2.5 sm:space-y-3">
                  {documents.map((doc) => (
                    <div key={doc.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3.5 sm:p-4 border border-border rounded-lg gap-2">
                      <div className="flex items-center gap-2.5 sm:gap-4">
                        <div className="w-9 h-9 sm:w-10 sm:h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                          <FileText size={18} className="text-blue-600" />
                        </div>
                        <div>
                          <p className="text-sm sm:text-base font-medium text-foreground">{doc.title}</p>
                          <p className="text-xs sm:text-sm text-muted-foreground">
                            {doc.documentType || doc.fileType} &bull; {(doc.fileSize / 1024 / 1024).toFixed(2)} MB
                          </p>
                        </div>
                      </div>
                      <div className="flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-3">
                        <span className={`px-2 py-0.5 rounded text-xs font-medium w-fit ${
                          doc.ingestionStatus === 'COMPLETED' ? 'bg-emerald-100 text-emerald-700' :
                          doc.ingestionStatus === 'PROCESSING' ? 'bg-amber-100 text-amber-700' :
                          'bg-red-100 text-red-700'
                        }`}>
                          {doc.ingestionStatus?.toLowerCase()}
                        </span>
                        <div className="flex gap-1 sm:gap-2">
                          <button
                            onClick={() => handleReingestDocument(doc.id)}
                            disabled={doc.ingestionStatus === 'PROCESSING' || reingestingId === doc.id}
                            className="p-1 text-primary hover:text-primary/80 disabled:opacity-50"
                            title="Re-ingest"
                          >
                            {reingestingId === doc.id ? 'Re-ingesting...' : <RefreshCw size={16} />}
                          </button>
                          <button
                            onClick={() => handleDeleteDocument(doc.id)}
                            className="p-1 text-red-600 hover:text-red-700"
                            title="Delete"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {totalPages > 1 && (
                  <div className="flex items-center justify-between mt-3 sm:mt-4">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={page <= 1}
                      onClick={() => setPage(p => Math.max(1, p - 1))}
                      className="w-full sm:w-auto"
                    >
                      <ChevronLeft size={14} />
                      Previous
                    </Button>
                    <span className="text-xs sm:text-sm text-muted-foreground">
                      Page {page} of {totalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={page >= totalPages}
                      onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                      className="w-full sm:w-auto"
                    >
                      Next
                      <ChevronRight size={14} />
                    </Button>
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