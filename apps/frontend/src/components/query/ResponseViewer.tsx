'use client';

import React from 'react';
import { AIResponse } from '../../types';
import { CheckCircle, Info } from 'lucide-react';

interface ResponseViewerProps {
  response: AIResponse;
}

export const ResponseViewer: React.FC<ResponseViewerProps> = ({ response }) => {
  if (!response) {
    return null;
  }

  const getConfidenceColor = (score: number) => {
    if (score >= 0.9) return 'text-green-600';
    if (score >= 0.7) return 'text-lime-600';
    if (score >= 0.5) return 'text-amber-600';
    return 'text-red-600';
  };

  const renderStatus = () => {
    if (response.status === 'pending' || response.status === 'in_review') {
      return (
        <div className="flex items-center text-blue-500">
          <Info size={18} className="mr-2" />
          <span>Processing...</span>
        </div>
      );
    } else if (response.status === 'approved') {
      return (
        <div className="flex items-center text-green-500">
          <CheckCircle size={18} className="mr-2" />
          <span>Approved</span>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white dark:bg-slate-800 shadow-lg rounded-lg p-6 border border-slate-200 dark:border-slate-700">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-50">{response.title}</h2>
        {renderStatus()}
      </div>

      {(response.status === 'pending' || response.status === 'approved' || response.status === 'rejected' || response.status === 'in_review') ? (
        <>
          <div className="mb-4">
            <h3 className="text-lg font-medium text-slate-800 dark:text-slate-100 mb-2">Summary</h3>
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed">{response.summary}</p>
          </div>

          {response.keyFindings && response.keyFindings.length > 0 && (
            <div className="mb-4">
              <h3 className="text-lg font-medium text-slate-800 dark:text-slate-100 mb-2">Key Findings</h3>
              <ul className="list-disc list-inside text-slate-700 dark:text-slate-300 space-y-1">
                {response.keyFindings.map((finding, index) => (
                  <li key={index}>{finding}</li>
                ))}
              </ul>
            </div>
          )}

          {response.detailedExplanation && (
            <div className="mb-4">
              <h3 className="text-lg font-medium text-slate-800 dark:text-slate-100 mb-2">Detailed Explanation</h3>
              <p className="text-slate-700 dark:text-slate-300 leading-relaxed">{response.detailedExplanation}</p>
            </div>
          )}

          {response.citations && response.citations.length > 0 && (
            <div className="mb-4">
              <h3 className="text-lg font-medium text-slate-800 dark:text-slate-100 mb-2">Citations</h3>
              <ul className="list-decimal list-inside text-slate-700 dark:text-slate-300 space-y-2">
                {response.citations.map((citation, index) => (
                  <li key={index}>
                    <div className="flex flex-col">
                      <span className="font-medium">{citation.title}</span>
                      <span className="text-sm text-slate-500">
                        {citation.authors && <span>Authors: {citation.authors}</span>}
                        {citation.publicationYear && <span> ({citation.publicationYear})</span>}
                        {citation.doi && <span> • DOI: {citation.doi}</span>}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="flex items-center text-sm text-slate-600 dark:text-slate-400 mt-4">
            <span className="mr-2">Confidence Score:</span>
            <span className={`font-semibold ${getConfidenceColor(response.confidenceScore)}`}>
              {(response.confidenceScore * 100).toFixed(0)}%
            </span>
            <span className="ml-4">Model: {response.model}</span>
            <span className="ml-4">Generated At: {new Date(response.generatedAt).toLocaleString()}</span>
          </div>
        </>
      ) : null}
    </div>
  );
};