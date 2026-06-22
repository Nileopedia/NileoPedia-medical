import React from 'react';
import { Card, CardContent } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Citation } from '../../types';

interface CitationPanelProps {
  citations: Citation[];
}

const getTypeBadgeVariant = (type: Citation['type']) => {
  switch (type) {
    case 'Guideline':
      return 'info';
    case 'Review':
      return 'default';
    case 'Expert Opinion':
      return 'outline';
    case 'Study':
      return 'default';
  }
};

export const CitationPanel: React.FC<CitationPanelProps> = ({ citations }) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-foreground">Citations ({citations.length})</h3>
      </div>
      <div className="space-y-3">
        {citations.map((citation, index) => (
          <Card key={citation.id} padding="sm" className="hover:shadow-md transition-shadow cursor-pointer">
            <CardContent>
              <div className="flex items-start gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-muted rounded-full flex items-center justify-center text-xs font-medium text-muted-foreground">
                  {index + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-medium text-foreground mb-1 line-clamp-2">{citation.title}</h4>
                  <p className="text-xs text-muted-foreground mb-2">
                    {citation.journal}{citation.volume ? `, ${citation.volume}` : ''}{citation.pages ? `:${citation.pages}` : ''}.
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    <Badge variant={getTypeBadgeVariant(citation.type)}>{citation.type}</Badge>
                    {citation.organization && (
                      <Badge variant="outline">{citation.organization}</Badge>
                    )}
                    <Badge variant="outline">{citation.year}</Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      <button className="w-full py-2.5 text-sm text-primary hover:text-primary/80 font-medium border border-border rounded-lg hover:bg-muted transition-colors">
        View all citations
      </button>
    </div>
  );
};
