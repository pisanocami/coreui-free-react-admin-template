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

// --> ADD NEW API ENDPOINTS HERE <--
// See README_NEON.md, section '2. Añadir el Endpoint en el Backend' for instructions.

app.listen(port, () => {
  console.log(`API server listening on port ${port}`);
});
