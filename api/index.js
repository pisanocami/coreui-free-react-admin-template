import 'dotenv/config';
import express from 'express';

const app = express();
const port = process.env.PORT || 3001;

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Aquí agregaremos los endpoints para tus entidades

app.listen(port, () => {
  console.log(`API server listening on port ${port}`);
});
