import React, { useState } from 'react';
import { Button } from '../ui/Button';
import { TextArea } from '../ui/Input';
import { Send, Loader2 } from 'lucide-react';

interface QueryInputProps {
  onSubmit: (query: string) => void;
  loading?: boolean;
}

export const QueryInput: React.FC<QueryInputProps> = ({ onSubmit, loading }) => {
  const [query, setQuery] = useState('');

  const handleSubmit = () => {
    if (query.trim() && !loading) {
      onSubmit(query.trim());
      setQuery('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
    // Shift+Enter allows new line (default textarea behavior)
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-slate-900 mb-4">Ask a Medical Question</h2>
      <TextArea
        placeholder="Enter your medical question or topic... (e.g., What are the latest guidelines for managing hypertension in elderly patients?)"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyDown={handleKeyDown}
        rows={4}
        className="mb-4"
      />
      <div className="flex items-center justify-between">
        <p className="text-xs text-slate-400">Press Enter to submit, Shift+Enter for new line</p>
        <Button
          onClick={handleSubmit}
          disabled={!query.trim() || loading}
          className="gap-2"
        >
          {loading ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              Generating Response...
            </>
          ) : (
            <>
              <Send size={16} />
              Submit Query
            </>
          )}
        </Button>
      </div>
    </div>
  );
};
