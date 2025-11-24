import express from 'express';
import sqlite3Import from 'sqlite3';
import cors from 'cors';
import bodyParser from 'body-parser';
import path from 'path'; // Not strictly used in the routes, but was in original
import swaggerUi from 'swagger-ui-express'; // Added Swagger UI import
import swaggerJsdoc from 'swagger-jsdoc'; // Added Swagger JSDoc import

const sqlite3 = sqlite3Import.verbose();

const app = express();
const PORT = 5000; // Assuming the user wants to keep 5000

// Swagger definition
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'CrisisSync API',
      version: '1.0.0',
      description: 'API for CrisisSync incident management',
    },
    servers: [
      {
        url: `http://localhost:${PORT}`, // Base URL for the API
        description: 'Local Development Server',
      },
    ],
    components: {
      schemas: {
        Incident: {
          type: 'object',
          required: ['id', 'title', 'description', 'type', 'status', 'severity', 'latitude', 'longitude', 'timestamp', 'reporterName'],
          properties: {
            id: {
              type: 'string',
              description: 'Unique identifier for the incident',
              example: '123e4567-e89b-12d3-a456-426614174000',
            },
            title: {
              type: 'string',
              description: 'Brief title of the incident',
              example: 'Flash Flood in Kibera',
            },
            description: {
              type: 'string',
              description: 'Detailed description of the incident',
              example: 'Heavy rains caused river banks to overflow near the bridge. Several homes affected.',
            },
            type: {
              type: 'string',
              description: 'Type of disaster or incident',
              example: 'Flood',
            },
            status: {
              type: 'string',
              description: 'Current status of the incident',
              example: 'Investigating',
            },
            severity: {
              type: 'string',
              description: 'Severity level of the incident',
              example: 'High',
            },
            latitude: {
              type: 'number',
              format: 'float',
              description: 'Latitude of the incident location',
              example: -1.3120,
            },
            longitude: {
              type: 'number',
              format: 'float',
              description: 'Longitude of the incident location',
              example: 36.7890,
            },
            timestamp: {
              type: 'integer',
              format: 'int64',
              description: 'Timestamp when the incident was reported (milliseconds since epoch)',
              example: 1678886400000,
            },
            reporterName: {
              type: 'string',
              description: 'Name of the person who reported the incident',
              example: 'John Kamau',
            },
            aiAnalysis: {
              type: 'string',
              description: 'AI-generated analysis or insights (optional)',
              example: 'High risk of waterborne diseases. Immediate evacuation.',
            },
            imageUrl: {
              type: 'string',
              description: 'URL of an image related to the incident (optional)',
              example: 'https://images.unsplash.com/photo-1548625361-888469d6571d?auto=format&fit=crop&q=80&w=400',
            },
            deployedResources: {
              type: 'array',
              items: {
                type: 'string',
              },
              description: 'List of resources deployed (optional)',
              example: ['Red Cross Unit 4', 'Nairobi Fire Dept'],
            },
          },
        },
      },
    },
  },
  apis: ['./server.js'], // Files containing annotations for the OpenAPI specification
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);

// Middleware
app.use(cors()); // CORS middleware
app.use(bodyParser.json({ limit: '10mb' })); // Increased limit for base64 images

// Serve Swagger UI
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Database Setup
const db = new sqlite3.Database('./database.sqlite', (err) => {
  if (err) {
    console.error('Error opening database', err.message);
  } else {
    console.log('Connected to the SQLite database.');
    initDb();
  }
});

