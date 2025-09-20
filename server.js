import 'dotenv/config';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 3001;

// Middleware to parse JSON bodies
app.use(express.json());

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Import the database client and the specific table we need
import { db } from './src/db/index.js';
import { client } from './drizzle/schema.js';

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

app.post('/api/clients', async (req, res) => {
  try {
    const { name, industry, maincontact } = req.body;

    // Basic validation
    if (!name || !industry || !maincontact) {
      return res.status(400).json({ error: 'Name, industry, and maincontact are required' });
    }

    console.log('Creating new client:', { name, industry });

    const newClient = await db
      .insert(client)
      .values({
        name,
        industry,
        maincontact,
        status: 'active', // Default status
      })
      .returning(); // Return the newly created record

    console.log('Client created successfully:', newClient[0]);
    res.status(201).json(newClient[0]);
  } catch (error) {
    console.error('Error creating client:', error);
    res.status(500).json({ error: 'Failed to create client' });
  }
});

// --- Production-only: Serve static files from React build ---
if (process.env.NODE_ENV === 'production') {
  // Serve static files from the 'build' directory
  app.use(express.static('build'));

  // For any other request, serve the index.html file
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, 'build', 'index.html'));
  });
}

// --> ADD NEW API ENDPOINTS HERE <--
// See README_NEON.md, section '2. Añadir el Endpoint en el Backend' for instructions.

app.listen(port, () => {
  console.log(`API server listening on port ${port}`);
});
