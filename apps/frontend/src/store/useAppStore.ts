import { useState, useEffect } from 'react';
import { 
  INITIAL_QUERIES, 
  INITIAL_VALIDATION_QUEUE, 
  INITIAL_CITATIONS, 
  MOCK_USER_ROLES, 
  MedicalQuery, 
  ValidationQueueItem, 
  Citation, 
  MOCK_TRANSLATIONS 
} from '../data/mockData';

export type AppTab = 'query' | 'ai_response' | 'validation' | 'citations' | 'analytics' | 'history' | 'monorepo' | 'settings';

export interface AppState {
  currentTab: AppTab;
  darkMode: boolean;
  language: 'en' | 'am' | 'ar';
  currentUser: typeof MOCK_USER_ROLES[0];
  queries: MedicalQuery[];
  selectedQueryId: string;
  validationQueue: ValidationQueueItem[];
  citations: Citation[];
  searchQuery: string;
  selectedCategory: string;
  toastMessage: string | null;
}

// Simple singleton-like event emitter for React state sharing without external store dependencies
let globalState: AppState = {
  currentTab: 'query',
  darkMode: false,
  language: 'en',
  currentUser: MOCK_USER_ROLES[0],
  queries: INITIAL_QUERIES,
  selectedQueryId: INITIAL_QUERIES[0].id,
  validationQueue: INITIAL_VALIDATION_QUEUE,
  citations: INITIAL_CITATIONS,
  searchQuery: '',
  selectedCategory: 'All Categories',
  toastMessage: null,
};

let listeners: Array<() => void> = [];

function notify() {
  listeners.forEach(l => l());
}

export const appStore = {
  getState: () => globalState,
  
  setTab: (tab: AppTab) => {
    globalState = { ...globalState, currentTab: tab };
    notify();
  },
  
  toggleDarkMode: () => {
    const nextDark = !globalState.darkMode;
    globalState = { ...globalState, darkMode: nextDark };
    if (nextDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    notify();
  },
  
  setLanguage: (lang: 'en' | 'am' | 'ar') => {
    globalState = { ...globalState, language: lang };
    notify();
  },
  
  setCurrentUser: (roleId: string) => {
    const found = MOCK_USER_ROLES.find(r => r.id === roleId) || MOCK_USER_ROLES[0];
    globalState = { ...globalState, currentUser: found };
    notify();
  },
  
  addMedicalQuery: (queryText: string, category: any, urgency: any, patientContext: string) => {
    const newId = `query-${Date.now()}`;
    const newQuery: MedicalQuery = {
      id: newId,
      query: queryText,
      category: category as any,
      urgency: urgency as any,
      patientContext: patientContext || undefined,
      timestamp: new Date().toISOString(),
      confidenceScore: Math.floor(Math.random() * 15) + 85, // 85-99
      validationStatus: 'Pending Validation',
      sections: [
        {
          id: `sec-${newId}-1`,
          title: 'AI Clinical Synthesis (Draft)',
          content: `Based on current RAG retrieval for **${category}**, immediate clinical protocol dictates standard evidence-based assessment. Patient context noted: "${patientContext || 'None provided'}". Recommend verification against institutional guidelines.`,
          type: 'summary'
        },
        {
          id: `sec-${newId}-2`,
          title: 'Evidentiary Guidance & Precautions',
          content: `* Ensure baseline labs are evaluated.\n* Monitor vitals per ${urgency} protocol.\n* Verify potential drug-drug interactions in Pinecone vector index.`,
          type: 'clinical_guidance'
        }
      ],
      citations: [globalState.citations[0], globalState.citations[Math.floor(Math.random() * globalState.citations.length)]]
    };

    // Add to queries
    const updatedQueries = [newQuery, ...globalState.queries];
    
    // Add to validation queue
    const newQueueItem: ValidationQueueItem = {
      id: `vq-${Date.now()}`,
      queryId: newId,
      queryText: queryText,
      category: category,
      aiSummary: newQuery.sections[0].content,
      confidenceScore: newQuery.confidenceScore,
      submittedAt: newQuery.timestamp,
      assignedValidator: globalState.currentUser.name,
      status: 'Pending',
      discrepancyRisk: urgency === 'Emergency' ? 'High' : 'Low',
      citationsCount: newQuery.citations.length,
      ragSources: ['NileoPedia Live Vector Index', 'PubMed Central Ingestion']
    };

    globalState = { 
      ...globalState, 
      queries: updatedQueries,
      selectedQueryId: newId,
      validationQueue: [newQueueItem, ...globalState.validationQueue],
      currentTab: 'ai_response', // auto switch to view the response
      toastMessage: 'Medical query submitted successfully to AI RAG pipeline!'
    };
    notify();
    
    setTimeout(() => {
      appStore.clearToast();
    }, 4000);
  },

  validateQuery: (queryId: string, status: 'Validated' | 'Rejected' | 'Requires Revision', notes: string) => {
    // Update query
    const updatedQueries = globalState.queries.map(q => {
      if (q.id === queryId) {
        return {
          ...q,
          validationStatus: status,
          validatedBy: `${globalState.currentUser.name} (${globalState.currentUser.title})`,
          validatorNotes: notes
        };
      }
      return q;
    });

    // Update queue item
    const updatedQueue = globalState.validationQueue.map(vq => {
      if (vq.queryId === queryId) {
        return {
          ...vq,
          status: status === 'Validated' ? ('In Review' as const) : ('Flagged' as const)
        };
      }
      return vq;
    });

    globalState = {
      ...globalState,
      queries: updatedQueries,
      validationQueue: updatedQueue,
      toastMessage: `Query ${queryId} validation status updated to: ${status}`
    };
    notify();

    setTimeout(() => {
      appStore.clearToast();
    }, 4000);
  },

  setSelectedQuery: (id: string) => {
    globalState = { ...globalState, selectedQueryId: id, currentTab: 'ai_response' };
    notify();
  },

  setSearchQuery: (q: string) => {
    globalState = { ...globalState, searchQuery: q };
    notify();
  },

  setSelectedCategory: (cat: string) => {
    globalState = { ...globalState, selectedCategory: cat };
    notify();
  },

  showToast: (msg: string) => {
    globalState = { ...globalState, toastMessage: msg };
    notify();
    setTimeout(() => {
      appStore.clearToast();
    }, 4000);
  },

  clearToast: () => {
    globalState = { ...globalState, toastMessage: null };
    notify();
  },

  // i18n helper
  t: (key: string) => {
    const lang = globalState.language;
    return MOCK_TRANSLATIONS[lang]?.[key] || MOCK_TRANSLATIONS['en'][key] || key;
  }
};

export function useAppStore() {
  const [state, setState] = useState(globalState);

  useEffect(() => {
    const listener = () => setState(globalState);
    listeners.push(listener);
    return () => {
      listeners = listeners.filter(l => l !== listener);
    };
  }, []);

  return {
    ...state,
    ...appStore
  };
}
