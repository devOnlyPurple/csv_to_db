const express = require("express");
const router = express.Router();
const logger = require("../services/LoggerService");
const fs = require("fs-extra");
const path = require("path");

/**
 * Endpoint pour consulter les logs récents
 */
router.get("/logs", async (req, res) => {
  try {
    logger.info('LOGS_ENDPOINT', `Consultation des logs demandée par ${req.ip || 'inconnu'}`);

    const hours = parseInt(req.query.hours) || 24;
    const logs = await logger.getRecentLogs(hours);

    logger.success('LOGS_ENDPOINT', `Logs récupérés: ${logs.length} entrées`);
    res.json({
      success: true,
      data: logs,
      hours: hours,
      count: logs.length
    });
  } catch (error) {
    logger.error('LOGS_ENDPOINT', 'Erreur récupération logs', error);
    res.status(500).json({
      success: false,
      error: "Erreur récupération logs"
    });
  }
});

/**
 * Endpoint pour consulter les erreurs récentes
 */
router.get("/logs/errors", async (req, res) => {
  try {
    logger.info('LOGS_ENDPOINT', `Consultation des erreurs demandée par ${req.ip || 'inconnu'}`);

    const hours = parseInt(req.query.hours) || 24;

    // Récupérer seulement les erreurs
    const allLogs = await logger.getRecentLogs(hours);
    const errorLogs = allLogs.filter(log => log.includes('[ERROR]'));

    logger.success('LOGS_ENDPOINT', `Erreurs récupérées: ${errorLogs.length} entrées`);
    res.json({
      success: true,
      data: errorLogs,
      hours: hours,
      count: errorLogs.length
    });
  } catch (error) {
    logger.error('LOGS_ENDPOINT', 'Erreur récupération erreurs', error);
    res.status(500).json({
      success: false,
      error: "Erreur récupération erreurs"
    });
  }
});

/**
 * Endpoint pour déclencher le nettoyage manuel des logs
 */
router.post("/logs/cleanup", async (req, res) => {
  try {
    logger.info('LOGS_ENDPOINT', `Nettoyage manuel des logs demandé par ${req.ip || 'inconnu'}`);

    await logger.cleanupOldLogs();

    logger.success('LOGS_ENDPOINT', 'Nettoyage des logs terminé');
    res.json({
      success: true,
      message: "Logs nettoyés avec succès"
    });
  } catch (error) {
    logger.error('LOGS_ENDPOINT', 'Erreur nettoyage logs', error);
    res.status(500).json({
      success: false,
      error: "Erreur nettoyage logs"
    });
  }
});

/**
 * Endpoint pour consulter les statistiques des logs
 */
router.get("/logs/stats", async (req, res) => {
  try {
    logger.info('LOGS_ENDPOINT', `Statistiques des logs demandées par ${req.ip || 'inconnu'}`);

    const logsDir = path.join(__dirname, '../../logs');
    const files = await fs.readdir(logsDir);
    const stats = {};

    for (const file of files) {
      if (file.endsWith('.log')) {
        const filePath = path.join(logsDir, file);
        const fileStats = await fs.stat(filePath);
        const content = await fs.readFile(filePath, 'utf8');

        const lines = content.split('\n').filter(line => line.trim());
        const errorCount = lines.filter(line => line.includes('[ERROR]')).length;
        const warnCount = lines.filter(line => line.includes('[WARN]')).length;
        const infoCount = lines.filter(line => line.includes('[INFO]')).length;
        const successCount = lines.filter(line => line.includes('[SUCCESS]')).length;

        stats[file] = {
          size: `${(fileStats.size / 1024).toFixed(2)}KB`,
          lines: lines.length,
          errors: errorCount,
          warnings: warnCount,
          info: infoCount,
          success: successCount,
          lastModified: fileStats.mtime.toISOString()
        };
      }
    }

    logger.success('LOGS_ENDPOINT', `Statistiques récupérées pour ${Object.keys(stats).length} fichiers`);
    res.json({
      success: true,
      data: stats,
      totalFiles: Object.keys(stats).length
    });
  } catch (error) {
    logger.error('LOGS_ENDPOINT', 'Erreur récupération statistiques', error);
    res.status(500).json({
      success: false,
      error: "Erreur récupération statistiques"
    });
  }
});

module.exports = router;
