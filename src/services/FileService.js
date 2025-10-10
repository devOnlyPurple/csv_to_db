const fs = require("fs-extra");
const path = require("path");
const logger = require("./LoggerService");

/**
 * Service de gestion des fichiers et stockage
 */
class FileService {
  constructor() {
    this.DATA_DIR = path.join(__dirname, "../../data");
    this.SQL_DIR = path.join(this.DATA_DIR, "sql");
    this.UPLOADS_DIR = path.join(__dirname, "../../uploads");

    // Créer les dossiers nécessaires
    this.ensureDirectoriesExist();
  }

  /**
   * Crée les dossiers nécessaires s'ils n'existent pas
   */
  ensureDirectoriesExist() {
    try {
      fs.ensureDirSync(this.DATA_DIR);
      fs.ensureDirSync(this.SQL_DIR);
      fs.ensureDirSync(this.UPLOADS_DIR);
      logger.info("FILE_SERVICE", "Dossiers créés/vérifiés", {
        DATA_DIR: this.DATA_DIR,
        SQL_DIR: this.SQL_DIR,
        UPLOADS_DIR: this.UPLOADS_DIR
      });
    } catch (error) {
      logger.error("FILE_SERVICE", "Erreur création dossiers", error);
      throw new Error(`Failed to create directories: ${error.message}`);
    }
  }

  /**
   * Sauvegarde les données dans un fichier JSON
   * @param {string} tableName - Nom de la table
   * @param {Array<Object>} data - Données à sauvegarder
   * @returns {Promise<void>}
   */
  async saveTableData(tableName, data) {
    try {
      const filePath = path.join(this.DATA_DIR, `${tableName}.json`);
      logger.info("FILE_SERVICE", `Sauvegarde données table "${tableName}" vers: ${filePath}`);

      await fs.writeJson(filePath, data, { spaces: 2 });

      const stats = await fs.stat(filePath);
      logger.success("FILE_SERVICE", `Données sauvegardées: ${data.length} lignes (${(stats.size / 1024).toFixed(2)}KB)`);
    } catch (error) {
      logger.error("FILE_SERVICE", `Erreur sauvegarde table "${tableName}"`, error);
      throw new Error(`Failed to save table data: ${error.message}`);
    }
  }

  /**
   * Récupère les données d'une table
   * @param {string} tableName - Nom de la table
   * @returns {Promise<Array<Object>>} Les données de la table
   */
  async getTableData(tableName) {
    try {
      const filePath = path.join(this.DATA_DIR, `${tableName}.json`);
      logger.info("FILE_SERVICE", `Récupération données table "${tableName}" depuis: ${filePath}`);

      const fileExists = await fs.pathExists(filePath);

      if (!fileExists) {
        logger.warn("FILE_SERVICE", `Table "${tableName}" non trouvée`);
        throw new Error(`Table '${tableName}' not found`);
      }

      const data = await fs.readJson(filePath);
      const stats = await fs.stat(filePath);

      logger.success("FILE_SERVICE", `Données récupérées: ${data.length} lignes (${(stats.size / 1024).toFixed(2)}KB)`);
      return data;
    } catch (error) {
      if (error.message.includes('not found')) {
        throw error;
      }
      logger.error("FILE_SERVICE", `Erreur lecture table "${tableName}"`, error);
      throw new Error(`Failed to read table data: ${error.message}`);
    }
  }

  /**
   * Supprime un fichier de manière sécurisée
   * @param {string} filePath - Chemin du fichier à supprimer
   * @returns {Promise<void>}
   */
  async deleteFile(filePath) {
    try {
      logger.info("FILE_SERVICE", `Suppression fichier: ${filePath}`);

      const fileExists = await fs.pathExists(filePath);
      if (!fileExists) {
        logger.warn("FILE_SERVICE", `Fichier déjà supprimé ou inexistant: ${filePath}`);
        return;
      }

      await fs.remove(filePath);
      logger.success("FILE_SERVICE", `Fichier supprimé: ${filePath}`);
    } catch (error) {
      logger.error("FILE_SERVICE", `Erreur suppression fichier "${filePath}"`, error);
      throw new Error(`Failed to delete file: ${error.message}`);
    }
  }

