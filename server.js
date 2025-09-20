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

// Import the database client and the specific tables we need
import { db } from './src/db/index.js';
import { eq } from 'drizzle-orm';
import { client, report, vertical, competitor, user, tag, metric, entity, socialprofile, review, adcreative, reportsection, sectionitem, insight, metricvalue, reportmedia, reporttag } from './drizzle/schema.js';

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

// Reports endpoints
app.get('/api/reports', async (req, res) => {
  try {
    console.log('Fetching reports from the database...');
    const reports = await db.select().from(report).limit(10);
    console.log(`Found ${reports.length} reports.`);
    res.json(reports);
  } catch (error) {
    console.error('Error fetching reports:', error);
    res.status(500).json({ error: 'Failed to fetch reports' });
  }
});

app.post('/api/reports', async (req, res) => {
  try {
    const { name, summary, clientid, verticalid, createdbyuserid, status } = req.body;

    // Basic validation
    if (!name) {
      return res.status(400).json({ error: 'Name is required' });
    }

    console.log('Creating new report:', { name, summary, clientid });

    const newReport = await db
      .insert(report)
      .values({
        name,
        summary,
        clientid,
        verticalid,
        createdbyuserid,
        status: status || 'draft', // Default status
      })
      .returning(); // Return the newly created record

    console.log('Report created successfully:', newReport[0]);
    res.status(201).json(newReport[0]);
  } catch (error) {
    console.error('Error creating report:', error);
    res.status(500).json({ error: 'Failed to create report' });
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

// Verticals endpoints
app.get('/api/verticals', async (req, res) => {
  try {
    console.log('Fetching verticals from the database...');
    const verticals = await db.select().from(vertical);
    console.log(`Found ${verticals.length} verticals.`);
    res.json(verticals);
  } catch (error) {
    console.error('Error fetching verticals:', error);
    res.status(500).json({ error: 'Failed to fetch verticals' });
  }
});

app.post('/api/verticals', async (req, res) => {
  try {
    const { name, description } = req.body;

    // Basic validation
    if (!name) {
      return res.status(400).json({ error: 'Name is required' });
    }

    console.log('Creating new vertical:', { name });

    const newVertical = await db
      .insert(vertical)
      .values({
        name,
        description,
      })
      .returning(); // Return the newly created record

    console.log('Vertical created successfully:', newVertical[0]);
    res.status(201).json(newVertical[0]);
  } catch (error) {
    console.error('Error creating vertical:', error);
    res.status(500).json({ error: 'Failed to create vertical' });
  }
});

// Competitors endpoints
app.get('/api/competitors', async (req, res) => {
  try {
    console.log('Fetching competitors from the database...');
    const competitors = await db.select().from(competitor);
    console.log(`Found ${competitors.length} competitors.`);
    res.json(competitors);
  } catch (error) {
    console.error('Error fetching competitors:', error);
    res.status(500).json({ error: 'Failed to fetch competitors' });
  }
});

app.post('/api/competitors', async (req, res) => {
  try {
    const { name, domain, industry, description } = req.body;

    // Basic validation
    if (!name) {
      return res.status(400).json({ error: 'Name is required' });
    }

    console.log('Creating new competitor:', { name, domain });

    const newCompetitor = await db
      .insert(competitor)
      .values({
        name,
        domain,
        industry,
        description,
      })
      .returning(); // Return the newly created record

    console.log('Competitor created successfully:', newCompetitor[0]);
    res.status(201).json(newCompetitor[0]);
  } catch (error) {
    console.error('Error creating competitor:', error);
    res.status(500).json({ error: 'Failed to create competitor' });
  }
});

// Users endpoints
app.get('/api/users', async (req, res) => {
  try {
    console.log('Fetching users from the database...');
    const users = await db.select().from(user);
    console.log(`Found ${users.length} users.`);
    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

app.post('/api/users', async (req, res) => {
  try {
    const { name, email, role, status } = req.body;

    // Basic validation
    if (!name || !email || !role) {
      return res.status(400).json({ error: 'Name, email, and role are required' });
    }

    console.log('Creating new user:', { name, email });

    const newUser = await db
      .insert(user)
      .values({
        name,
        email,
        role,
        status: status || 'active',
      })
      .returning(); // Return the newly created record

    console.log('User created successfully:', newUser[0]);
    res.status(201).json(newUser[0]);
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ error: 'Failed to create user' });
  }
});

// Tags endpoints
app.get('/api/tags', async (req, res) => {
  try {
    console.log('Fetching tags from the database...');
    const tags = await db.select().from(tag);
    console.log(`Found ${tags.length} tags.`);
    res.json(tags);
  } catch (error) {
    console.error('Error fetching tags:', error);
    res.status(500).json({ error: 'Failed to fetch tags' });
  }
});

app.post('/api/tags', async (req, res) => {
  try {
    const { name, category, description } = req.body;

    // Basic validation
    if (!name) {
      return res.status(400).json({ error: 'Name is required' });
    }

    console.log('Creating new tag:', { name });

    const newTag = await db
      .insert(tag)
      .values({
        name,
        category,
        description,
      })
      .returning(); // Return the newly created record

    console.log('Tag created successfully:', newTag[0]);
    res.status(201).json(newTag[0]);
  } catch (error) {
    console.error('Error creating tag:', error);
    res.status(500).json({ error: 'Failed to create tag' });
  }
});

// Metrics endpoints
app.get('/api/metrics', async (req, res) => {
  try {
    console.log('Fetching metrics from the database...');
    const metrics = await db.select().from(metric);
    console.log(`Found ${metrics.length} metrics.`);
    res.json(metrics);
  } catch (error) {
    console.error('Error fetching metrics:', error);
    res.status(500).json({ error: 'Failed to fetch metrics' });
  }
});

app.post('/api/metrics', async (req, res) => {
  try {
    const { name, unit, description, category } = req.body;

    // Basic validation
    if (!name) {
      return res.status(400).json({ error: 'Name is required' });
    }

    console.log('Creating new metric:', { name });

    const newMetric = await db
      .insert(metric)
      .values({
        name,
        unit,
        description,
        category,
      })
      .returning(); // Return the newly created record

    console.log('Metric created successfully:', newMetric[0]);
    res.status(201).json(newMetric[0]);
  } catch (error) {
    console.error('Error creating metric:', error);
    res.status(500).json({ error: 'Failed to create metric' });
  }
});

// Entities endpoints
app.get('/api/entities', async (req, res) => {
  try {
    console.log('Fetching entities from the database...');
    const entities = await db.select().from(entity);
    console.log(`Found ${entities.length} entities.`);
    res.json(entities);
  } catch (error) {
    console.error('Error fetching entities:', error);
    res.status(500).json({ error: 'Failed to fetch entities' });
  }
});

app.post('/api/entities', async (req, res) => {
  try {
    const { name, type, domain, description } = req.body;

    // Basic validation
    if (!name) {
      return res.status(400).json({ error: 'Name is required' });
    }

    console.log('Creating new entity:', { name });

    const newEntity = await db
      .insert(entity)
      .values({
        name,
        type,
        domain,
        description,
      })
      .returning(); // Return the newly created record

    console.log('Entity created successfully:', newEntity[0]);
    res.status(201).json(newEntity[0]);
  } catch (error) {
    console.error('Error creating entity:', error);
    res.status(500).json({ error: 'Failed to create entity' });
  }
});

// Social Profiles endpoints
app.get('/api/socialprofiles', async (req, res) => {
  try {
    console.log('Fetching social profiles from the database...');
    const profiles = await db.select().from(socialprofile);
    console.log(`Found ${profiles.length} profiles.`);
    res.json(profiles);
  } catch (error) {
    console.error('Error fetching social profiles:', error);
    res.status(500).json({ error: 'Failed to fetch social profiles' });
  }
});

app.post('/api/socialprofiles', async (req, res) => {
  try {
    const { entityid, platform, url, followers } = req.body;

    // Basic validation
    if (!entityid || !platform || !url) {
      return res.status(400).json({ error: 'Entity ID, platform, and URL are required' });
    }

    console.log('Creating new social profile:', { entityid, platform });

    const newProfile = await db
      .insert(socialprofile)
      .values({
        entityid,
        platform,
        url,
        followers,
      })
      .returning(); // Return the newly created record

    console.log('Social profile created successfully:', newProfile[0]);
    res.status(201).json(newProfile[0]);
  } catch (error) {
    console.error('Error creating social profile:', error);
    res.status(500).json({ error: 'Failed to create social profile' });
  }
});

// Reviews endpoints
app.get('/api/reviews', async (req, res) => {
  try {
    console.log('Fetching reviews from the database...');
    const reviews = await db.select().from(review);
    console.log(`Found ${reviews.length} reviews.`);
    res.json(reviews);
  } catch (error) {
    console.error('Error fetching reviews:', error);
    res.status(500).json({ error: 'Failed to fetch reviews' });
  }
});

app.post('/api/reviews', async (req, res) => {
  try {
    const { entityid, reportid, ispositive, reviewsource, content, mentionedproduct, rating, reviewdate } = req.body;

    // Basic validation
    if (entityid === undefined || reportid === undefined || content === undefined) {
      return res.status(400).json({ error: 'Entity ID, Report ID, and content are required' });
    }

    console.log('Creating new review:', { entityid, reportid });

    const newReview = await db
      .insert(review)
      .values({
        entityid,
        reportid,
        ispositive,
        reviewsource,
        content,
        mentionedproduct,
        rating,
        reviewdate,
      })
      .returning(); // Return the newly created record

    console.log('Review created successfully:', newReview[0]);
    res.status(201).json(newReview[0]);
  } catch (error) {
    console.error('Error creating review:', error);
    res.status(500).json({ error: 'Failed to create review' });
  }
});

// Ad Creatives endpoints
app.get('/api/adcreatives', async (req, res) => {
  try {
    console.log('Fetching ad creatives from the database...');
    const creatives = await db.select().from(adcreative);
    console.log(`Found ${creatives.length} ad creatives.`);
    res.json(creatives);
  } catch (error) {
    console.error('Error fetching ad creatives:', error);
    res.status(500).json({ error: 'Failed to fetch ad creatives' });
  }
});

app.post('/api/adcreatives', async (req, res) => {
  try {
    const { entityid, reportid, format, campaign, creativeurl, performancenotes, adplatform } = req.body;

    // Basic validation
    if (!entityid || !reportid || !format || !creativeurl) {
      return res.status(400).json({ error: 'Entity ID, Report ID, format, and creative URL are required' });
    }

    console.log('Creating new ad creative:', { campaign });

    const newAdCreative = await db
      .insert(adcreative)
      .values({
        entityid,
        reportid,
        format,
        campaign,
        creativeurl,
        performancenotes,
        adplatform,
      })
      .returning(); // Return the newly created record

    console.log('Ad creative created successfully:', newAdCreative[0]);
    res.status(201).json(newAdCreative[0]);
  } catch (error) {
    console.error('Error creating ad creative:', error);
    res.status(500).json({ error: 'Failed to create ad creative' });
  }
});

// Report Sections endpoints
app.get('/api/reportsections', async (req, res) => {
  try {
    console.log('Fetching report sections from the database...');
    const sections = await db.select().from(reportsection);
    console.log(`Found ${sections.length} report sections.`);
    res.json(sections);
  } catch (error) {
    console.error('Error fetching report sections:', error);
    res.status(500).json({ error: 'Failed to fetch report sections' });
  }
});

app.post('/api/reportsections', async (req, res) => {
  try {
    const { reportid, sectionname, position, description } = req.body;

    // Basic validation
    if (!reportid || !sectionname) {
      return res.status(400).json({ error: 'Report ID and section name are required' });
    }

    console.log('Creating new report section:', { sectionname });

    const newSection = await db
      .insert(reportsection)
      .values({
        reportid,
        sectionname,
        position,
        description,
      })
      .returning(); // Return the newly created record

    console.log('Report section created successfully:', newSection[0]);
    res.status(201).json(newSection[0]);
  } catch (error) {
    console.error('Error creating report section:', error);
    res.status(500).json({ error: 'Failed to create report section' });
  }
});

// Section Items endpoints
app.get('/api/sectionitems', async (req, res) => {
  try {
    console.log('Fetching section items from the database...');
    const items = await db.select().from(sectionitem);
    console.log(`Found ${items.length} section items.`);
    res.json(items);
  } catch (error) {
    console.error('Error fetching section items:', error);
    res.status(500).json({ error: 'Failed to fetch section items' });
  }
});

app.post('/api/sectionitems', async (req, res) => {
  try {
    const { sectionid, itemtitle, content, position, type } = req.body;

    // Basic validation
    if (!sectionid || !itemtitle) {
      return res.status(400).json({ error: 'Section ID and item title are required' });
    }

    console.log('Creating new section item:', { itemtitle });

    const newItem = await db
      .insert(sectionitem)
      .values({
        sectionid,
        itemtitle,
        content,
        position,
        type,
      })
      .returning(); // Return the newly created record

    console.log('Section item created successfully:', newItem[0]);
    res.status(201).json(newItem[0]);
  } catch (error) {
    console.error('Error creating section item:', error);
    res.status(500).json({ error: 'Failed to create section item' });
  }
});

// Insights endpoints
app.get('/api/insights', async (req, res) => {
  try {
    console.log('Fetching insights from the database...');
    const insights = await db.select().from(insight);
    console.log(`Found ${insights.length} insights.`);
    res.json(insights);
  } catch (error) {
    console.error('Error fetching insights:', error);
    res.status(500).json({ error: 'Failed to fetch insights' });
  }
});

app.post('/api/insights', async (req, res) => {
  try {
    const { reportsectionid, title, type, content, position, priority } = req.body;

    // Basic validation
    if (!reportsectionid || !title) {
      return res.status(400).json({ error: 'Report Section ID and title are required' });
    }

    console.log('Creating new insight:', { title });

    const newInsight = await db
      .insert(insight)
      .values({
        reportsectionid,
        title,
        type,
        content,
        position,
        priority,
      })
      .returning(); // Return the newly created record

    console.log('Insight created successfully:', newInsight[0]);
    res.status(201).json(newInsight[0]);
  } catch (error) {
    console.error('Error creating insight:', error);
    res.status(500).json({ error: 'Failed to create insight' });
  }
});

// Metric Values endpoints
app.get('/api/metricvalues', async (req, res) => {
  try {
    console.log('Fetching metric values from the database...');
    const values = await db.select().from(metricvalue);
    console.log(`Found ${values.length} metric values.`);
    res.json(values);
  } catch (error) {
    console.error('Error fetching metric values:', error);
    res.status(500).json({ error: 'Failed to fetch metric values' });
  }
});

app.post('/api/metricvalues', async (req, res) => {
  try {
    const { metricid, entityid, reportid, periodtype, periodvalue, value, additionalinfo } = req.body;

    // Basic validation
    if (metricid === undefined || entityid === undefined || value === undefined) {
      return res.status(400).json({ error: 'Metric ID, Entity ID, and value are required' });
    }

    console.log('Creating new metric value:', { metricid, entityid });

    const newValue = await db
      .insert(metricvalue)
      .values({
        metricid,
        entityid,
        reportid,
        periodtype,
        periodvalue,
        value,
        additionalinfo,
      })
      .returning(); // Return the newly created record

    console.log('Metric value created successfully:', newValue[0]);
    res.status(201).json(newValue[0]);
  } catch (error) {
    console.error('Error creating metric value:', error);
    res.status(500).json({ error: 'Failed to create metric value' });
  }
});

// Report Media endpoints
app.get('/api/reportmedia', async (req, res) => {
  try {
    console.log('Fetching report media from the database...');
    const media = await db.select().from(reportmedia);
    console.log(`Found ${media.length} report media.`);
    res.json(media);
  } catch (error) {
    console.error('Error fetching report media:', error);
    res.status(500).json({ error: 'Failed to fetch report media' });
  }
});

app.post('/api/reportmedia', async (req, res) => {
  try {
    const { reportid, sectionid, type, url, caption, filesize } = req.body;

    // Basic validation
    if (!reportid || !type || !url) {
      return res.status(400).json({ error: 'Report ID, type, and URL are required' });
    }

    console.log('Creating new report medium:', { url });

    const newMedium = await db
      .insert(reportmedia)
      .values({
        reportid,
        sectionid,
        type,
        url,
        caption,
        filesize,
      })
      .returning(); // Return the newly created record

    console.log('Report medium created successfully:', newMedium[0]);
    res.status(201).json(newMedium[0]);
  } catch (error) {
    console.error('Error creating report medium:', error);
    res.status(500).json({ error: 'Failed to create report medium' });
  }
});

// Report Tags endpoints
app.get('/api/reporttags', async (req, res) => {
  try {
    console.log('Fetching report tags from the database...');
    const tags = await db.select().from(reporttag);
    console.log(`Found ${tags.length} report tags.`);
    res.json(tags);
  } catch (error) {
    console.error('Error fetching report tags:', error);
    res.status(500).json({ error: 'Failed to fetch report tags' });
  }
});

app.post('/api/reporttags', async (req, res) => {
  try {
    const { reportid, tagid } = req.body;

    // Basic validation
    if (reportid === undefined || tagid === undefined) {
      return res.status(400).json({ error: 'Report ID and Tag ID are required' });
    }

    console.log('Creating new report tag:', { reportid, tagid });

    const newTag = await db
      .insert(reporttag)
      .values({
        reportid,
        tagid,
      })
      .returning(); // Return the newly created record

    console.log('Report tag created successfully:', newTag[0]);
    res.status(201).json(newTag[0]);
  } catch (error) {
    console.error('Error creating report tag:', error);
    res.status(500).json({ error: 'Failed to create report tag' });
  }
});

// Endpoint to update an entity
app.put('/api/entities/:id', async (req, res) => {
  const { id } = req.params;
  const { name, type, clientid } = req.body;

  if (!name || !type) {
    return res.status(400).json({ error: 'Name and type are required' });
  }

  try {
    const updated = await db.update(entity)
      .set({ name, type, clientid: clientid ? parseInt(clientid, 10) : null })
      .where(eq(entity.entityid, parseInt(id, 10)))
      .returning();

    if (updated.length === 0) {
      return res.status(404).json({ error: 'Entity not found' });
    }

    console.log('Entity updated successfully:', updated[0]);
    res.json(updated[0]);
  } catch (error) {
    console.error('Error updating entity:', error);
    res.status(500).json({ error: 'Failed to update entity' });
  }
});

// Endpoint to delete an entity
app.delete('/api/entities/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const deleted = await db.delete(entity)
      .where(eq(entity.entityid, parseInt(id, 10)))
      .returning();

    if (deleted.length === 0) {
      return res.status(404).json({ error: 'Entity not found' });
    }

    console.log('Entity deleted successfully:', deleted[0]);
    res.status(204).send(); // No content
  } catch (error) {
    console.error('Error deleting entity:', error);
    res.status(500).json({ error: 'Failed to delete entity' });
  }
});

// Endpoint to update a client
app.put('/api/clients/:id', async (req, res) => {
  const { id } = req.params;
  const { name, industry, region } = req.body;

  if (!name) {
    return res.status(400).json({ error: 'Name is required' });
  }

  try {
    const updated = await db.update(client)
      .set({ name, industry, region })
      .where(eq(client.clientid, parseInt(id, 10)))
      .returning();

    if (updated.length === 0) {
      return res.status(404).json({ error: 'Client not found' });
    }

    console.log('Client updated successfully:', updated[0]);
    res.json(updated[0]);
  } catch (error) {
    console.error('Error updating client:', error);
    res.status(500).json({ error: 'Failed to update client' });
  }
});

// Endpoint to delete a client
app.delete('/api/clients/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const deleted = await db.delete(client)
      .where(eq(client.clientid, parseInt(id, 10)))
      .returning();

    if (deleted.length === 0) {
      return res.status(404).json({ error: 'Client not found' });
    }

    console.log('Client deleted successfully:', deleted[0]);
    res.status(204).send(); // No content
  } catch (error) {
    console.error('Error deleting client:', error);
    res.status(500).json({ error: 'Failed to delete client' });
  }
});

