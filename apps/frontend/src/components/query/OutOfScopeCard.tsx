'use client';

import React from 'react';
import { AIResponse } from '../../types';
import { Card, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Ban, Globe2, Stethoscope, ArrowRight, BookOpen, MessageSquare } from 'lucide-react';

interface OutOfScopeCardProps {
  response: AIResponse;
  onSuggestionClick?: (question: string) => void;
  onAskAnother?: () => void;
  onBrowseTopics?: () => void;
}

const SUGGESTED_QUESTIONS = [
  'What is hypertension?',
  'Symptoms of malaria',
  'What causes diabetes?',
  'Treatment of asthma',
  'Side effects of metformin',
];

const MEDICAL_TOPICS = [
  { label: 'Diseases', icon: '🦠' },
  { label: 'Medicines', icon: '💊' },
  { label: 'Biology', icon: '🧬' },
  { label: 'Cardiology', icon: '🫀' },
  { label: 'Infectious Diseases', icon: '🦠' },
  { label: 'Neurology', icon: '🧠' },
  { label: 'Laboratory Medicine', icon: '🧪' },
  { label: 'Clinical Guidelines', icon: '🏥' },
  { label: 'Pharmacology', icon: '💉' },
  { label: 'Radiology', icon: '🩻' },
  { label: 'Public Health', icon: '⚕' },
];

export const OutOfScopeCard: React.FC<OutOfScopeCardProps> = ({
  response,
  onSuggestionClick,
  onAskAnother,
  onBrowseTopics,
}) => {
  const examples = response.examples || SUGGESTED_QUESTIONS;

  const handleSuggestion = (question: string) => {
    if (onSuggestionClick) {
      onSuggestionClick(question);
    }
  };

  return (
    <div className="animate-in fade-in duration-500 ease-out">
      <Card className="border-blue-200 dark:border-blue-800 bg-blue-50/50 dark:bg-blue-950/20">
        <CardContent className="p-6 sm:p-8">
          <div className="flex flex-col items-center text-center max-w-2xl mx-auto">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center mb-4 sm:mb-6">
              <Ban className="w-8 h-8 sm:w-10 sm:h-10 text-blue-600 dark:text-blue-400" />
            </div>

            <Badge variant="info" className="mb-3 sm:mb-4">
              Medical Scope Only
            </Badge>

            <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-2 sm:mb-3">
              {response.title || 'Question Outside Medical Scope'}
            </h2>

            <p className="text-sm sm:text-base text-muted-foreground mb-4 sm:mb-6">
              {response.message || 'The question you asked is outside NileoPedia\'s supported medical knowledge base.'}
            </p>

            <div className="w-full bg-blue-100 dark:bg-blue-900/30 rounded-lg p-4 sm:p-6 mb-4 sm:mb-6 text-left">
              <div className="flex items-start gap-2 sm:gap-3">
                <Stethoscope className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="text-sm sm:text-base font-semibold text-foreground mb-2">
                    We currently answer evidence-based questions related to:
                  </h3>
                  <div className="flex flex-wrap gap-1.5 sm:gap-2">
                    {MEDICAL_TOPICS.map((topic) => (
                      <span
                        key={topic.label}
                        className="inline-flex items-center gap-1 px-2 py-1 sm:px-2.5 sm:py-1.5 bg-white dark:bg-blue-950/50 rounded-md text-xs sm:text-sm text-blue-800 dark:text-blue-200 border border-blue-200 dark:border-blue-800"
                      >
                        <span>{topic.icon}</span>
                        <span>{topic.label}</span>
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {response.recommendation && (
              <p className="text-xs sm:text-sm text-muted-foreground mb-4 sm:mb-6 italic">
                {response.recommendation}
              </p>
            )}

            <div className="w-full mb-4 sm:mb-6">
              <h3 className="text-xs sm:text-sm font-semibold text-foreground mb-2 sm:mb-3 flex items-center gap-2">
                <MessageSquare className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                Suggested Questions
              </h3>
              <div className="flex flex-col gap-1.5 sm:gap-2">
                {examples.map((example, index) => (
                  <button
                    key={index}
                    onClick={() => handleSuggestion(example)}
                    className="w-full text-left px-3 py-2 sm:px-4 sm:py-2.5 bg-white dark:bg-blue-950/30 hover:bg-blue-100 dark:hover:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-lg text-xs sm:text-sm text-blue-900 dark:text-blue-100 transition-colors duration-200 flex items-center gap-2 group"
                  >
                    <span className="text-blue-500 dark:text-blue-400 group-hover:translate-x-0.5 transition-transform">
                      <ArrowRight className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                    </span>
                    {example}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 w-full">
              <Button
                onClick={onAskAnother}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
              >
                <MessageSquare className="w-4 h-4 mr-2" />
                Ask Another Question
              </Button>
              <Button
                variant="outline"
                onClick={onBrowseTopics}
                className="flex-1 border-blue-300 dark:border-blue-700 text-blue-700 dark:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-950/30"
              >
                <BookOpen className="w-4 h-4 mr-2" />
                Browse Medical Topics
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default OutOfScopeCard;
