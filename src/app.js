const express = require("express");
const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');
const tableRoutes = require("./routes/table_routes");
const logsRoutes = require("./routes/logs_routes");
const { errorHandler, notFound } = require("./middleware/errorHandler");
const logger = require("./services/LoggerService");
const port = process.env.PORT || 3000;
const path = require("path");
const fs = require("fs-extra");
const app = express();

// Configuration Swagger/OpenAPI
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'CSV to DB API',
      version: '1.0.0',
      description: 'API REST pour télécharger des fichiers CSV, créer des tables SQLite et exporter des données en SQL. Cette API permet de gérer facilement vos données CSV et de les transformer en bases de données.',
      contact: {
        name: 'Support API',
        url: 'https://github.com/devOnlyPurple/csv_to_db',
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT',
      },
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Serveur de développement',
      },
      {
        url: 'http://localhost:3000',
        description: 'Serveur de production',
      },
    ],
    tags: [
      {
        name: 'Tables',
        description: 'Opérations sur les tables et fichiers CSV',
      },
      {
        name: 'Logs',
        description: 'Gestion et consultation des logs système',
      },
    ],
    components: {
      schemas: {
        SuccessResponse: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: true,
            },
            message: {
              type: 'string',
              example: 'Operation completed successfully',
            },
            data: {
              type: 'object',
            },
          },
        },
        ErrorResponse: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: false,
            },
            message: {
              type: 'string',
              example: 'An error occurred',
            },
            error: {
              type: 'string',
            },
          },
        },
        TableData: {
          type: 'object',
          properties: {
            tableName: {
              type: 'string',
              example: 'users',
            },
            columns: {
              type: 'array',
              items: {
                type: 'string',
              },
              example: ['id', 'name', 'email'],
            },
            rows: {
              type: 'array',
              items: {
                type: 'object',
              },
            },
            rowCount: {
              type: 'integer',
              example: 100,
            },
          },
        },
        LogEntry: {
          type: 'object',
          properties: {
            timestamp: {
              type: 'string',
              format: 'date-time',
              example: '2025-10-12T10:30:00.000Z',
            },
            level: {
              type: 'string',
              enum: ['INFO', 'SUCCESS', 'WARNING', 'ERROR'],
              example: 'INFO',
            },
            module: {
              type: 'string',
              example: 'CSV_SERVICE',
            },
            message: {
              type: 'string',
              example: 'CSV file uploaded successfully',
            },
          },
        },
      },
    },
  },
  apis: ['./src/routes/*.js'],
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);

// Middleware pour parser le JSON
app.use(express.json());

// Documentation Swagger
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'CSV to DB API Documentation',
}));

// Routes API
app.use("/api/v1/tables", tableRoutes);
app.use("/api/v1/logs", logsRoutes);

// Route racine pour la page d'accueil
app.get("/", (req, res) => {
  logger.info('APP', `Page d'accueil consultée par ${req.ip || 'inconnu'}`);
  return res.status(200).json({
    success: true,
    message: "Welcome to CSV to DB Converter",
    description: "A Node.js application that converts CSV files into database tables",
    version: "1.0.0",
    endpoints: {
      documentation: "http://localhost:3000/api-docs/",
      api_root: "http://localhost:3000/api/v1/",
      upload_csv: "POST http://localhost:3000/api/v1/tables/upload",
      get_table: "GET http://localhost:3000/api/v1/tables/:tableName",
      export_sql: "GET http://localhost:3000/api/v1/tables/:tableName/export",
      download_sql: "GET http://localhost:3000/api/v1/tables/download/:fileName"
    },
    quick_start: [
      "1. Upload a CSV file: POST /api/v1/tables/upload",
      "2. View data: GET /api/v1/tables/:tableName", 
      "3. Export to SQL: GET /api/v1/tables/:tableName/export",
      "4. Download SQL: GET /api/v1/tables/download/:fileName"
    ]
  });
});

// Route racine pour la documentation de l'API
app.get("/api/v1/", (req, res) => {
  logger.info('APP', `Documentation API consultée par ${req.ip || 'inconnu'}`);
  return res.status(200).json({
    success: true,
    message: "Welcome to CSV to DB API",
    data: [
      {
        method: "POST",
        path: "/api/v1/tables/upload",
        description: "Upload a CSV file",
      },
      {
        method: "GET",
        path: "/api/v1/tables/:tableName",
        description: "Get table data",
      },
      {
        method: "GET",
        path: "/api/v1/tables/:tableName/export",
        description: "Export table data as SQL",
      },
      {
        method: "GET",
        path: "/api/v1/tables/download/:fileName",
        description: "Download generated SQL file",
      },
      {
        method: "GET",
        path: "/api/v1/logs",
        description: "View recent logs",
      },
      {
        method: "GET",
        path: "/api/v1/logs/errors",
        description: "View recent errors only",
      },
      {
        method: "GET",
        path: "/api/v1/logs/stats",
        description: "View logs statistics",
      },
      {
        method: "POST",
        path: "/api/v1/logs/cleanup",
        description: "Clean old log files",
      },
    ],
  });
});

// Middleware pour les routes non trouvées
app.use(notFound);

// Middleware de gestion d'erreurs (doit être le dernier)
app.use(errorHandler);

// Démarrer le serveur seulement si le fichier est exécuté directement
let server;
if (require.main === module) {
  server = app.listen(port, () => {
    logger.success('APP', `Server running on http://localhost:${port}`);

    // Nettoyage automatique des logs tous les jours à minuit
    scheduleLogCleanup();
  });
}

// Fonction pour programmer le nettoyage automatique des logs
function scheduleLogCleanup() {
  const now = new Date();
  const nextMidnight = new Date();
  nextMidnight.setDate(now.getDate() + 1);
  nextMidnight.setHours(0, 0, 0, 0);

  const msUntilMidnight = nextMidnight.getTime() - now.getTime();

  setTimeout(async () => {
    logger.info('APP', 'Démarrage nettoyage automatique des logs');
    await logger.cleanupOldLogs();
    logger.success('APP', 'Nettoyage automatique des logs terminé');

    // Programmer le prochain nettoyage
    scheduleLogCleanup();
  }, msUntilMidnight);
}

// Exporter l'app et le serveur pour les tests
module.exports = app;
module.exports.server = server;