// Endpoint to update a report
app.put('/api/reports/:id', async (req, res) => {
  const { id } = req.params;
  const { name, clientid, startdate, enddate, status } = req.body;

  if (!name || !clientid) {
    return res.status(400).json({ error: 'Name and Client ID are required' });
  }

  try {
    const updated = await db.update(report)
      .set({ 
        name, 
        clientid: parseInt(clientid, 10), 
        startdate, 
        enddate, 
        status 
      })
      .where(eq(report.reportid, parseInt(id, 10)))
      .returning();

    if (updated.length === 0) {
      return res.status(404).json({ error: 'Report not found' });
    }

    console.log('Report updated successfully:', updated[0]);
    res.json(updated[0]);
  } catch (error) {
    console.error('Error updating report:', error);
    res.status(500).json({ error: 'Failed to update report' });
  }
});

// Endpoint to delete a report
app.delete('/api/reports/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const deleted = await db.delete(report)
      .where(eq(report.reportid, parseInt(id, 10)))
      .returning();

    if (deleted.length === 0) {
      return res.status(404).json({ error: 'Report not found' });
    }

    console.log('Report deleted successfully:', deleted[0]);
    res.status(204).send(); // No content
  } catch (error) {
    console.error('Error deleting report:', error);
    res.status(500).json({ error: 'Failed to delete report' });
  }
});