function initDb() {
  db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS incidents (
      id TEXT PRIMARY KEY,
      title TEXT,
      description TEXT,
      type TEXT,
      status TEXT,
      severity TEXT,
      latitude REAL,
      longitude REAL,
      timestamp INTEGER,
      reporterName TEXT,
      aiAnalysis TEXT,
      imageUrl TEXT,
      deployedResources TEXT
    )`);

    // Check if empty, if so, seed with mock data
    db.get("SELECT count(*) as count FROM incidents", [], (err, row) => {
      if (err) return console.error(err.message);
      if (row.count === 0) {
        console.log("Seeding database with initial data...");
        seedData();
      }
    });
  });
}

function seedData() {
  const stmt = db.prepare(`INSERT INTO incidents VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`);
  
  const mocks = [
    {
      id: '1',
      title: 'Flash Flood in Kibera',
      description: 'Heavy rains caused river banks to overflow near the bridge. Several homes affected.',
      type: 'Flood',
      status: 'Investigating',
      severity: 'High',
      latitude: -1.3120,
      longitude: 36.7890,
      timestamp: Date.now() - 3600000,
      reporterName: 'John Kamau',
      aiAnalysis: 'High risk of waterborne diseases. Immediate evacuation of low-lying structures recommended.',
      imageUrl: 'https://images.unsplash.com/photo-1548625361-888469d6571d?auto=format&fit=crop&q=80&w=400',
      deployedResources: JSON.stringify(['Red Cross Unit 4', 'Nairobi Fire Dept'])
    },
    {
      id: '2',
      title: 'Matatu Collision on Thika Superhighway',
      description: '14-seater matatu collided with a lorry near Roysambu. Traffic standstill.',
      type: 'Road Accident',
      status: 'Pending',
      severity: 'Critical',
      latitude: -1.2186,
      longitude: 36.8868,
      timestamp: Date.now() - 7200000,
      reporterName: 'Jane Wanjiku',
      aiAnalysis: 'Potential multiple casualties. Requires immediate advanced life support units.',
      imageUrl: 'https://images.unsplash.com/photo-1566416954271-965a3952f207?auto=format&fit=crop&q=80&w=400',
      deployedResources: JSON.stringify([])
    }
  ];

  mocks.forEach(i => {
    stmt.run(i.id, i.title, i.description, i.type, i.status, i.severity, i.latitude, i.longitude, i.timestamp, i.reporterName, i.aiAnalysis, i.imageUrl, i.deployedResources);
  });
  stmt.finalize();
}

// --- Routes ---

/**
 * @swagger
 * tags:
 *   name: Incidents
 *   description: Incident management
 */

/**
 * @swagger
 * /api/incidents:
 *   get:
 *     summary: Retrieve a list of incidents
 *     tags: [Incidents]
 *     responses:
 *       200:
 *         description: A list of incidents.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Incident'
 *       400:
 *         description: Error retrieving incidents.
 */
// Get all incidents
app.get('/api/incidents', (req, res) => {
  db.all("SELECT * FROM incidents ORDER BY timestamp DESC", [], (err, rows) => {
    if (err) {
      res.status(400).json({ "error": err.message });
      return;
    }
    // Parse JSON strings back to objects
    const incidents = rows.map(row => ({
      ...row,
      location: { latitude: row.latitude, longitude: row.longitude },
      deployedResources: JSON.parse(row.deployedResources || '[]')
    }));
    res.json({ data: incidents });
  });
});

/**
 * @swagger
 * /api/incidents:
 *   post:
 *     summary: Create a new incident
 *     tags: [Incidents]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Incident'
 *     responses:
 *       200:
 *         description: Incident created successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 data:
 *                   $ref: '#/components/schemas/Incident'
 *                 id:
 *                   type: string
 *       400:
 *         description: Invalid input or error creating incident.
 */
// Create new incident
app.post('/api/incidents', (req, res) => {
  const { id, title, description, type, status, severity, location, timestamp, reporterName, aiAnalysis, imageUrl, deployedResources } = req.body;
  const sql = `INSERT INTO incidents (id, title, description, type, status, severity, latitude, longitude, timestamp, reporterName, aiAnalysis, imageUrl, deployedResources) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)`;
  const params = [id, title, description, type, status, severity, location.latitude, location.longitude, timestamp, reporterName, aiAnalysis, imageUrl, JSON.stringify(deployedResources || [])];
  
  db.run(sql, params, function (err) {
    if (err) {
      res.status(400).json({ "error": err.message });
      return;
    }
    res.json({
      message: "success",
      data: req.body,
      id: this.lastID
    });
  });
});

/**
 * @swagger
 * /api/incidents/{id}:
 *   put:
 *     summary: Update an existing incident
 *     tags: [Incidents]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The incident ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 description: New status of the incident
 *               deployedResources:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: List of deployed resources
 *             example:
 *               status: "Resolved"
 *               deployedResources: ["Red Cross Unit 4", "Police Dept"]
 *     responses:
 *       200:
 *         description: Incident updated successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 changes:
 *                   type: integer
 *       400:
 *         description: Invalid input or error updating incident.
 *       404:
 *         description: Incident not found.
 */
// Update incident
app.put('/api/incidents/:id', (req, res) => {
  const { status, deployedResources } = req.body;
  const sql = `UPDATE incidents SET status = ?, deployedResources = ? WHERE id = ?`;
  const params = [status, JSON.stringify(deployedResources || []), req.params.id];

  db.run(sql, params, function(err) {
    if (err) {
      res.status(400).json({ "error": err.message });
      return;
    }
    res.json({ message: "success", changes: this.changes });
  });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
