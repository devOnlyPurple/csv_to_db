const express = require("express");
const router = express.Router();
const logger = require("../services/LoggerService");
const fs = require("fs-extra");
const path = require("path");

/**
 * @swagger
 * /api/v1/logs:
 *   get:
 *     tags:
 *       - Logs
 *     summary: Consulter les logs récents
 *     description: |
 *       Récupère les entrées de logs système des dernières heures.
 *       
 *       **Informations retournées:**
 *       - Toutes les entrées de logs (INFO, SUCCESS, WARNING, ERROR)
 *       - Timestamp de chaque entrée
 *       - Module d'origine
 *       - Message détaillé
 *       
 *       Par défaut, récupère les logs des dernières 24 heures.
 *     parameters:
 *       - in: query
 *         name: hours
 *         schema:
 *           type: integer
 *           default: 24
 *           minimum: 1
 *           maximum: 168
 *         description: Nombre d'heures à récupérer (défaut 24h, max 168h = 7 jours)
 *         example: 48
 *     responses:
 *       200:
 *         description: Logs récupérés avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     type: string
 *                   description: Liste des entrées de logs
 *                 hours:
 *                   type: integer
 *                   example: 24
 *                 count:
 *                   type: integer
 *                   example: 150
 *             example:
 *               success: true
 *               data:
 *                 - "[2025-10-12T10:30:00.000Z] [INFO] [CSV_SERVICE] CSV file uploaded successfully"
 *                 - "[2025-10-12T10:31:00.000Z] [SUCCESS] [TABLE_CONTROLLER] Table created: users"
 *                 - "[2025-10-12T10:32:00.000Z] [ERROR] [FILE_SERVICE] Failed to read file"
 *               hours: 24
 *               count: 3
 *       500:
 *         description: Erreur lors de la récupération des logs
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
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
 * @swagger
 * /api/v1/logs/errors:
 *   get:
 *     tags:
 *       - Logs
 *     summary: Consulter uniquement les erreurs
 *     description: |
 *       Récupère uniquement les entrées de logs de type ERROR des dernières heures.
 *       
 *       **Utilisation:**
 *       - Monitoring des erreurs système
 *       - Debugging et diagnostic
 *       - Alertes et notifications
 *       
 *       Filtre automatiquement pour ne retourner que les logs contenant [ERROR].
 *     parameters:
 *       - in: query
 *         name: hours
 *         schema:
 *           type: integer
 *           default: 24
 *           minimum: 1
 *           maximum: 168
 *         description: Nombre d'heures à récupérer (défaut 24h, max 168h = 7 jours)
 *         example: 12
 *     responses:
 *       200:
 *         description: Erreurs récupérées avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     type: string
 *                   description: Liste des entrées d'erreur
 *                 hours:
 *                   type: integer
 *                   example: 24
 *                 count:
 *                   type: integer
 *                   example: 5
 *             example:
 *               success: true
 *               data:
 *                 - "[2025-10-12T10:32:00.000Z] [ERROR] [FILE_SERVICE] Failed to read file: ENOENT"
 *                 - "[2025-10-12T11:15:00.000Z] [ERROR] [CSV_SERVICE] Invalid CSV format"
 *               hours: 24
 *               count: 2
 *       500:
 *         description: Erreur lors de la récupération des erreurs
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
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
 * @swagger
 * /api/v1/logs/cleanup:
 *   post:
 *     tags:
 *       - Logs
 *     summary: Nettoyer les anciens fichiers de logs
 *     description: |
 *       Déclenche un nettoyage manuel des anciens fichiers de logs.
 *       
 *       **Action effectuée:**
 *       - Suppression des fichiers de logs datant de plus de 7 jours
 *       - Libération d'espace disque
 *       - Conservation des logs récents pour le monitoring
 *       
 *       **Note:** Un nettoyage automatique est également programmé quotidiennement à minuit.
 *     responses:
 *       200:
 *         description: Nettoyage effectué avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Logs nettoyés avec succès"
 *             example:
 *               success: true
 *               message: "Logs nettoyés avec succès"
 *       500:
 *         description: Erreur lors du nettoyage
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               success: false
 *               error: "Erreur nettoyage logs"
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
 * @swagger
 * /api/v1/logs/stats:
 *   get:
 *     tags:
 *       - Logs
 *     summary: Consulter les statistiques des logs
 *     description: |
 *       Récupère des statistiques détaillées sur tous les fichiers de logs.
 *       
 *       **Informations par fichier:**
 *       - Taille du fichier (en KB)
 *       - Nombre total de lignes
 *       - Nombre d'erreurs [ERROR]
 *       - Nombre d'avertissements [WARN]
 *       - Nombre d'infos [INFO]
 *       - Nombre de succès [SUCCESS]
 *       - Date de dernière modification
 *       
 *       **Utilisation:**
 *       - Vue d'ensemble de l'activité système
 *       - Monitoring de la santé de l'application
 *       - Identification rapide des problèmes
 *     responses:
 *       200:
 *         description: Statistiques récupérées avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   additionalProperties:
 *                     type: object
 *                     properties:
 *                       size:
 *                         type: string
 *                         example: "125.50KB"
 *                       lines:
 *                         type: integer
 *                         example: 1500
 *                       errors:
 *                         type: integer
 *                         example: 5
 *                       warnings:
 *                         type: integer
 *                         example: 12
 *                       info:
 *                         type: integer
 *                         example: 800
 *                       success:
 *                         type: integer
 *                         example: 683
 *                       lastModified:
 *                         type: string
 *                         format: date-time
 *                         example: "2025-10-12T10:30:00.000Z"
 *                 totalFiles:
 *                   type: integer
 *                   example: 3
 *             example:
 *               success: true
 *               data:
 *                 csv_to_db_2025-10-12.log:
 *                   size: "125.50KB"
 *                   lines: 1500
 *                   errors: 5
 *                   warnings: 12
 *                   info: 800
 *                   success: 683
 *                   lastModified: "2025-10-12T10:30:00.000Z"
 *                 csv_to_db_2025-10-11.log:
 *                   size: "98.25KB"
 *                   lines: 1200
 *                   errors: 3
 *                   warnings: 8
 *                   info: 650
 *                   success: 539
 *                   lastModified: "2025-10-11T23:59:00.000Z"
 *               totalFiles: 2
 *       500:
 *         description: Erreur lors de la récupération des statistiques
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
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