// Endpoint to update a vertical
app.put('/api/verticals/:id', async (req, res) => {
  const { id } = req.params;
  const { name, description } = req.body;

  if (!name) {
    return res.status(400).json({ error: 'Name is required' });
  }

  try {
    const updated = await db.update(vertical)
      .set({ name, description })
      .where(eq(vertical.verticalid, parseInt(id, 10)))
      .returning();

    if (updated.length === 0) {
      return res.status(404).json({ error: 'Vertical not found' });
    }

    console.log('Vertical updated successfully:', updated[0]);
    res.json(updated[0]);
  } catch (error) {
    console.error('Error updating vertical:', error);
    res.status(500).json({ error: 'Failed to update vertical' });
  }
});

// Endpoint to delete a vertical
app.delete('/api/verticals/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const deleted = await db.delete(vertical)
      .where(eq(vertical.verticalid, parseInt(id, 10)))
      .returning();

    if (deleted.length === 0) {
      return res.status(404).json({ error: 'Vertical not found' });
    }

    console.log('Vertical deleted successfully:', deleted[0]);
    res.status(204).send(); // No content
  } catch (error) {
    console.error('Error deleting vertical:', error);
    res.status(500).json({ error: 'Failed to delete vertical' });
  }
});

// Endpoint to update a competitor
app.put('/api/competitors/:id', async (req, res) => {
  const { id } = req.params;
  const { name, verticalid, description } = req.body;

  if (!name) {
    return res.status(400).json({ error: 'Name is required' });
  }

  try {
    const updated = await db.update(competitor)
      .set({ 
        name, 
        verticalid: verticalid ? parseInt(verticalid, 10) : null, 
        description 
      })
      .where(eq(competitor.competitorid, parseInt(id, 10)))
      .returning();

    if (updated.length === 0) {
      return res.status(404).json({ error: 'Competitor not found' });
    }

    console.log('Competitor updated successfully:', updated[0]);
    res.json(updated[0]);
  } catch (error) {
    console.error('Error updating competitor:', error);
    res.status(500).json({ error: 'Failed to update competitor' });
  }
});

