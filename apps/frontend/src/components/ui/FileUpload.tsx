import React, { useCallback, useState } from 'react';
import { Upload, FileText, X, AlertCircle } from 'lucide-react';
import { cn } from '../../utils/cn';

interface FileUploadProps {
  onUpload: (files: File[]) => void;
  accept?: string;
  multiple?: boolean;
  maxSizeMB?: number;
  className?: string;
}

export const FileUpload: React.FC<FileUploadProps> = ({
  onUpload,
  accept = '.pdf,.doc,.docx,.txt',
  multiple = false,
  maxSizeMB = 10,
  className,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const validateFiles = useCallback((files: FileList) => {
    const fileArray = Array.from(files);
    const invalidFiles = fileArray.filter(f => f.size > maxSizeMB * 1024 * 1024);
    
    if (invalidFiles.length > 0) {
      setError(`File(s) exceed ${maxSizeMB}MB limit`);
      return null;
    }
    
    if (!multiple && fileArray.length > 1) {
      setError('Only one file allowed');
      return null;
    }

    setError(null);
    return fileArray;
  }, [maxSizeMB, multiple]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = validateFiles(e.dataTransfer.files);
    if (files) onUpload(files);
  }, [validateFiles, onUpload]);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = validateFiles(e.target.files);
    if (files) onUpload(files);
  }, [validateFiles, onUpload]);

  return (
    <div
      className={cn(
        'border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-lg p-6 text-center transition-all',
        isDragging && 'border-blue-500 bg-blue-50/50 dark:bg-blue-900/20',
        className
      )}
      onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={handleDrop}
    >
      <input
        type="file"
        id="file-upload"
        className="hidden"
        accept={accept}
        multiple={multiple}
        onChange={handleFileSelect}
      />
      <label htmlFor="file-upload" className="cursor-pointer">
        <Upload className="mx-auto h-12 w-12 text-slate-400 mb-4" />
        <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
          Drop files here or click to upload
        </p>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          PDF, DOC, DOCX, TXT (max {maxSizeMB}MB{multiple ? ' each' : ''})
        </p>
      </label>
      {error && (
        <div className="mt-3 flex items-center justify-center gap-2 text-red-600">
          <AlertCircle size={16} />
          <span className="text-sm">{error}</span>
        </div>
      )}
    </div>
  );
};

interface FilePreviewProps {
  file: File;
  onRemove?: () => void;
}

export const FilePreview: React.FC<FilePreviewProps> = ({ file, onRemove }) => {
  return (
    <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
      <FileText className="h-8 w-8 text-blue-600 flex-shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-slate-900 dark:text-slate-100 truncate">{file.name}</p>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          {(file.size / 1024 / 1024).toFixed(2)} MB
        </p>
      </div>
      {onRemove && (
        <button
          onClick={onRemove}
          className="p-1 text-slate-400 hover:text-red-600 rounded"
        >
          <X size={16} />
        </button>
      )}
    </div>
  );
};