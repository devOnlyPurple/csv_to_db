const fs = require("fs");
const csv = require("csv-parser");
const readline = require("readline");
const logger = require("./LoggerService");

/**
 * Service de gestion des fichiers CSV et génération SQL
 */
class CsvService {
  /**
   * Nettoie une valeur pour l'insertion en base de données
   * @param {string} value - La valeur à nettoyer
   * @returns {string} La valeur nettoyée
   */
  static cleanValue(value) {
    if (!value) return "";
    const cleaned = value
      .toString()
      .normalize("NFKD")
      .replace(/[^\x20-\x7E]/g, "")
      .replace(/'/g, "''");

    logger.debug('CSV_SERVICE', `Nettoyage valeur: "${value}" → "${cleaned}"`);
    return cleaned;
  }

  /**
   * Détecte le séparateur utilisé dans un fichier CSV
   * @param {string} firstLine - La première ligne du fichier
   * @returns {string} Le séparateur détecté
   */
  static detectSeparator(firstLine) {
    const candidates = [",", ";", "\t"];
    let maxCount = 0;
    let separator = ",";

    for (let sep of candidates) {
      const count = firstLine.split(sep).length;
      if (count > maxCount) {
        maxCount = count;
        separator = sep;
      }
    }

    logger.debug('CSV_SERVICE', `Séparateur détecté: "${separator}" (max colonnes: ${maxCount}) pour ligne: "${firstLine}"`);
    return separator;
  }

  /**
   * Parse un fichier CSV et retourne les données nettoyées
   * @param {string} filePath - Chemin vers le fichier CSV
   * @returns {Promise<Array<Object>>} Les données parsées
   */
  static async parseCSV(filePath) {
    logger.info('CSV_SERVICE', `Démarrage parsing du fichier: ${filePath}`);

    const rl = readline.createInterface({
      input: fs.createReadStream(filePath),
      crlfDelay: Infinity,
    });

    const firstLine = await new Promise((resolve) => {
      rl.on("line", (line) => {
        rl.close();
        resolve(line);
      });
    });

    const separator = this.detectSeparator(firstLine);

    return new Promise((resolve, reject) => {
      const results = [];
      let lineCount = 0;

      logger.info('CSV_SERVICE', `Parsing CSV avec séparateur: "${separator}"`);

      fs.createReadStream(filePath)
        .pipe(csv({ separator }))
        .on("data", (data) => {
          try {
            lineCount++;
            const cleanRow = {};
            for (let key in data) {
              const cleanKey = key.replace(/^\uFEFF/, "").trim();
              const normalizedKey = cleanKey.replace(/\s+/g, "_");
              cleanRow[normalizedKey] = this.cleanValue(data[key]);
            }
            results.push(cleanRow);

            if (lineCount % 100 === 0) {
              logger.debug('CSV_SERVICE', `Ligne ${lineCount} traitée`);
            }
          } catch (err) {
            logger.error('CSV_SERVICE', `Erreur traitement ligne ${lineCount}`, err);
            reject(err);
          }
        })
        .on("end", () => {
          logger.info('CSV_SERVICE', `Parsing terminé. ${results.length} lignes traitées.`);

          if (results.length === 0) {
            logger.warn('CSV_SERVICE', 'CSV vide ou aucune donnée utilisable');
            return reject(new Error("CSV is empty or has no usable data"));
          }

          const headerCols = Object.keys(results[0]);
          logger.info('CSV_SERVICE', `Colonnes détectées: [${headerCols.join(", ")}]`);

          for (let row of results) {
            if (Object.keys(row).length !== headerCols.length) {
              logger.error('CSV_SERVICE', 'Incohérence colonnes détectée');
              return reject(new Error("CSV has inconsistent columns"));
            }
          }

          resolve(results);
        })
        .on("error", (error) => {
          logger.error('CSV_SERVICE', 'Erreur lecture CSV', error);
          reject(error);
        });
    });
  }

  /**
   * Génère un script SQL à partir des données
   * @param {string} tableName - Nom de la table
   * @param {Array<Object>} data - Données à insérer
   * @returns {string} Le script SQL généré
   */
  static generateSQL(tableName, data) {
    logger.info('CSV_SERVICE', `Génération SQL pour table: ${tableName} (${data.length} lignes)`);

    if (!data || data.length === 0) {
      logger.warn('CSV_SERVICE', 'Aucune donnée fournie pour génération SQL');
      return "";
    }

    let columns = Object.keys(data[0]);
    logger.info('CSV_SERVICE', `Colonnes trouvées: [${columns.join(", ")}]`);

    if (!columns.includes("id")) {
      columns = ["id", ...columns];
      data = data.map((row, idx) => ({ id: idx + 1, ...row }));
      logger.info('CSV_SERVICE', 'Colonne ID ajoutée automatiquement');
    }

    const createTable = `CREATE TABLE ${tableName} (\n` +
      columns
        .map((col) => {
          if (col === "id") return "  id INT PRIMARY KEY AUTO_INCREMENT";

          const comment = /[%()]/.test(col) || /FCFA/i.test(col) ? ` COMMENT '${col}'` : "";
          const cleanCol = col.replace(/\s+/g, "_");

          logger.debug('CSV_SERVICE', `Colonne "${col}" → "${cleanCol}"`);
          return `  \`${cleanCol}\` VARCHAR(255)${comment}`;
        })
        .join(",\n") +
      "\n);\n\n";

    const insertValues = data
      .map((row, idx) => {
        const vals = columns.map((col) =>
          col === "id" ? row[col] : `'${row[col]}'`
        );
        return `INSERT INTO ${tableName} (${columns
          .map((c) => `\`${c.replace(/\s+/g, "_")}\``)
          .join(", ")}) VALUES (${vals.join(", ")});`;
      })
      .join("\n");

    const finalSQL = createTable + insertValues;
    logger.info('CSV_SERVICE', `SQL généré (${finalSQL.length} caractères)`);

    return finalSQL;
  }

  /**
   * Valide le nom d'une table
   * @param {string} tableName - Nom de la table à valider
   * @returns {boolean} True si le nom est valide
   */
  static validateTableName(tableName) {
    if (!tableName || typeof tableName !== 'string') {
      logger.warn('CSV_SERVICE', `Nom de table invalide: ${tableName}`);
      return false;
    }

    const isValid = /^[a-zA-Z0-9_]+$/.test(tableName);
    logger.info('CSV_SERVICE', `Validation table "${tableName}": ${isValid ? '✅ valide' : '❌ invalide'}`);

    return isValid;
  }

  /**
   * Valide un fichier uploadé
   * @param {Object} file - Objet fichier multer
   * @returns {Object} Objet avec valid: boolean et error: string
   */
  static validateUploadedFile(file) {
    logger.info('CSV_SERVICE', `Validation fichier: ${file ? file.originalname : 'aucun fichier'}`);

    if (!file) {
      logger.warn('CSV_SERVICE', 'Aucun fichier fourni');
      return { valid: false, error: "No file uploaded" };
    }

    const ext = file.originalname ? file.originalname.toLowerCase().split('.').pop() : '';
    logger.debug('CSV_SERVICE', `Extension détectée: .${ext}`);

    if (ext !== 'csv') {
      logger.warn('CSV_SERVICE', `Extension invalide: .${ext}`);
      return { valid: false, error: "Invalid file format. Only CSV allowed." };
    }

    // Vérifier la taille du fichier (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      logger.warn('CSV_SERVICE', `Fichier trop volumineux: ${(file.size / 1024 / 1024).toFixed(2)}MB`);
      return { valid: false, error: "File too large. Maximum size is 10MB." };
    }

    logger.info('CSV_SERVICE', `Fichier valide: ${file.originalname} (${(file.size / 1024).toFixed(2)}KB)`);
    return { valid: true };
  }
}

module.exports = CsvService;