// Endpoint to delete a competitor
app.delete('/api/competitors/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const deleted = await db.delete(competitor)
      .where(eq(competitor.competitorid, parseInt(id, 10)))
      .returning();

    if (deleted.length === 0) {
      return res.status(404).json({ error: 'Competitor not found' });
    }

    console.log('Competitor deleted successfully:', deleted[0]);
    res.status(204).send(); // No content
  } catch (error) {
    console.error('Error deleting competitor:', error);
    res.status(500).json({ error: 'Failed to delete competitor' });
  }
});

// Endpoint to update a user
app.put('/api/users/:id', async (req, res) => {
  const { id } = req.params;
  const { name, email, role } = req.body;

  if (!name || !email) {
    return res.status(400).json({ error: 'Name and email are required' });
  }

  try {
    const updated = await db.update(user)
      .set({ name, email, role })
      .where(eq(user.userid, parseInt(id, 10)))
      .returning();

    if (updated.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    console.log('User updated successfully:', updated[0]);
    res.json(updated[0]);
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ error: 'Failed to update user' });
  }
});

// Endpoint to delete a user
app.delete('/api/users/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const deleted = await db.delete(user)
      .where(eq(user.userid, parseInt(id, 10)))
      .returning();

    if (deleted.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    console.log('User deleted successfully:', deleted[0]);
    res.status(204).send(); // No content
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ error: 'Failed to delete user' });
  }
});

