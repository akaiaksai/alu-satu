This is a small demo server to send and verify 6-digit codes for registration.

Usage
1. Copy `.env.example` to `.env` and fill provider credentials (Twilio for SMS, SMTP for email).
2. Install dependencies:

```bash
cd server
npm install
```

3. Start server:

```bash
npm start
```

API
- POST /api/send-code
  body: { method: 'sms'|'email', to: '+71234567890' or 'user@example.com', username, password }
  returns: { success: true }

- POST /api/verify-code
  body: { to, code }
  returns: { success: true, user }

Notes
- This server stores users in `server/users.json` (file-based, demo only). For production use a real database and secure password hashing.
- Keep API keys secret, enable HTTPS, and add strong rate-limiting.
