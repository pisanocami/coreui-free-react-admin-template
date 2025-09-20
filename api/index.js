import 'dotenv/config';
import express from 'express';

const app = express();
const port = process.env.PORT || 3001;

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Import the database client and the specific table we need
import { db } from '../src/db/index.js';
import { client } from '../drizzle/schema.js';

app.get('/api/clients', async (req, res) => {
  try {
    console.log('Fetching clients from the database...');
    const clients = await db.select().from(client).limit(10);
    console.log(`Found ${clients.length} clients.`);
    res.json(clients);
  } catch (error) {
    console.error('Error fetching clients:', error);
    res.status(500).json({ error: 'Failed to fetch clients' });
  }
});

// Aquí agregaremos más endpoints para tus entidades

app.listen(port, () => {
  console.log(`API server listening on port ${port}`);
});