// Endpoint to get report sections by report ID
app.get('/api/reports/:reportId/sections', async (req, res) => {
  const { reportId } = req.params;

  try {
    console.log(`Fetching sections for report ID: ${reportId}`);
    const sections = await db.select().from(reportsection)
      .where(eq(reportsection.reportid, parseInt(reportId, 10)))
      .orderBy(reportsection.position);
    
    console.log(`Found ${sections.length} sections for report ${reportId}`);
    res.json(sections);
  } catch (error) {
    console.error('Error fetching report sections:', error);
    res.status(500).json({ error: 'Failed to fetch report sections' });
  }
});

// Endpoint to get section items by section ID
app.get('/api/report-sections/:sectionId/items', async (req, res) => {
  const { sectionId } = req.params;

  try {
    console.log(`Fetching items for section ID: ${sectionId}`);
    const items = await db.select().from(sectionitem)
      .where(eq(sectionitem.sectionid, parseInt(sectionId, 10)))
      .orderBy(sectionitem.position);
    
    console.log(`Found ${items.length} items for section ${sectionId}`);
    res.json(items);
  } catch (error) {
    console.error('Error fetching section items:', error);
    res.status(500).json({ error: 'Failed to fetch section items' });
  }
});

// Endpoint to get insights by section ID
app.get('/api/report-sections/:sectionId/insights', async (req, res) => {
  const { sectionId } = req.params;

  try {
    console.log(`Fetching insights for section ID: ${sectionId}`);
    const insights = await db.select().from(insight)
      .where(eq(insight.reportsectionid, parseInt(sectionId, 10)))
      .orderBy(insight.position);
    
    console.log(`Found ${insights.length} insights for section ${sectionId}`);
    res.json(insights);
  } catch (error) {
    console.error('Error fetching section insights:', error);
    res.status(500).json({ error: 'Failed to fetch section insights' });
  }
});

// Endpoint to get media by section ID
app.get('/api/report-sections/:sectionId/media', async (req, res) => {
  const { sectionId } = req.params;

  try {
    console.log(`Fetching media for section ID: ${sectionId}`);
    const media = await db.select().from(reportmedia)
      .where(eq(reportmedia.sectionid, parseInt(sectionId, 10)))
      .orderBy(reportmedia.createdat);
    
    console.log(`Found ${media.length} media items for section ${sectionId}`);
    res.json(media);
  } catch (error) {
    console.error('Error fetching section media:', error);
    res.status(500).json({ error: 'Failed to fetch section media' });
  }
});

