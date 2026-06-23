'use client';

import React, { useState } from 'react';
import { AIResponse } from '../../types';
import { CheckCircle, Info, Bookmark, BookmarkPlus } from 'lucide-react';
import { api } from '../../lib/api';
import { useSettings } from '../../contexts/SettingsContext';

interface ResponseViewerProps {
  response: AIResponse;
  onSaveChange?: (isSaved: boolean) => void;
}

export const ResponseViewer: React.FC<ResponseViewerProps> = ({ response, onSaveChange }) => {
  const [isSaved, setIsSaved] = useState(response.isSaved || false);
  const [saveLoading, setSaveLoading] = useState(false);
  const { settings } = useSettings();

  const getSourceIndicator = () => {
    if (response.source === 'real') {
      return (
        <div className="flex items-center text-green-600 mb-4">
          <CheckCircle size={16} className="mr-2" />
          <span className="text-sm font-medium">AI Source: Real Knowledge Base</span>
        </div>
      );
    }
    return (
      <div className="flex items-center text-red-600 mb-4">
        <Info size={16} className="mr-2" />
        <span className="text-sm font-medium">AI Source: Unavailable</span>
      </div>
    );
  };

  const getMetadataDisplay = () => {
    if (response.source !== 'real') return null;

    return (
      <div className="bg-muted/30 rounded-lg p-4 mb-4 border border-border">
        <h3 className="text-sm font-semibold text-foreground mb-2">Knowledge Source</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
          <div>
            <span className="text-muted-foreground">Knowledge source:</span>
            <span className="ml-1 font-medium text-foreground">Real Knowledge Base</span>
          </div>
          <div>
            <span className="text-muted-foreground">Documents used:</span>
            <span className="ml-1 font-medium text-foreground">{response.documentsUsed ?? 0}</span>
          </div>
          <div>
            <span className="text-muted-foreground">Model:</span>
            <span className="ml-1 font-medium text-foreground">{response.model}</span>
          </div>
          <div>
            <span className="text-muted-foreground">Response time:</span>
            <span className="ml-1 font-medium text-foreground">
              {response.processingTime ? `${(response.processingTime / 1000).toFixed(1)}s` : 'N/A'}
            </span>
          </div>
        </div>
      </div>
    );
  };

  const handleSaveToggle = async () => {
    setSaveLoading(true);
    try {
      if (isSaved) {
        await api.unsaveResponse(response.queryId);
        setIsSaved(false);
      } else {
        await api.saveResponse(response.queryId);
        setIsSaved(true);
      }
      onSaveChange?.(isSaved);
    } catch (err) {
      console.error('Failed to update save status:', err);
    } finally {
      setSaveLoading(false);
    }
  };

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
    <div className="bg-card shadow-lg rounded-lg p-6 border border-border">
      <div className="flex justify-between items-center mb-2">
        <h2 className="text-xl font-semibold text-foreground">{response.title}</h2>
        <div className="flex items-center gap-2">
          {renderStatus()}
          <button
            onClick={handleSaveToggle}
            disabled={saveLoading}
            className={`p-2 rounded-lg transition-colors duration-300 ${isSaved ? 'text-primary bg-primary/10' : 'text-muted-foreground hover:text-primary hover:bg-muted'}`}
            title={isSaved ? 'Unsave response' : 'Save response'}
          >
            {isSaved ? <Bookmark size={20} /> : <BookmarkPlus size={20} />}
          </button>
        </div>
      </div>

      {getSourceIndicator()}
      {getMetadataDisplay()}

      {(response.status === 'pending' || response.status === 'approved' || response.status === 'rejected' || response.status === 'in_review') ? (
        <>
          <div className="mb-4">
            <h3 className="text-lg font-medium text-foreground mb-2">Summary</h3>
            <p className="text-foreground leading-relaxed">{response.summary}</p>
          </div>

          {response.keyFindings && response.keyFindings.length > 0 && (
            <div className="mb-4">
              <h3 className="text-lg font-medium text-foreground mb-2">Key Findings</h3>
              <ul className="list-disc list-inside text-foreground space-y-1">
                {response.keyFindings.map((finding, index) => (
                  <li key={index}>{finding}</li>
                ))}
              </ul>
            </div>
          )}

          {response.detailedExplanation && (
            <div className="mb-4">
              <h3 className="text-lg font-medium text-foreground mb-2">Detailed Explanation</h3>
              <p className="text-foreground leading-relaxed">{response.detailedExplanation}</p>
            </div>
          )}

          {settings.citationEnabled && response.citations && response.citations.length > 0 && (
            <div className="mb-4">
              <h3 className="text-lg font-medium text-foreground mb-2">Citations</h3>
              <ul className="list-decimal list-inside text-foreground space-y-2">
                {response.citations.map((citation, index) => (
                  <li key={index}>
                    <div className="flex flex-col">
                      <span className="font-medium">{citation.title}</span>
                      <span className="text-sm text-muted-foreground">
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

          <div className="flex items-center text-sm text-muted-foreground mt-4">
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