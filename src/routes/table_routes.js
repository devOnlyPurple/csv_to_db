const express = require("express");
const router = express.Router();
const multer = require("multer");
const TableController = require("../controllers/TableController");
const { asyncHandler } = require("../middleware/errorHandler");
const logger = require("../services/LoggerService");

const upload = multer({
  dest: "uploads/",
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB max
  }
});

const tableController = new TableController();

// Middleware pour logger les requêtes
router.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  logger.info('ROUTES', `Requête ${req.method} ${req.originalUrl}`, {
    ip: req.ip || 'inconnu',
    userAgent: req.get('User-Agent') || 'inconnu',
    timestamp: timestamp
  });
  next();
});

// Route pour télécharger un fichier CSV
router.post("/upload", upload.single("file"), (req, res, next) => {
  logger.info('ROUTES', `Upload CSV: ${req.file ? req.file.originalname : 'aucun fichier'}`, {
    fileSize: req.file ? `${(req.file.size / 1024).toFixed(2)}KB` : '0KB',
    fileName: req.file ? req.file.originalname : 'aucun'
  });
  tableController.uploadCSV(req, res).catch(next);
});

// Route pour récupérer les données d'une table
router.get("/:tableName", (req, res, next) => {
  logger.info('ROUTES', `GET table: ${req.params.tableName}`);
  tableController.getTable(req, res).catch(next);
});

// Route pour exporter une table en SQL
router.get("/:tableName/export", (req, res, next) => {
  logger.info('ROUTES', `Export SQL: ${req.params.tableName}`);
  tableController.exportTable(req, res).catch(next);
});

// Route pour télécharger un fichier SQL généré
router.get("/download/:fileName", (req, res, next) => {
  logger.info('ROUTES', `Download: ${req.params.fileName}`);
  tableController.downloadSQL(req, res).catch(next);
});

module.exports = router;