// Dashboard statistics endpoints
app.get('/api/stats/reports-by-client', async (req, res) => {
  try {
    console.log('Fetching report statistics by client...');
    const stats = await db.select({
      clientName: client.name,
      reportCount: sql`COUNT(${report.reportid})`
    })
    .from(client)
    .leftJoin(report, eq(client.clientid, report.clientid))
    .groupBy(client.clientid, client.name);

    console.log(`Found ${stats.length} client statistics.`);
    res.json(stats);
  } catch (error) {
    console.error('Error fetching report statistics by client:', error);
    res.status(500).json({ error: 'Failed to fetch report statistics by client' });
  }
});

app.get('/api/stats/entities-by-type', async (req, res) => {
  try {
    console.log('Fetching entity statistics by type...');
    const stats = await db.select({
      entityType: entity.type,
      entityCount: sql`COUNT(${entity.entityid})`
    })
    .from(entity)
    .groupBy(entity.type);

    console.log(`Found ${stats.length} entity type statistics.`);
    res.json(stats);
  } catch (error) {
    console.error('Error fetching entity statistics by type:', error);
    res.status(500).json({ error: 'Failed to fetch entity statistics by type' });
  }
});

app.get('/api/stats/users-by-month', async (req, res) => {
  try {
    console.log('Fetching user statistics by month...');
    const stats = await db.select({
      month: sql`DATE_TRUNC('month', ${user.createdat})`.as('month'),
      userCount: sql`COUNT(${user.userid})`.as('user_count')
    })
    .from(user)
    .groupBy(sql`DATE_TRUNC('month', ${user.createdat})`)
    .orderBy(sql`DATE_TRUNC('month', ${user.createdat})`);

    console.log(`Found ${stats.length} monthly user statistics.`);
    res.json(stats);
  } catch (error) {
    console.error('Error fetching user statistics by month:', error);
    res.status(500).json({ error: 'Failed to fetch user statistics by month' });
  }
});

// Endpoint to update a tag
app.put('/api/tags/:id', async (req, res) => {
  const { id } = req.params;
  const { name, description } = req.body;

  if (!name) {
    return res.status(400).json({ error: 'Name is required' });
  }

  try {
    const updated = await db.update(tag)
      .set({ name, description })
      .where(eq(tag.tagid, parseInt(id, 10)))
      .returning();

    if (updated.length === 0) {
      return res.status(404).json({ error: 'Tag not found' });
    }

    console.log('Tag updated successfully:', updated[0]);
    res.json(updated[0]);
  } catch (error) {
    console.error('Error updating tag:', error);
    res.status(500).json({ error: 'Failed to update tag' });
  }
});

// Endpoint to delete a tag
app.delete('/api/tags/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const deleted = await db.delete(tag)
      .where(eq(tag.tagid, parseInt(id, 10)))
      .returning();

    if (deleted.length === 0) {
      return res.status(404).json({ error: 'Tag not found' });
    }

    console.log('Tag deleted successfully:', deleted[0]);
    res.status(204).send(); // No content
  } catch (error) {
    console.error('Error deleting tag:', error);
    res.status(500).json({ error: 'Failed to delete tag' });
  }
});

// Endpoint to update a metric
app.put('/api/metrics/:id', async (req, res) => {
  const { id } = req.params;
  const { name, description, type } = req.body;

  if (!name) {
    return res.status(400).json({ error: 'Name is required' });
  }

  try {
    const updated = await db.update(metric)
      .set({ name, description, type })
      .where(eq(metric.metricid, parseInt(id, 10)))
      .returning();

    if (updated.length === 0) {
      return res.status(404).json({ error: 'Metric not found' });
    }

    console.log('Metric updated successfully:', updated[0]);
    res.json(updated[0]);
  } catch (error) {
    console.error('Error updating metric:', error);
    res.status(500).json({ error: 'Failed to update metric' });
  }
});

// Endpoint to delete a metric
app.delete('/api/metrics/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const deleted = await db.delete(metric)
      .where(eq(metric.metricid, parseInt(id, 10)))
      .returning();

    if (deleted.length === 0) {
      return res.status(404).json({ error: 'Metric not found' });
    }

    console.log('Metric deleted successfully:', deleted[0]);
    res.status(204).send(); // No content
  } catch (error) {
    console.error('Error deleting metric:', error);
    res.status(500).json({ error: 'Failed to delete metric' });
  }
});

// Endpoint to update a social profile
app.put('/api/socialprofiles/:id', async (req, res) => {
  const { id } = req.params;
  const { entityid, platform, url, followers } = req.body;

  if (!entityid || !platform || !url) {
    return res.status(400).json({ error: 'Entity ID, platform, and URL are required' });
  }

  try {
    const updated = await db.update(socialprofile)
      .set({ 
        entityid: parseInt(entityid, 10),
        platform,
        url,
        followers: followers ? parseInt(followers, 10) : null
      })
      .where(eq(socialprofile.profileid, parseInt(id, 10)))
      .returning();

    if (updated.length === 0) {
      return res.status(404).json({ error: 'Social profile not found' });
    }

    console.log('Social profile updated successfully:', updated[0]);
    res.json(updated[0]);
  } catch (error) {
    console.error('Error updating social profile:', error);
    res.status(500).json({ error: 'Failed to update social profile' });
  }
});

