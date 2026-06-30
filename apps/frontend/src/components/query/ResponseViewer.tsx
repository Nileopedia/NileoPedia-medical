'use client';

import React, { useState, useCallback } from 'react';
import { AIResponse } from '../../types';
import { CheckCircle, Info, Bookmark, BookmarkPlus, Copy, Share2, FileText, FileDown, Brain } from 'lucide-react';
import { api } from '../../lib/api';
import { useSettings } from '../../contexts/SettingsContext';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';

interface ResponseViewerProps {
  response: AIResponse;
  onSaveChange?: (isSaved: boolean) => void;
}

type SectionKey = 'treatmentGoals' | 'lifestyle' | 'medications' | 'monitoring';

const SECTION_LABELS: Record<SectionKey, string> = {
  treatmentGoals: 'Treatment Goals',
  lifestyle: 'Lifestyle Changes',
  medications: 'Medication Strategies',
  monitoring: 'Monitoring',
};

export const ResponseViewer: React.FC<ResponseViewerProps> = ({ response, onSaveChange }) => {
  const [isSaved, setIsSaved] = useState(response.isSaved || false);
  const [saveLoading, setSaveLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [openSection, setOpenSection] = useState<SectionKey | null>(null);
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
    if (response.source === 'no_results') {
      return (
        <div className="flex items-center text-amber-600 mb-4">
          <Info size={16} className="mr-2" />
          <span className="text-sm font-medium">No Retrieval Results</span>
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

  const handleCopy = useCallback(async () => {
    const text = [
      response.summary,
      ...response.keyRecommendations.map(r => `✓ ${r}`),
      ...Object.entries(response.sections).flatMap(([k, v]) => v ? [`\n## ${k}\n${v}`] : []),
    ].join('\n');

    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // silently fail
    }
  }, [response]);

  const handleExportPDF = useCallback(() => {
    window.print();
  }, []);

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

  const sectionEntries = Object.entries(response.sections).filter(([, v]) => v && v.trim().length > 0) as [SectionKey, string][];

  return (
    <div className="bg-card shadow-lg rounded-lg border border-border">
      <div className="p-6 border-b border-border">
        <div className="flex justify-between items-start mb-2">
          <div className="flex-1 mr-4">
            <h2 className="text-xl font-semibold text-foreground mb-1">Response</h2>
            <p className="text-sm text-muted-foreground">
              <span className="font-medium text-foreground">Question:</span> &ldquo;{response.title}&rdquo;
            </p>
          </div>
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
      </div>

      <div className="p-6 space-y-6">
        {getSourceIndicator()}

        {response.source === 'real' && (
          <div className="bg-muted/30 rounded-lg p-4 border border-border">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground block text-xs">AI Source</span>
                <span className="font-medium text-foreground">Real Knowledge Base</span>
              </div>
              <div>
                <span className="text-muted-foreground block text-xs">Confidence</span>
                <span className={`font-semibold ${getConfidenceColor(response.confidenceScore)}`}>
                  {(response.confidenceScore * 100).toFixed(0)}%
                </span>
              </div>
              <div>
                <span className="text-muted-foreground block text-xs">Documents Used</span>
                <span className="font-medium text-foreground">{response.documentsUsed ?? 0}</span>
              </div>
              <div>
                <span className="text-muted-foreground block text-xs">Response Time</span>
                <span className="font-medium text-foreground">
                  {response.processingTime ? `${(response.processingTime / 1000).toFixed(1)}s` : 'N/A'}
                </span>
              </div>
            </div>
            <div className="mt-2 text-xs text-muted-foreground">
              Generated: {new Date(response.generatedAt).toLocaleString()}
            </div>
          </div>
        )}

        <Card padding="md">
          <CardHeader>
            <CardTitle>Clinical Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-foreground leading-relaxed">{response.summary}</p>
          </CardContent>
        </Card>

        {response.keyRecommendations.length > 0 && (
          <Card padding="md">
            <CardHeader>
              <CardTitle>Key Recommendations</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {response.keyRecommendations.map((rec, idx) => (
                  <li key={idx} className="flex items-start">
                    <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 mr-3 mt-0.5 shrink-0 text-xs font-bold">✓</span>
                    <span className="text-foreground">{rec}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}

        {sectionEntries.length > 0 && (
          <div className="space-y-2">
            <h3 className="text-lg font-medium text-foreground">Detailed Explanation</h3>
            {sectionEntries.map(([key, content]) => (
              <details
                key={key}
                open={openSection === key}
                onToggle={(e) => setOpenSection(e.currentTarget.open ? key : null)}
                className="group bg-muted/20 border border-border rounded-lg"
              >
                <summary className="px-4 py-3 cursor-pointer select-none flex items-center justify-between text-sm font-medium text-foreground hover:bg-muted/40 transition-colors">
                  {SECTION_LABELS[key] || key}
                  <span className="text-xs text-muted-foreground">{openSection === key ? '−' : '+'}</span>
                </summary>
                <div className="px-4 pb-4 pt-1 text-sm text-foreground leading-relaxed">
                  {content}
                </div>
              </details>
            ))}
          </div>
        )}

        {settings.citationEnabled && response.citations && response.citations.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-lg font-medium text-foreground">Evidence & Citations</h3>
            {response.citations.map((citation, index) => (
              <Card key={index} padding="sm">
                <CardContent className="pt-0">
                  <div className="flex flex-col space-y-1">
                    <span className="font-medium text-foreground">{citation.title}</span>
                    {(citation.authors || citation.journal || citation.year || citation.doi) && (
                      <div className="text-xs text-muted-foreground space-y-0.5">
                        {citation.authors && <p>Authors: {citation.authors}</p>}
                        {citation.journal && <p>{citation.journal}</p>}
                        {citation.year && <p>{citation.year}</p>}
                        {citation.doi && <p>DOI: {citation.doi}</p>}
                      </div>
                    )}
                    <div className="mt-1">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100">
                        {(response.confidenceScore * 100).toFixed(0)}% confidence
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <div className="flex items-center text-xs text-muted-foreground pt-2 border-t border-border">
          <Brain size={14} className="mr-1" />
          Model: {response.model}
          <span className="mx-2">•</span>
          Confidence: <span className={`font-semibold ${getConfidenceColor(response.confidenceScore)} ml-1`}>{(response.confidenceScore * 100).toFixed(0)}%</span>
        </div>
      </div>

      <div className="px-6 py-4 border-t border-border flex flex-wrap items-center gap-2">
        <button
          onClick={handleSaveToggle}
          disabled={saveLoading}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm border border-border hover:bg-muted transition-colors"
        >
          {isSaved ? <Bookmark size={14} /> : <BookmarkPlus size={14} />}
          {isSaved ? 'Saved' : 'Save'}
        </button>
        <button type="button" className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm border border-border hover:bg-muted transition-colors">
          <Share2 size={14} />
          Share
        </button>
        <button onClick={handleCopy} type="button" className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm border border-border hover:bg-muted transition-colors">
          <Copy size={14} />
          {copied ? 'Copied' : 'Copy'}
        </button>
        <button type="button" className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm border border-border hover:bg-muted transition-colors">
          <FileText size={14} />
          Follow-up
        </button>
        <button onClick={handleExportPDF} type="button" className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm border border-border hover:bg-muted transition-colors">
          <FileDown size={14} />
          Export PDF
        </button>
      </div>
    </div>
  );
};