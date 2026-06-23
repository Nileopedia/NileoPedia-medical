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

// Questions endpoints - require real backend services
app.post('/api/v1/questions/ask', (req, res) => {
  const { question } = req.body;
  if (question) {
    // Return question submitted but indicates real processing needed
    res.json({
      success: true,
      data: {
        questionId: 'q-' + Date.now(),
        status: 'pending',
        message: 'Question submitted - requires real backend services',
      },
    });
  } else {
    res.status(400).json({ success: false, message: 'Question required' });
  }
});

// Search endpoint - indicates real search required
app.get('/api/v1/search', (req, res) => {
  const { q } = req.query;
  
  // Return error indicating real search is required
  res.status(503).json({
    success: false,
    error: 'Real search unavailable - Pinecone not configured in mock mode',
  });
});

// Questions without AI response
app.get('/api/v1/questions/:id', (req, res) => {
  const { id } = req.params;
  res.json({
    success: true,
    data: {
      id,
      questionText: 'Question submitted',
      createdAt: new Date().toISOString(),
      aiResponse: {
        id: `resp-${id}`,
        validationStatus: 'PENDING',
        summary: 'I could not find supporting medical information in the knowledge base.',
        detailedExplanation: '',
        keyFindings: [],
        confidenceScore: 0,
        generatedBy: 'Unavailable',
      },
    },
  });
});

// History endpoint
app.get('/api/v1/questions/history', (req, res) => {
  res.json({
    success: true,
    data: [],
  });
});

app.get('/api/v1/notifications', (req, res) => {
  res.json({
    success: true,
    data: [],
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

// System status endpoint
app.get('/api/v1/admin/system-status', (req, res) => {
  res.json({
    embeddings: false,
    pinecone: false,
    groq: false,
    redis: false,
    totalDocuments: 0,
    totalVectors: 0,
  });
});

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Mock backend server running on http://localhost:${PORT}`);
});