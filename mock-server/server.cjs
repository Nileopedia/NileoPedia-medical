const http = require('http');

const mockToken = 'mock-jwt-token-' + Date.now();
const questions = {};

const sampleResponses = [
  {
    summary: 'Evidence-based guidelines recommend individualized treatment for Type 2 Diabetes in elderly patients.',
    keyFindings: [
      'HbA1c target of < 7.5-8.0% for healthy elderly patients',
      'Metformin as first-line therapy if eGFR > 30 ml/min/1.73m²',
      'Avoid sulfonylureas due to hypoglycemia risk',
      'Consider SGLT2 inhibitors for patients with CVD or CKD',
    ],
    citations: [
      { id: '1', title: 'ADA Standards of Care 2024', source: 'Diabetes Care', authors: 'American Diabetes Association', publicationYear: 2024, url: 'https://diabetes.org' },
      { id: '2', title: 'Diabetes Management in Elderly', source: 'Lancet', authors: 'Smith et al.', publicationYear: 2023, url: 'https://lancet.com' },
    ],
    status: 'approved',
    confidenceScore: 0.92,
    generatedBy: 'GPT-4o',
  },
  {
    summary: 'Hypertension management requires careful monitoring and lifestyle modifications.',
    keyFindings: [
      'Target BP < 130/80 mmHg for most patients',
      'ACE inhibitors or ARBs as first-line therapy',
      'Regular monitoring every 3-6 months',
      'Consider drug interactions in elderly',
    ],
    citations: [
      { id: '1', title: 'ACC/AHA Hypertension Guideline', source: 'Hypertension', authors: 'Whelton et al.', publicationYear: 2023, url: 'https://acc.org' },
    ],
    status: 'approved',
    confidenceScore: 0.88,
    generatedBy: 'GPT-4o',
  },
];

const server = http.createServer((req, res) => {
  res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3000');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Content-Type', 'application/json');

  if (req.method === 'OPTIONS') {
    return res.writeHead(204).end();
  }

  let body = '';
  req.on('data', chunk => body += chunk);
  req.on('end', () => {
    const url = req.url;
    const pathParts = url.split('/');
    const questionId = pathParts[4];

    if (url === '/api/v1/auth/login' && req.method === 'POST') {
      const { email, password } = JSON.parse(body || '{}');
      if (email && password) {
        return res.end(JSON.stringify({
          success: true,
          data: {
            accessToken: mockToken,
            refreshToken: mockToken,
            user: { id: '1', fullName: email.split('@')[0], email, role: 'MEDICAL_USER' },
          },
        }));
      }
      return res.writeHead(400).end(JSON.stringify({ success: false, message: 'Invalid credentials' }));
    }

    if (url === '/api/v1/auth/register' && req.method === 'POST') {
      const { fullName, email, password, role } = JSON.parse(body || '{}');
      if (fullName && email && password) {
        const normalizedRole = role || 'MEDICAL_USER';
        return res.end(JSON.stringify({
          success: true,
          data: {
            accessToken: mockToken,
            refreshToken: mockToken,
            user: { id: Date.now().toString(), fullName, email, role: normalizedRole },
          },
        }));
      }
      return res.writeHead(400).end(JSON.stringify({ success: false, message: 'Missing fields' }));
    }

    if (url === '/api/v1/questions/ask' && req.method === 'POST') {
      const { question } = JSON.parse(body || '{}');
      const qid = 'q-' + Date.now();
      const randomResponse = sampleResponses[Math.floor(Math.random() * sampleResponses.length)];
      
      questions[qid] = {
        id: qid,
        questionText: question,
        createdAt: new Date().toISOString(),
        aiResponse: null,
      };

      setTimeout(() => {
        questions[qid].aiResponse = {
          id: 'resp-' + qid,
          questionId: qid,
          ...randomResponse,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
      }, 3000);

      return res.end(JSON.stringify({
        success: true,
        data: { questionId: qid, status: 'pending', message: 'Question submitted' },
      }));
    }

    if (url?.match(/^\/api\/v1\/questions\/[^/]+$/) && req.method === 'GET') {
      const qid = pathParts[4];
      const question = questions[qid];
      if (question) {
        return res.end(JSON.stringify({
          success: true,
          data: question,
        }));
      }
      return res.writeHead(404).end(JSON.stringify({ success: false, message: 'Question not found' }));
    }

    if (url === '/api/v1/questions/history' && req.method === 'GET') {
      const history = Object.values(questions).map(q => ({
        id: q.id,
        questionText: q.questionText,
        createdAt: q.createdAt,
        aiResponse: q.aiResponse,
      }));
      return res.end(JSON.stringify({
        success: true,
        data: history,
      }));
    }

    if (url?.match(/^\/api\/v1\/questions\/[^/]+\/save$/) && req.method === 'POST') {
      return res.end(JSON.stringify({ success: true }));
    }

    if (url?.match(/^\/api\/v1\/notifications$/) && req.method === 'GET') {
      return res.end(JSON.stringify({
        success: true,
        data: [
          { id: '1', title: 'New query submitted', message: 'Your question has been processed', read: false, createdAt: new Date().toISOString() },
          { id: '2', title: 'Response validated', message: 'A response was validated', read: true, createdAt: new Date(Date.now() - 3600000).toISOString() },
        ],
      }));
    }

    if (url?.match(/^\/api\/v1\/documents$/) && req.method === 'POST') {
      return res.end(JSON.stringify({
        success: true,
        data: { documentId: 'doc-' + Date.now(), status: 'processing' },
      }));
    }

    res.writeHead(404).end(JSON.stringify({ success: false, message: 'Not found' }));
  });
});

const io = require('socket.io')(server, {
  cors: { origin: 'http://localhost:3000' },
});

io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);
  setInterval(() => {
    socket.emit('notification', {
      id: Date.now().toString(),
      title: 'System Update',
      message: 'New medical guidelines available',
      read: false,
    });
  }, 10000);
});

server.listen(3001, () => {
  console.log('Mock backend running on http://localhost:3001');
});