// Endpoint to delete a social profile
app.delete('/api/socialprofiles/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const deleted = await db.delete(socialprofile)
      .where(eq(socialprofile.profileid, parseInt(id, 10)))
      .returning();

    if (deleted.length === 0) {
      return res.status(404).json({ error: 'Social profile not found' });
    }

    console.log('Social profile deleted successfully:', deleted[0]);
    res.status(204).send(); // No content
  } catch (error) {
    console.error('Error deleting social profile:', error);
    res.status(500).json({ error: 'Failed to delete social profile' });
  }
});

// Endpoint to update a review
app.put('/api/reviews/:id', async (req, res) => {
  const { id } = req.params;
  const { entityid, source, rating, content } = req.body;

  if (!entityid || !source) {
    return res.status(400).json({ error: 'Entity ID and source are required' });
  }

  try {
    const updated = await db.update(review)
      .set({ 
        entityid: parseInt(entityid, 10),
        source,
        rating: rating ? parseFloat(rating) : null,
        content
      })
      .where(eq(review.reviewid, parseInt(id, 10)))
      .returning();

    if (updated.length === 0) {
      return res.status(404).json({ error: 'Review not found' });
    }

    console.log('Review updated successfully:', updated[0]);
    res.json(updated[0]);
  } catch (error) {
    console.error('Error updating review:', error);
    res.status(500).json({ error: 'Failed to update review' });
  }
});

// Endpoint to delete a review
app.delete('/api/reviews/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const deleted = await db.delete(review)
      .where(eq(review.reviewid, parseInt(id, 10)))
      .returning();

    if (deleted.length === 0) {
      return res.status(404).json({ error: 'Review not found' });
    }

    console.log('Review deleted successfully:', deleted[0]);
    res.status(204).send(); // No content
  } catch (error) {
    console.error('Error deleting review:', error);
    res.status(500).json({ error: 'Failed to delete review' });
  }
});

// Endpoint to update an ad creative
app.put('/api/adcreatives/:id', async (req, res) => {
  const { id } = req.params;
  const { entityid, reportid, format, campaign, creativeurl, performancenotes, adplatform } = req.body;

  if (!entityid || !reportid) {
    return res.status(400).json({ error: 'Entity ID and Report ID are required' });
  }

  try {
    const updated = await db.update(adcreative)
      .set({ 
        entityid: parseInt(entityid, 10),
        reportid: parseInt(reportid, 10),
        format,
        campaign,
        creativeurl,
        performancenotes,
        adplatform
      })
      .where(eq(adcreative.adid, parseInt(id, 10)))
      .returning();

    if (updated.length === 0) {
      return res.status(404).json({ error: 'Ad creative not found' });
    }

    console.log('Ad creative updated successfully:', updated[0]);
    res.json(updated[0]);
  } catch (error) {
    console.error('Error updating ad creative:', error);
    res.status(500).json({ error: 'Failed to update ad creative' });
  }
});

// Endpoint to delete an ad creative
app.delete('/api/adcreatives/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const deleted = await db.delete(adcreative)
      .where(eq(adcreative.adid, parseInt(id, 10)))
      .returning();

    if (deleted.length === 0) {
      return res.status(404).json({ error: 'Ad creative not found' });
    }

    console.log('Ad creative deleted successfully:', deleted[0]);
    res.status(204).send(); // No content
  } catch (error) {
    console.error('Error deleting ad creative:', error);
    res.status(500).json({ error: 'Failed to delete ad creative' });
  }
});

// Endpoint to update a report section
app.put('/api/reportsections/:id', async (req, res) => {
  const { id } = req.params;
  const { reportid, sectionname, position, description } = req.body;

  if (!reportid || !sectionname) {
    return res.status(400).json({ error: 'Report ID and section name are required' });
  }

  try {
    const updated = await db.update(reportsection)
      .set({ 
        reportid: parseInt(reportid, 10),
        sectionname,
        position: position ? parseInt(position, 10) : null,
        description
      })
      .where(eq(reportsection.sectionid, parseInt(id, 10)))
      .returning();

    if (updated.length === 0) {
      return res.status(404).json({ error: 'Report section not found' });
    }

    console.log('Report section updated successfully:', updated[0]);
    res.json(updated[0]);
  } catch (error) {
    console.error('Error updating report section:', error);
    res.status(500).json({ error: 'Failed to update report section' });
  }
});

// Endpoint to delete a report section
app.delete('/api/reportsections/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const deleted = await db.delete(reportsection)
      .where(eq(reportsection.sectionid, parseInt(id, 10)))
      .returning();

    if (deleted.length === 0) {
      return res.status(404).json({ error: 'Report section not found' });
    }

    console.log('Report section deleted successfully:', deleted[0]);
    res.status(204).send(); // No content
  } catch (error) {
    console.error('Error deleting report section:', error);
    res.status(500).json({ error: 'Failed to delete report section' });
  }
});

// Endpoint to update a section item
app.put('/api/sectionitems/:id', async (req, res) => {
  const { id } = req.params;
  const { sectionid, itemtitle, content, position, type } = req.body;

  if (!sectionid || !itemtitle) {
    return res.status(400).json({ error: 'Section ID and item title are required' });
  }

  try {
    const updated = await db.update(sectionitem)
      .set({ 
        sectionid: parseInt(sectionid, 10),
        itemtitle,
        content,
        position: position ? parseInt(position, 10) : null,
        type
      })
      .where(eq(sectionitem.itemid, parseInt(id, 10)))
      .returning();

    if (updated.length === 0) {
      return res.status(404).json({ error: 'Section item not found' });
    }

    console.log('Section item updated successfully:', updated[0]);
    res.json(updated[0]);
  } catch (error) {
    console.error('Error updating section item:', error);
    res.status(500).json({ error: 'Failed to update section item' });
  }
});

