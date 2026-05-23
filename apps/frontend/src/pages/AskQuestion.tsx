import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { QueryInput } from '../components/query/QueryInput';
import { ResponseViewer } from '../components/query/ResponseViewer';
import { CitationPanel } from '../components/query/CitationPanel';
import { Badge } from '../components/ui/Badge';
import { mockResponse } from '../data/mockData';
import { ChevronRight, Bookmark, Share2 } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../components/ui/Tabs';

export const AskQuestion: React.FC = () => {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (_query: string) => {
    setLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 2000));
    setLoading(false);
    setSubmitted(true);
  };

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm">
        <Link to="/" className="text-blue-600 hover:text-blue-700 font-medium">
          Ask a Question
        </Link>
        <ChevronRight size={14} className="text-slate-400" />
        <span className="text-slate-500">Response</span>
      </nav>

      {!submitted ? (
        <QueryInput onSubmit={handleSubmit} loading={loading} />
      ) : (
        <>
          {/* Question header */}
          <div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-slate-50 mb-4">{mockResponse.title}</h1>
            <div className="flex flex-wrap gap-2">
              {mockResponse.tags.map((tag) => (
                <Badge key={tag} variant="outline">
                  {tag}
                </Badge>
              ))}
              <button className="text-sm text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 flex items-center gap-1">
                + Follow-up
              </button>
            </div>
          </div>

          {/* Main content */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Response */}
            <div className="lg:col-span-2">
              <Tabs defaultValue="response" className="w-full">
                <TabsList>
                  <TabsTrigger value="response">AI Response</TabsTrigger>
                  <TabsTrigger value="keypoints">Key Points</TabsTrigger>
                </TabsList>
                <TabsContent value="response">
                  <ResponseViewer response={mockResponse} />
                </TabsContent>
                <TabsContent value="keypoints">
                  <div className="bg-white rounded-xl border border-slate-200 p-6">
                    <h3 className="text-lg font-semibold text-slate-900 mb-4">Key Points</h3>
                    <ul className="space-y-3">
                      {mockResponse.keyFindings.map((finding, index) => (
                        <li key={index} className="flex items-start gap-3">
                          <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-medium">
                            {index + 1}
                          </span>
                          <span className="text-slate-700">{finding}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </TabsContent>
              </Tabs>

              {/* Action buttons */}
              <div className="flex items-center gap-3 mt-6">
                <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors">
                  <Bookmark size={16} />
                  Save
                </button>
                <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors">
                  <Share2 size={16} />
                  Share
                </button>
              </div>
            </div>

            {/* Citations sidebar */}
            <div className="lg:col-span-1">
              <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5 sticky top-24">
                <Tabs defaultValue="citations" className="w-full">
                  <TabsList className="mb-4">
                    <TabsTrigger value="citations" className="px-3 py-2">
                      Citations ({mockResponse.citations.length})
                    </TabsTrigger>
                    <TabsTrigger value="sources" className="px-3 py-2">Sources</TabsTrigger>
                    <TabsTrigger value="related" className="px-3 py-2">Related</TabsTrigger>
                  </TabsList>
                  <TabsContent value="citations" className="mt-0">
                    <CitationPanel citations={mockResponse.citations} />
                  </TabsContent>
                  <TabsContent value="sources" className="mt-0">
                    <p className="text-sm text-slate-500">Source information coming soon.</p>
                  </TabsContent>
                  <TabsContent value="related" className="mt-0">
                    <p className="text-sm text-slate-500">Related queries coming soon.</p>
                  </TabsContent>
                </Tabs>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
