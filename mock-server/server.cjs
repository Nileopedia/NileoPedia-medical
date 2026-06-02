const http = require('http');

const mockToken = 'mock-jwt-token-' + Date.now();

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
      const { fullName, email, password } = JSON.parse(body || '{}');
      if (fullName && email && password) {
        return res.end(JSON.stringify({
          success: true,
          data: {
            accessToken: mockToken,
            refreshToken: mockToken,
            user: { id: '2', fullName, email, role: 'MEDICAL_USER' },
          },
        }));
      }
      return res.writeHead(400).end(JSON.stringify({ success: false, message: 'Missing fields' }));
    }

    if (url === '/api/v1/questions/ask' && req.method === 'POST') {
      return res.end(JSON.stringify({
        success: true,
        data: { questionId: 'q-' + Date.now(), status: 'pending', message: 'Question submitted' },
      }));
    }

    if (url === '/api/v1/questions/history' && req.method === 'GET') {
      return res.end(JSON.stringify({
        success: true,
        data: [{ id: '1', questionText: 'Test question', createdAt: new Date().toISOString() }],
      }));
    }

    res.writeHead(404).end(JSON.stringify({ success: false, message: 'Not found' }));
  });
});

server.listen(3001, () => {
  console.log('Mock backend running on http://localhost:3001');
});