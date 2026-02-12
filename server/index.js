require('dotenv').config();
const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const fs = require('fs');
const path = require('path');
const nodemailer = require('nodemailer');
const Twilio = require('twilio');

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 4000;
const CODE_TTL = Number(process.env.CODE_TTL || 600) * 1000; // ms

// simple in-memory storage for pending codes (demo only)
const pending = new Map(); // key: to (email or phone) -> { code, expiresAt, payload }

// users store (simple file-based demo)
const USERS_FILE = path.join(__dirname, 'users.json');
function readUsers() {
  try {
    if (!fs.existsSync(USERS_FILE)) return [];
    const raw = fs.readFileSync(USERS_FILE, 'utf8');
    return JSON.parse(raw || '[]');
  } catch { return []; }
}
function writeUsers(users) {
  fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
}

// Create transporters
let mailTransporter = null;
if (process.env.SMTP_HOST && process.env.SMTP_USER) {
  mailTransporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  });
}

let twilioClient = null;
if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
  twilioClient = Twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
}

// Basic rate limiting
const limiter = rateLimit({ windowMs: 60 * 1000, max: 10 });
app.use(limiter);

function generateCode() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

app.post('/api/send-code', async (req, res) => {
  try {
    const { method, to, username, password } = req.body;
    if (!method || !to) return res.status(400).json({ error: 'method and to required' });

    const code = generateCode();
    const expiresAt = Date.now() + CODE_TTL;
    pending.set(to, { code, expiresAt, payload: { username, password, to } });

    // send via SMS if requested and Twilio configured
    if (method === 'sms') {
      if (!twilioClient) return res.status(500).json({ error: 'SMS not configured on server' });
      const from = process.env.TWILIO_FROM;
      await twilioClient.messages.create({ body: `Alu-Satu код подтверждения: ${code}`, from, to });
      return res.json({ success: true });
    }

    // send via email if mailTransporter configured
    if (method === 'email') {
      if (!mailTransporter) return res.status(500).json({ error: 'Email not configured on server' });
      const mailOptions = {
        from: process.env.SMTP_USER,
        to,
        subject: 'Alu-Satu: код подтверждения',
        text: `Ваш код подтверждения: ${code}`
      };
      await mailTransporter.sendMail(mailOptions);
      return res.json({ success: true });
    }

    return res.status(400).json({ error: 'Unknown method' });
  } catch (err) {
    console.error('send-code failed', err);
    return res.status(500).json({ error: 'send failed' });
  }
});

app.post('/api/verify-code', (req, res) => {
  try {
    const { to, code } = req.body;
    if (!to || !code) return res.status(400).json({ error: 'to and code required' });

    const row = pending.get(to);
    if (!row) return res.status(400).json({ error: 'no pending code' });
    if (Date.now() > row.expiresAt) {
      pending.delete(to);
      return res.status(400).json({ error: 'code expired' });
    }
    if (String(row.code) !== String(code).trim()) return res.status(400).json({ error: 'invalid code' });

    // create user (demo: store in users.json)
    const { username, password } = row.payload || {};
    const users = readUsers();
    if (users.find(u => u.email === to || u.username === username)) {
      pending.delete(to);
      return res.status(400).json({ error: 'user already exists' });
    }
    const newUser = { id: Date.now(), username: username || '', email: to, password: password || '' };
    users.push(newUser);
    writeUsers(users);
    pending.delete(to);

    return res.json({ success: true, user: { id: newUser.id, username: newUser.username, email: newUser.email } });
  } catch (err) {
    console.error('verify failed', err);
    return res.status(500).json({ error: 'verify failed' });
  }
});

app.listen(PORT, () => {
  console.log(`Auth helper server running on http://localhost:${PORT}`);
});
