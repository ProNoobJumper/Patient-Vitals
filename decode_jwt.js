// Simple JWT payload decoder (no signature verification)
const token = process.argv[2];
if (!token) {
  console.error('Usage: node decode_jwt.js <token>');
  process.exit(1);
}
function b64UrlDecode(str) {
  str = str.replace(/-/g, '+').replace(/_/g, '/');
  while (str.length % 4) str += '=';
  return Buffer.from(str, 'base64').toString('utf8');
}
const parts = token.split('.');
if (parts.length < 2) {
  console.error('Not a JWT');
  process.exit(1);
}
const header = JSON.parse(b64UrlDecode(parts[0]));
const payload = JSON.parse(b64UrlDecode(parts[1]));
console.log('Header:', JSON.stringify(header, null, 2));
console.log('Payload:', JSON.stringify(payload, null, 2));
