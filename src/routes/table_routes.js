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

/**
 * @swagger
 * /api/v1/tables/upload:
 *   post:
 *     tags:
 *       - Tables
 *     summary: Télécharger un fichier CSV
 *     description: |
 *       Télécharge un fichier CSV et crée automatiquement une table SQLite avec les données.
 *       
 *       **Fonctionnalités:**
 *       - Détection automatique des colonnes et types de données
 *       - Validation du format CSV
 *       - Création de la table SQLite
 *       - Import des données dans la base de données
 *       - Taille maximale: 10 MB
 *       
 *       **Format attendu:**
 *       - Fichier CSV avec en-têtes en première ligne
 *       - Encodage UTF-8 recommandé
 *       - Délimiteur: virgule (,)
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - file
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *                 description: Fichier CSV à télécharger (max 10 MB)
 *     responses:
 *       200:
 *         description: Fichier CSV téléchargé et table créée avec succès
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *             example:
 *               success: true
 *               message: "CSV uploaded and table created successfully"
 *               data:
 *                 tableName: "users"
 *                 rowCount: 150
 *                 columns: ["id", "name", "email", "age"]
 *       400:
 *         description: Erreur de validation ou fichier invalide
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               success: false
 *               message: "Invalid CSV file"
 *               error: "No file uploaded or invalid format"
 *       413:
 *         description: Fichier trop volumineux (> 10 MB)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Erreur serveur lors du traitement
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post("/upload", upload.single("file"), (req, res, next) => {
  logger.info('ROUTES', `Upload CSV: ${req.file ? req.file.originalname : 'aucun fichier'}`, {
    fileSize: req.file ? `${(req.file.size / 1024).toFixed(2)}KB` : '0KB',
    fileName: req.file ? req.file.originalname : 'aucun'
  });
  tableController.uploadCSV(req, res).catch(next);
});

/**
 * @swagger
 * /api/v1/tables/{tableName}:
 *   get:
 *     tags:
 *       - Tables
 *     summary: Récupérer les données d'une table
 *     description: |
 *       Récupère toutes les données d'une table SQLite spécifique.
 *       
 *       **Informations retournées:**
 *       - Nom de la table
 *       - Liste des colonnes
 *       - Toutes les lignes de données
 *       - Nombre total de lignes
 *     parameters:
 *       - in: path
 *         name: tableName
 *         required: true
 *         schema:
 *           type: string
 *         description: Nom de la table à interroger
 *         example: users
 *     responses:
 *       200:
 *         description: Données de la table récupérées avec succès
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/TableData'
 *             example:
 *               success: true
 *               message: "Table data retrieved successfully"
 *               data:
 *                 tableName: "users"
 *                 columns: ["id", "name", "email", "age"]
 *                 rows:
 *                   - id: 1
 *                     name: "John Doe"
 *                     email: "john@example.com"
 *                     age: 30
 *                   - id: 2
 *                     name: "Jane Smith"
 *                     email: "jane@example.com"
 *                     age: 25
 *                 rowCount: 2
 *       404:
 *         description: Table non trouvée
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               success: false
 *               message: "Table not found"
 *               error: "The table 'users' does not exist"
 *       500:
 *         description: Erreur serveur
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get("/:tableName", (req, res, next) => {
  logger.info('ROUTES', `GET table: ${req.params.tableName}`);
  tableController.getTable(req, res).catch(next);
});

/**
 * @swagger
 * /api/v1/tables/{tableName}/export:
 *   get:
 *     tags:
 *       - Tables
 *     summary: Exporter une table en SQL
 *     description: |
 *       Génère un fichier SQL contenant les instructions CREATE TABLE et INSERT pour une table spécifique.
 *       
 *       **Contenu du fichier SQL:**
 *       - Instruction DROP TABLE IF EXISTS
 *       - Instruction CREATE TABLE avec tous les champs
 *       - Instructions INSERT pour toutes les données
 *       
 *       Le fichier est sauvegardé dans le dossier `data/sql/` et peut être téléchargé via l'endpoint `/download`.
 *     parameters:
 *       - in: path
 *         name: tableName
 *         required: true
 *         schema:
 *           type: string
 *         description: Nom de la table à exporter
 *         example: users
 *     responses:
 *       200:
 *         description: Export SQL généré avec succès
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *             example:
 *               success: true
 *               message: "SQL export created successfully"
 *               data:
 *                 fileName: "users_2025-10-12.sql"
 *                 filePath: "data/sql/users_2025-10-12.sql"
 *                 downloadUrl: "/api/v1/tables/download/users_2025-10-12.sql"
 *                 fileSize: "2.5 KB"
 *       404:
 *         description: Table non trouvée
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Erreur lors de la génération du fichier SQL
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get("/:tableName/export", (req, res, next) => {
  logger.info('ROUTES', `Export SQL: ${req.params.tableName}`);
  tableController.exportTable(req, res).catch(next);
});

/**
 * @swagger
 * /api/v1/tables/download/{fileName}:
 *   get:
 *     tags:
 *       - Tables
 *     summary: Télécharger un fichier SQL généré
 *     description: |
 *       Télécharge un fichier SQL précédemment généré via l'endpoint `/export`.
 *       
 *       Le fichier est envoyé en tant que pièce jointe avec le type MIME approprié.
 *     parameters:
 *       - in: path
 *         name: fileName
 *         required: true
 *         schema:
 *           type: string
 *         description: Nom du fichier SQL à télécharger
 *         example: users_2025-10-12.sql
 *     responses:
 *       200:
 *         description: Fichier SQL téléchargé avec succès
 *         content:
 *           application/sql:
 *             schema:
 *               type: string
 *               format: binary
 *       404:
 *         description: Fichier non trouvé
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               success: false
 *               message: "File not found"
 *               error: "The file 'users_2025-10-12.sql' does not exist"
 *       500:
 *         description: Erreur lors du téléchargement
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get("/download/:fileName", (req, res, next) => {
  logger.info('ROUTES', `Download: ${req.params.fileName}`);
  tableController.downloadSQL(req, res).catch(next);
});

module.exports = router;
