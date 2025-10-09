const CsvService = require("../services/CsvService");
const FileService = require("../services/FileService");
const logger = require("../services/LoggerService");

/**
 * Contrôleur pour la gestion des tables CSV
 */
class TableController {
  constructor() {
    this.fileService = new FileService();
  }

  /**
   * Télécharge et traite un fichier CSV
   * @param {Object} req - Requête Express
   * @param {Object} res - Réponse Express
   */
  async uploadCSV(req, res) {
    logger.info("TABLE_CONTROLLER", `Upload CSV demandé par ${req.ip || 'inconnu'}`);

    try {
      // Valider le fichier uploadé
      const fileValidation = CsvService.validateUploadedFile(req.file);
      if (!fileValidation.valid) {
        logger.warn("TABLE_CONTROLLER", `Fichier invalide: ${fileValidation.error}`);
        await this.fileService.cleanupUploadFile(req.file.path);
        return res.status(400).json({
          success: false,
          error: fileValidation.error
        });
      }

      // Valider le nom de la table
      const tableName = req.body.tableName || `table_${Date.now()}`;
      logger.info("TABLE_CONTROLLER", `Table demandée: "${tableName}"`);

      if (!CsvService.validateTableName(tableName)) {
        logger.warn("TABLE_CONTROLLER", `Nom de table invalide: "${tableName}"`);
        await this.fileService.cleanupUploadFile(req.file.path);
        return res.status(400).json({
          success: false,
          error: "Invalid table name. Only alphanumeric characters and underscores allowed."
        });
      }

      // Parser le fichier CSV
      logger.info("TABLE_CONTROLLER", `Parsing du fichier CSV: ${req.file.originalname}`);
      const data = await CsvService.parseCSV(req.file.path);

      if (!data || data.length === 0) {
        logger.warn("TABLE_CONTROLLER", `CSV vide après parsing`);
        await this.fileService.cleanupUploadFile(req.file.path);
        return res.status(400).json({
          success: false,
          error: "CSV is empty or has no usable data"
        });
      }

      logger.info("TABLE_CONTROLLER", `Sauvegarde des données (${data.length} lignes)...`);
      // Sauvegarder les données
      await this.fileService.saveTableData(tableName, data);

      // Nettoyer le fichier temporaire
      await this.fileService.cleanupUploadFile(req.file.path);

      logger.success("TABLE_CONTROLLER", `Upload réussi: ${tableName} (${data.length} lignes)`);
      res.json({
        success: true,
        tableName,
        rows: data.length
      });
    } catch (error) {
      // Nettoyer le fichier temporaire en cas d'erreur
      if (req.file && req.file.path) {
        await this.fileService.cleanupUploadFile(req.file.path);
      }

      logger.error("TABLE_CONTROLLER", `Erreur upload`, error);
      res.status(500).json({
        success: false,
        error: "Internal server error during file upload"
      });
    }
  }

  /**
   * Récupère les données d'une table
   * @param {Object} req - Requête Express
   * @param {Object} res - Réponse Express
   */
  async getTable(req, res) {
    const tableName = req.params.tableName;
    logger.info("TABLE_CONTROLLER", `Récupération table demandée: "${tableName}" par ${req.ip || 'inconnu'}`);

    try {
      if (!CsvService.validateTableName(tableName)) {
        logger.warn("TABLE_CONTROLLER", `Nom de table invalide: "${tableName}"`);
        return res.status(400).json({
          success: false,
          error: "Invalid table name"
        });
      }

      logger.info("TABLE_CONTROLLER", `Recherche des données de la table...`);
      const data = await this.fileService.getTableData(tableName);

      logger.success("TABLE_CONTROLLER", `Données récupérées: ${data.length} lignes`);
      res.json({
        success: true,
        data
      });
    } catch (error) {
      if (error.message.includes('not found')) {
        logger.warn("TABLE_CONTROLLER", `Table non trouvée: "${tableName}"`);
        return res.status(404).json({
          success: false,
          error: "Table not found"
        });
      }

      logger.error("TABLE_CONTROLLER", `Erreur récupération table`, error);
      res.status(500).json({
        success: false,
        error: "Internal server error"
      });
    }
  }

  /**
   * Exporte une table en fichier SQL
   * @param {Object} req - Requête Express
   * @param {Object} res - Réponse Express
   */
  async exportTable(req, res) {
    const tableName = req.params.tableName;
    logger.info("TABLE_CONTROLLER", `Export SQL demandé pour table: "${tableName}" par ${req.ip || 'inconnu'}`);

    try {
      if (!CsvService.validateTableName(tableName)) {
        logger.warn("TABLE_CONTROLLER", `Nom de table invalide: "${tableName}"`);
        return res.status(400).json({
          success: false,
          error: "Invalid table name"
        });
      }

      // Récupérer les données
      logger.info("TABLE_CONTROLLER", `Récupération données pour export...`);
      const data = await this.fileService.getTableData(tableName);

      // Générer le SQL
      logger.info("TABLE_CONTROLLER", `Génération du SQL...`);
      const sqlContent = CsvService.generateSQL(tableName, data);

      // Créer le fichier et obtenir l'URL de téléchargement
      logger.info("TABLE_CONTROLLER", `Création du fichier SQL...`);
      const downloadUrl = await this.fileService.generateSQLFile(tableName, sqlContent, req);

      logger.success("TABLE_CONTROLLER", `Export réussi: ${tableName} → ${downloadUrl}`);
      res.json({
        success: true,
        downloadUrl
      });
    } catch (error) {
      if (error.message.includes('not found')) {
        logger.warn("TABLE_CONTROLLER", `Table non trouvée pour export: "${tableName}"`);
        return res.status(404).json({
          success: false,
          error: "Table not found"
        });
      }

      logger.error("TABLE_CONTROLLER", `Erreur export`, error);
      res.status(500).json({
        success: false,
        error: "Internal server error during export"
      });
    }
  }

  /**
   * Télécharge un fichier SQL
   * @param {Object} req - Requête Express
   * @param {Object} res - Réponse Express
   */
  async downloadSQL(req, res) {
    const fileName = req.params.fileName;
    logger.info("TABLE_CONTROLLER", `Téléchargement demandé: "${fileName}" par ${req.ip || 'inconnu'}`);

    try {
      logger.info("TABLE_CONTROLLER", `Traitement du téléchargement...`);
      await this.fileService.downloadSQLFile(fileName, res);

      logger.success("TABLE_CONTROLLER", `Téléchargement initié: ${fileName}`);
    } catch (error) {
      if (error.message.includes('not found')) {
        logger.warn("TABLE_CONTROLLER", `Fichier non trouvé pour téléchargement: "${fileName}"`);
        return res.status(404).json({
          success: false,
          error: "File not found"
        });
      }

      if (error.message.includes('Invalid file type')) {
        logger.warn("TABLE_CONTROLLER", `Type de fichier invalide: "${fileName}"`);
        return res.status(400).json({
          success: false,
          error: "Invalid file type"
        });
      }

      logger.error("TABLE_CONTROLLER", `Erreur téléchargement`, error);
      res.status(500).json({
        success: false,
        error: "Internal server error during download"
      });
    }
  }
}

module.exports = TableController;