  /**
   * Génère le fichier SQL et retourne l'URL de téléchargement
   * @param {string} tableName - Nom de la table
   * @param {string} sqlContent - Contenu SQL à sauvegarder
   * @param {Object} req - Objet requête Express
   * @returns {string} URL de téléchargement
   */
  async generateSQLFile(tableName, sqlContent, req) {
    try {
      const fileName = `${tableName}.sql`;
      const filePath = path.join(this.SQL_DIR, fileName);

      logger.info("FILE_SERVICE", `Génération fichier SQL: ${fileName} (${sqlContent.length} caractères)`);

      // S'assurer que le dossier existe avant d'écrire le fichier
      await fs.ensureDir(path.dirname(filePath));

      await fs.writeFile(filePath, sqlContent, "utf8");

      const stats = await fs.stat(filePath);
      logger.success("FILE_SERVICE", `Fichier SQL créé: ${fileName} (${(stats.size / 1024).toFixed(2)}KB)`);

      const host = req.get("host");
      const protocol = req.protocol;
      const downloadUrl = `${protocol}://${host}/api/v1/tables/download/${encodeURIComponent(fileName)}`;

      logger.info("FILE_SERVICE", `URL de téléchargement générée: ${downloadUrl}`);
      return downloadUrl;
    } catch (error) {
      logger.error("FILE_SERVICE", `Erreur génération fichier SQL "${tableName}"`, error);
      throw new Error(`Failed to generate SQL file: ${error.message}`);
    }
  }

  /**
   * Vérifie si un fichier SQL existe
   * @param {string} fileName - Nom du fichier
   * @returns {Promise<boolean>} True si le fichier existe
   */
  async sqlFileExists(fileName) {
    try {
      const filePath = path.join(this.SQL_DIR, fileName);
      const exists = await fs.pathExists(filePath);

      logger.info("FILE_SERVICE", `Vérification existence fichier: ${fileName} → ${exists ? '✅ existe' : '❌ absent'}`);
      return exists;
    } catch (error) {
      logger.error("FILE_SERVICE", `Erreur vérification fichier "${fileName}"`, error);
      return false;
    }
  }

  /**
   * Télécharge un fichier SQL
   * @param {string} fileName - Nom du fichier à télécharger
   * @param {Object} res - Objet réponse Express
   * @returns {Promise<void>}
   */
  async downloadSQLFile(fileName, res) {
    try {
      // Sécuriser le nom du fichier
      const safeFileName = path.basename(fileName);

      logger.info("FILE_SERVICE", `Téléchargement demandé: ${fileName} (sécurisé: ${safeFileName})`);

      if (path.extname(safeFileName).toLowerCase() !== '.sql') {
        logger.warn("FILE_SERVICE", `Tentative téléchargement fichier invalide: ${safeFileName}`);
        throw new Error("Invalid file type");
      }

      const filePath = path.join(this.SQL_DIR, safeFileName);

      if (!(await fs.pathExists(filePath))) {
        logger.warn("FILE_SERVICE", `Fichier SQL non trouvé: ${safeFileName}`);
        throw new Error("File not found");
      }

      const stats = await fs.stat(filePath);
      logger.info("FILE_SERVICE", `Téléchargement fichier: ${safeFileName} (${(stats.size / 1024).toFixed(2)}KB)`);

      await new Promise((resolve, reject) => {
        res.download(filePath, safeFileName, (err) => {
          if (err) {
            logger.error("FILE_SERVICE", `Erreur téléchargement "${safeFileName}"`, err);
            reject(err);
          } else {
            logger.success("FILE_SERVICE", `Téléchargement réussi: ${safeFileName}`);
            resolve();
          }
        });
      });
    } catch (error) {
      throw error;
    }
  }

  /**
   * Nettoie les fichiers temporaires d'upload
   * @param {string} filePath - Chemin du fichier temporaire
   * @returns {Promise<void>}
   */
  async cleanupUploadFile(filePath) {
    try {
      logger.info("FILE_SERVICE", `Nettoyage fichier temporaire: ${filePath}`);

      await this.deleteFile(filePath);
      logger.success("FILE_SERVICE", `Fichier temporaire nettoyé: ${filePath}`);
    } catch (error) {
      logger.warn("FILE_SERVICE", `Échec nettoyage fichier temporaire ${filePath}`, error);
    }
  }
}

module.exports = FileService;
