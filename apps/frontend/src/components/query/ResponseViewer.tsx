import React from 'react';
import { Card, CardContent } from '../ui/Card';
import { AIResponse } from '../../types';
import { ValidationBadge } from './ValidationBadge';
import { Bot, Clock, Target, FileText } from 'lucide-react';

interface ResponseViewerProps {
  response: AIResponse;
}

export const ResponseViewer: React.FC<ResponseViewerProps> = ({ response }) => {
  return (
    <div className="space-y-6">
      {/* Metadata bar */}
      <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/50 px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700">
        <div className="flex items-center gap-1.5">
          <Bot size={14} className="text-blue-600 dark:text-blue-400" />
          <span className="font-medium text-slate-700 dark:text-slate-300">AI Generated</span>
        </div>
        <span className="text-slate-300 dark:text-slate-600">|</span>
        <span>{response.model}</span>
        <span className="text-slate-300 dark:text-slate-600">|</span>
        <span>Confidence Score: <span className="font-medium text-emerald-600 dark:text-emerald-400">{response.confidenceScore}%</span></span>
        <span className="text-slate-300 dark:text-slate-600">|</span>
        <div className="flex items-center gap-1.5">
          <Clock size={14} className="text-slate-400 dark:text-slate-500" />
          <span>Generated: {response.generatedAt}</span>
        </div>
      </div>

      {/* Summary */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-2 mb-3">
            <Target size={18} className="text-blue-600 dark:text-blue-400" />
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-50">Summary</h3>
          </div>
          <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-4">{response.summary}</p>
          <ol className="list-decimal list-inside space-y-2 text-slate-700 dark:text-slate-300">
            {response.keyFindings.map((finding, index) => (
              <li key={index} className="leading-relaxed">{finding}</li>
            ))}
          </ol>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-4">
            These recommendations are supported by latest guidelines from ADA 2024, EASD 2023, and IDF 2023.
          </p>
        </CardContent>
      </Card>

      {/* Detailed Explanation */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-2 mb-3">
            <FileText size={18} className="text-blue-600 dark:text-blue-400" />
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-50">Detailed Explanation</h3>
          </div>
          <div className="prose prose-slate dark:prose-invert max-w-none">
            {response.detailedExplanation.split('\n\n').map((paragraph, index) => (
              <p key={index} className="text-slate-700 dark:text-slate-300 leading-relaxed mb-4 last:mb-0">
                {paragraph.split('\n').map((line, lineIndex) => (
                  <span key={lineIndex}>
                    {line}
                    {lineIndex < paragraph.split('\n').length - 1 && <br />}
                  </span>
                ))}
              </p>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Status bar */}
      <div className="bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg p-4 flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm text-slate-600 dark:text-slate-400">Status:</span>
            <ValidationBadge status={response.status} />
          </div>
          {response.assignedTo && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-slate-600 dark:text-slate-400">Assigned to:</span>
              <span className="text-sm font-medium text-slate-900 dark:text-slate-100">{response.assignedTo}</span>
            </div>
          )}
          {response.dueDate && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-slate-600 dark:text-slate-400">Due:</span>
              <span className="text-sm font-medium text-slate-900 dark:text-slate-100">{response.dueDate}</span>
            </div>
          )}
        </div>
        <button className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors">
          View in Review Queue
        </button>
      </div>
    </div>
  );
};
