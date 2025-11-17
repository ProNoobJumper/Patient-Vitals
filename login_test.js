const http = require('http');

function postJson(path, data) {
  return new Promise((resolve, reject) => {
    const payload = JSON.stringify(data);
    const options = {
      hostname: '127.0.0.1',
      port: 4000,
      path,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(payload)
      },
      timeout: 5000
    };

    const req = http.request(options, (res) => {
      let chunks = '';
      res.setEncoding('utf8');
      res.on('data', (chunk) => chunks += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(chunks);
          resolve({ statusCode: res.statusCode, body: json });
        } catch (e) {
          resolve({ statusCode: res.statusCode, body: chunks });
        }
      });
    });

    req.on('error', reject);
    req.on('timeout', () => { req.destroy(new Error('Request timeout')); });
    req.write(payload);
    req.end();
  });
}

(async () => {
  try {
    const res = await postJson('/api/auth/login', { email: 'patient@example.com', password: 'patient123' });
    console.log('Status:', res.statusCode);
    console.log('Body:', JSON.stringify(res.body, null, 2));
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
})();
