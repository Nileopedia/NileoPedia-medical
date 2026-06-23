const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors({ origin: 'http://localhost:3000', credentials: true }));
app.use(express.json());

// Mock JWT token
const mockToken = 'mock-jwt-token-' + Date.now();

// Auth endpoints
app.post('/api/v1/auth/login', (req, res) => {
  const { email, password } = req.body;
  if (email && password) {
    res.json({
      success: true,
      data: {
        accessToken: mockToken,
        refreshToken: mockToken,
        user: {
          id: '1',
          fullName: email.split('@')[0],
          email,
          role: 'MEDICAL_USER',
        },
      },
    });
  } else {
    res.status(400).json({ success: false, message: 'Invalid credentials' });
  }
});

app.post('/api/v1/auth/register', (req, res) => {
  const { fullName, email, password } = req.body;
  if (fullName && email && password) {
    res.json({
      success: true,
      data: {
        accessToken: mockToken,
        refreshToken: mockToken,
        user: {
          id: '2',
          fullName,
          email,
          role: 'MEDICAL_USER',
        },
      },
    });
  } else {
    res.status(400).json({ success: false, message: 'Missing required fields' });
  }
});

// Questions endpoints
app.post('/api/v1/questions/ask', (req, res) => {
   const { question } = req.body;
   if (question) {
     res.json({
       success: true,
       data: {
         questionId: 'q-' + Date.now(),
         status: 'pending',
         message: 'Question submitted',
       },
     });
   } else {
     res.status(400).json({ success: false, message: 'Question required' });
   }
 });

 app.get('/api/v1/questions/:id', (req, res) => {
   const { id } = req.params;
   res.json({
     success: true,
     data: {
       id,
       questionText: 'What are hypertension guidelines?',
       createdAt: new Date().toISOString(),
       aiResponse: {
         id: `resp-${id}`,
         validationStatus: 'APPROVED',
         summary: 'Latest guidelines recommend managing blood pressure with lifestyle modifications and medications as needed. Target BP <130/80 mmHg for most patients.',
         detailedExplanation: 'Evidence-based hypertension management includes thiazide diuretics, calcium channel blockers, ACE inhibitors, or ARBs as first-line therapy. Lifestyle modifications such as DASH diet, sodium restriction, and regular exercise are fundamental.',
         keyFindings: ['Lifestyle changes: diet, exercise, sodium reduction', 'First-line medications: ACE inhibitors, ARBs, thiazides', 'Regular monitoring essential for control'],
         confidenceScore: 0.92,
         generatedBy: 'Llama-3.3-70b (mock)',
         createdAt: new Date().toISOString(),
         citations: [
           { id: 'c1', title: 'Hypertension Guidelines 2023', source: 'PubMed', authors: 'Smith et al.', publicationYear: 2023 },
           { id: 'c2', title: 'JAMA Hypertension Study', source: 'NEJM', authors: 'Jones et al.', publicationYear: 2022 },
         ],
       },
     },
   });
 });

app.get('/api/v1/questions/history', (req, res) => {
   res.json({
     success: true,
     data: [
       {
         id: '1',
         questionText: 'What are hypertension guidelines?',
         createdAt: new Date().toISOString(),
         aiResponse: {
           validationStatus: 'APPROVED',
           summary: 'Latest guidelines recommend managing blood pressure with lifestyle modifications and medications as needed. Target BP <130/80 mmHg for most patients.',
           keyFindings: ['Lifestyle changes: diet, exercise, sodium reduction', 'First-line medications: ACE inhibitors, ARBs, thiazides', 'Regular monitoring essential for control'],
           detailedExplanation: 'Evidence-based hypertension management includes thiazide diuretics, calcium channel blockers, ACE inhibitors, or ARBs as first-line therapy. Lifestyle modifications such as DASH diet, sodium restriction, and regular exercise are fundamental.',
           confidenceScore: 0.92,
           generatedBy: 'Llama-3.3-70b (mock)',
           citations: [
             { id: 'c1', title: 'Hypertension Guidelines 2023', source: 'PubMed', authors: 'Smith et al.', publicationYear: 2023 },
             { id: 'c2', title: 'JAMA Hypertension Study', source: 'NEJM', authors: 'Jones et al.', publicationYear: 2022 },
           ],
         },
       },
     ],
   });
 });

 app.get('/api/v1/search', (req, res) => {
  const { q, type = 'hybrid', limit = '10', page = '1' } = req.query;
  
  const mockResults = Array.from({ length: 5 }, (_, i) => ({
    id: `search-result-${i + 1}`,
    title: `${q} - Medical Reference ${i + 1}`,
    snippet: `Evidence-based medical information related to "${q}". Peer-reviewed findings from clinical studies.`,
    source: ['PubMed Central', 'NEJM', 'The Lancet', 'JAMA', 'Circulation'][i],
    relevanceScore: 0.9 - (i * 0.03),
    specialty: ['general', 'cardiology', 'endocrinology', 'oncology', 'neurology'][i],
    documentType: 'GUIDELINE',
  }));

  res.json({
    success: true,
    data: {
      query: q as string,
      results: mockResults.slice(0, parseInt(limit as string)),
      pagination: {
        total: mockResults.length,
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        totalPages: Math.ceil(mockResults.length / parseInt(limit as string)),
      },
      searchType: type as string,
    },
  });
});

app.get('/api/v1/notifications', (req, res) => {
  res.json({
    success: true,
    data: [
      { id: '1', title: 'System Update', message: 'New medical guidelines available', read: false, createdAt: new Date().toISOString() },
    ],
  });
});

app.get('/api/v1/validation/pending', (req, res) => {
  res.json({
    success: true,
    data: [],
  });
});

app.get('/api/v1/validation/history', (req, res) => {
  res.json({
    success: true,
    data: [],
  });
});

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Mock backend server running on http://localhost:${PORT}`);
});