// Endpoint to delete a section item
app.delete('/api/sectionitems/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const deleted = await db.delete(sectionitem)
      .where(eq(sectionitem.itemid, parseInt(id, 10)))
      .returning();

    if (deleted.length === 0) {
      return res.status(404).json({ error: 'Section item not found' });
    }

    console.log('Section item deleted successfully:', deleted[0]);
    res.status(204).send(); // No content
  } catch (error) {
    console.error('Error deleting section item:', error);
    res.status(500).json({ error: 'Failed to delete section item' });
  }
});

// Endpoint to update an insight
app.put('/api/insights/:id', async (req, res) => {
  const { id } = req.params;
  const { reportsectionid, title, type, content, position, priority } = req.body;

  if (!reportsectionid || !title) {
    return res.status(400).json({ error: 'Report Section ID and title are required' });
  }

  try {
    const updated = await db.update(insight)
      .set({ 
        reportsectionid: parseInt(reportsectionid, 10),
        title,
        type,
        content,
        position: position ? parseInt(position, 10) : null,
        priority
      })
      .where(eq(insight.insightid, parseInt(id, 10)))
      .returning();

    if (updated.length === 0) {
      return res.status(404).json({ error: 'Insight not found' });
    }

    console.log('Insight updated successfully:', updated[0]);
    res.json(updated[0]);
  } catch (error) {
    console.error('Error updating insight:', error);
    res.status(500).json({ error: 'Failed to update insight' });
  }
});

// Endpoint to delete an insight
app.delete('/api/insights/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const deleted = await db.delete(insight)
      .where(eq(insight.insightid, parseInt(id, 10)))
      .returning();

    if (deleted.length === 0) {
      return res.status(404).json({ error: 'Insight not found' });
    }

    console.log('Insight deleted successfully:', deleted[0]);
    res.status(204).send(); // No content
  } catch (error) {
    console.error('Error deleting insight:', error);
    res.status(500).json({ error: 'Failed to delete insight' });
  }
});

// Endpoint to update a metric value
app.put('/api/metricvalues/:id', async (req, res) => {
  const { id } = req.params;
  const { metricid, entityid, reportid, periodtype, periodvalue, value, additionalinfo } = req.body;

  if (metricid === undefined || entityid === undefined || value === undefined) {
    return res.status(400).json({ error: 'Metric ID, Entity ID, and value are required' });
  }

  try {
    const updated = await db.update(metricvalue)
      .set({ 
        metricid: parseInt(metricid, 10),
        entityid: parseInt(entityid, 10),
        reportid: reportid ? parseInt(reportid, 10) : null,
        periodtype,
        periodvalue,
        value,
        additionalinfo
      })
      .where(eq(metricvalue.valueid, parseInt(id, 10)))
      .returning();

    if (updated.length === 0) {
      return res.status(404).json({ error: 'Metric value not found' });
    }

    console.log('Metric value updated successfully:', updated[0]);
    res.json(updated[0]);
  } catch (error) {
    console.error('Error updating metric value:', error);
    res.status(500).json({ error: 'Failed to update metric value' });
  }
});

// Endpoint to delete a metric value
app.delete('/api/metricvalues/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const deleted = await db.delete(metricvalue)
      .where(eq(metricvalue.valueid, parseInt(id, 10)))
      .returning();

    if (deleted.length === 0) {
      return res.status(404).json({ error: 'Metric value not found' });
    }

    console.log('Metric value deleted successfully:', deleted[0]);
    res.status(204).send(); // No content
  } catch (error) {
    console.error('Error deleting metric value:', error);
    res.status(500).json({ error: 'Failed to delete metric value' });
  }
});

// Endpoint to update a report medium
app.put('/api/reportmedia/:id', async (req, res) => {
  const { id } = req.params;
  const { reportid, sectionid, type, url, caption, filesize } = req.body;

  if (!reportid || !type || !url) {
    return res.status(400).json({ error: 'Report ID, type, and URL are required' });
  }

  try {
    const updated = await db.update(reportmedia)
      .set({ 
        reportid: parseInt(reportid, 10),
        sectionid: sectionid ? parseInt(sectionid, 10) : null,
        type,
        url,
        caption,
        filesize: filesize ? parseInt(filesize, 10) : null
      })
      .where(eq(reportmedia.mediaid, parseInt(id, 10)))
      .returning();

    if (updated.length === 0) {
      return res.status(404).json({ error: 'Report medium not found' });
    }

    console.log('Report medium updated successfully:', updated[0]);
    res.json(updated[0]);
  } catch (error) {
    console.error('Error updating report medium:', error);
    res.status(500).json({ error: 'Failed to update report medium' });
  }
});

// Endpoint to delete a report medium
app.delete('/api/reportmedia/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const deleted = await db.delete(reportmedia)
      .where(eq(reportmedia.mediaid, parseInt(id, 10)))
      .returning();

    if (deleted.length === 0) {
      return res.status(404).json({ error: 'Report medium not found' });
    }

    console.log('Report medium deleted successfully:', deleted[0]);
    res.status(204).send(); // No content
  } catch (error) {
    console.error('Error deleting report medium:', error);
    res.status(500).json({ error: 'Failed to delete report medium' });
  }
});

// --> ADD NEW API ENDPOINTS HERE <--
// See README_NEON.md, section '2. Añadir el Endpoint en el Backend' for instructions.

app.listen(port, () => {
  console.log(`API server listening on port ${port}`);
});
