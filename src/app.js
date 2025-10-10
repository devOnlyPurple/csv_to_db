const express = require("express");
const tableRoutes = require("./routes/table_routes");
const logsRoutes = require("./routes/logs_routes");
const { errorHandler, notFound } = require("./middleware/errorHandler");
const logger = require("./services/LoggerService");
const port = process.env.PORT || 3000;
const path = require("path");
const fs = require("fs-extra");
const app = express();

// Middleware pour parser le JSON
app.use(express.json());

// Routes API
app.use("/api/v1/tables", tableRoutes);
app.use("/api/v1/logs", logsRoutes);

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
