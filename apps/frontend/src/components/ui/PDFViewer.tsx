import React from 'react';
import { FileText, Download, ExternalLink } from 'lucide-react';

interface PDFViewerProps {
  documentId: string;
  title?: string;
  onDownload?: () => void;
  className?: string;
}

export const PDFViewer: React.FC<PDFViewerProps> = ({ documentId, title, onDownload, className }) => {
  const pdfUrl = `/api/v1/documents/${documentId}/download`;

  return (
    <div className={className}>
      <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm">
        <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-3">
            <FileText className="h-6 w-6 text-blue-600" />
            <h3 className="font-semibold text-slate-900 dark:text-slate-100">{title || 'Document Viewer'}</h3>
          </div>
          <div className="flex gap-2">
            {onDownload && (
              <button
                onClick={onDownload}
                className="p-2 text-slate-500 hover:text-blue-600 rounded-lg transition-colors"
                title="Download"
              >
                <Download size={18} />
              </button>
            )}
            <a
              href={pdfUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 text-slate-500 hover:text-blue-600 rounded-lg transition-colors"
              title="Open in new tab"
            >
              <ExternalLink size={18} />
            </a>
          </div>
        </div>
        <div className="p-4">
          <iframe
            src={pdfUrl}
            className="w-full h-96 rounded-lg border border-slate-200 dark:border-slate-700"
            title={title || 'PDF Document'}
          />
        </div>
      </div>
    </div>
  );
};

interface DocumentListProps {
  documents: Array<{ id: string; title: string; status: string; createdAt: string }>;
  onSelect: (documentId: string) => void;
}

export const DocumentList: React.FC<DocumentListProps> = ({ documents, onSelect }) => {
  return (
    <div className="space-y-3">
      {documents.map((doc) => (
        <button
          key={doc.id}
          onClick={() => onSelect(doc.id)}
          className="w-full flex items-center gap-4 p-4 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-700 transition-all"
        >
          <FileText className="h-8 w-8 text-blue-600 flex-shrink-0" />
          <div className="flex-1 text-left">
            <p className="font-medium text-slate-900 dark:text-slate-100">{doc.title}</p>
            <p className="text-sm text-slate-500 dark:text-slate-400">Uploaded {doc.createdAt}</p>
          </div>
          <span className={`px-2 py-1 text-xs font-medium rounded ${
            doc.status === 'processed' ? 'bg-emerald-100 text-emerald-700' :
            doc.status === 'error' ? 'bg-red-100 text-red-700' :
            'bg-amber-100 text-amber-700'
          }`}>
            {doc.status}
          </span>
        </button>
      ))}
    </div>
  );
};