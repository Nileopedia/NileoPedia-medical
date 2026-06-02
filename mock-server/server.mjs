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
          summary: 'Latest guidelines recommend...',
        },
      },
    ],
  });
});

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Mock backend server running on http://localhost:${PORT}`);
});