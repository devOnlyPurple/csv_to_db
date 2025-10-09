const fs = require('fs-extra');
const path = require('path');

/**
 * Service de logging avancé avec écriture dans fichiers
 */
class LoggerService {
  constructor() {
    this.LOGS_DIR = path.join(__dirname, '../../logs');
    this.ensureLogsDirectory();

    // Niveaux de log disponibles
    this.levels = {
      INFO: 'INFO',
      SUCCESS: 'SUCCESS',
      WARN: 'WARN',
      ERROR: 'ERROR',
      DEBUG: 'DEBUG'
    };

    // Couleurs pour la console (optionnel)
    this.colors = {
      INFO: '\x1b[36m',    // Cyan
      SUCCESS: '\x1b[32m', // Vert
      WARN: '\x1b[33m',    // Jaune
      ERROR: '\x1b[31m',   // Rouge
      DEBUG: '\x1b[35m'    // Magenta
    };

    this.resetColor = '\x1b[0m';
  }

  /**
   * Crée le dossier logs s'il n'existe pas
   */
  ensureLogsDirectory() {
    try {
      fs.ensureDirSync(this.LOGS_DIR);
    } catch (error) {
      console.error('Erreur création dossier logs:', error.message);
    }
  }

  /**
   * Génère le nom du fichier de log (un par jour)
   */
  getLogFileName() {
    const today = new Date();
    const dateStr = today.getFullYear() + '-' +
                   String(today.getMonth() + 1).padStart(2, '0') + '-' +
                   String(today.getDate()).padStart(2, '0');
    return `csv_to_db_${dateStr}.log`;
  }

  /**
   * Génère le nom du fichier d'erreur (un par jour)
   */
  getErrorFileName() {
    const today = new Date();
    const dateStr = today.getFullYear() + '-' +
                   String(today.getMonth() + 1).padStart(2, '0') + '-' +
                   String(today.getDate()).padStart(2, '0');
    return `errors_${dateStr}.log`;
  }

  /**
   * Formate un message de log
   */
  formatMessage(level, service, message, data = null) {
    const timestamp = new Date().toISOString();
    const baseMessage = `[${service}] ${message}`;

    let formattedMessage = `${timestamp} [${level}] ${baseMessage}`;

    if (data) {
      formattedMessage += `\n${JSON.stringify(data, null, 2)}`;
    }

    return formattedMessage;
  }

  /**
   * Écrit dans un fichier de log
   */
  async writeToFile(fileName, message) {
    try {
      const filePath = path.join(this.LOGS_DIR, fileName);
      await fs.appendFile(filePath, message + '\n');
    } catch (error) {
      console.error('Erreur écriture fichier log:', error.message);
    }
  }

  /**
   * Log d'information générale
   */
  async info(service, message, data = null) {
    const formattedMessage = this.formatMessage(this.levels.INFO, service, message, data);

    // Console avec couleur
    console.log(`${this.colors.INFO}${formattedMessage}${this.resetColor}`);

    // Fichier
    await this.writeToFile(this.getLogFileName(), formattedMessage);
  }

  /**
   * Log de succès
   */
  async success(service, message, data = null) {
    const formattedMessage = this.formatMessage(this.levels.SUCCESS, service, message, data);

    // Console avec couleur
    console.log(`${this.colors.SUCCESS}${formattedMessage}${this.resetColor}`);

    // Fichier
    await this.writeToFile(this.getLogFileName(), formattedMessage);
  }

  /**
   * Log d'avertissement
   */
  async warn(service, message, data = null) {
    const formattedMessage = this.formatMessage(this.levels.WARN, service, message, data);

    // Console avec couleur
    console.warn(`${this.colors.WARN}${formattedMessage}${this.resetColor}`);

    // Fichier
    await this.writeToFile(this.getLogFileName(), formattedMessage);
  }

  /**
   * Log d'erreur
   */
  async error(service, message, error = null) {
    const timestamp = new Date().toISOString();
    const errorData = {
      message: message,
      error: error ? {
        name: error.name,
        message: error.message,
        stack: error.stack
      } : null,
      timestamp: timestamp
    };

    const formattedMessage = this.formatMessage(this.levels.ERROR, service, message, errorData);

    // Console avec couleur
    console.error(`${this.colors.ERROR}${formattedMessage}${this.resetColor}`);

    // Fichier de log général
    await this.writeToFile(this.getLogFileName(), formattedMessage);

    // Fichier d'erreurs dédié (pour monitoring)
    await this.writeToFile(this.getErrorFileName(), formattedMessage);
  }

  /**
   * Log de debug (développement uniquement)
   */
  async debug(service, message, data = null) {
    if (process.env.NODE_ENV !== 'production') {
      const formattedMessage = this.formatMessage(this.levels.DEBUG, service, message, data);

      // Console avec couleur
      console.log(`${this.colors.DEBUG}${formattedMessage}${this.resetColor}`);

      // Fichier
      await this.writeToFile(this.getLogFileName(), formattedMessage);
    }
  }

  /**
   * Log d'une requête HTTP complète
   */
  async logRequest(req, additionalInfo = {}) {
    const requestData = {
      method: req.method,
      url: req.originalUrl,
      ip: req.ip || req.connection?.remoteAddress || 'inconnu',
      userAgent: req.get('User-Agent') || 'inconnu',
      timestamp: new Date().toISOString(),
      ...additionalInfo
    };

    await this.info('HTTP_REQUEST', `Requête ${req.method} ${req.originalUrl}`, requestData);
  }

  /**
   * Log d'une réponse HTTP
   */
  async logResponse(req, statusCode, responseTime, additionalInfo = {}) {
    const responseData = {
      method: req.method,
      url: req.originalUrl,
      statusCode: statusCode,
      responseTime: `${responseTime}ms`,
      timestamp: new Date().toISOString(),
      ...additionalInfo
    };

    if (statusCode >= 400) {
      await this.error('HTTP_RESPONSE', `Réponse ${statusCode} pour ${req.method} ${req.originalUrl}`, responseData);
    } else {
      await this.info('HTTP_RESPONSE', `Réponse ${statusCode} pour ${req.method} ${req.originalUrl}`, responseData);
    }
  }

  /**
   * Nettoie les anciens fichiers de logs (garde seulement les 7 derniers jours)
   */
  async cleanupOldLogs() {
    try {
      const files = await fs.readdir(this.LOGS_DIR);
      const now = new Date();
      const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

      for (const file of files) {
        if (file.endsWith('.log')) {
          const filePath = path.join(this.LOGS_DIR, file);
          const stats = await fs.stat(filePath);
          const fileDate = new Date(stats.mtime);

          if (fileDate < sevenDaysAgo) {
            await fs.remove(filePath);
            await this.info('LOG_CLEANUP', `Ancien fichier de log supprimé: ${file}`);
          }
        }
      }
    } catch (error) {
      await this.error('LOG_CLEANUP', 'Erreur nettoyage anciens logs', error);
    }
  }

  /**
   * Récupère les logs récents
   */
  async getRecentLogs(hours = 24) {
    try {
      const logFiles = [this.getLogFileName(), this.getErrorFileName()];
      const recentLogs = [];

      for (const fileName of logFiles) {
        const filePath = path.join(this.LOGS_DIR, fileName);
        if (await fs.pathExists(filePath)) {
          const content = await fs.readFile(filePath, 'utf8');
          const lines = content.split('\n').filter(line => line.trim());

          // Filtrer les logs récents
          const cutoffTime = new Date(Date.now() - hours * 60 * 60 * 1000);

          for (const line of lines) {
            try {
              const timestamp = new Date(line.substring(0, 24));
              if (timestamp > cutoffTime) {
                recentLogs.push(line);
              }
            } catch (e) {
              // Ligne mal formatée, l'ignorer
            }
          }
        }
      }

      return recentLogs.sort();
    } catch (error) {
      await this.error('LOG_RETRIEVAL', 'Erreur récupération logs récents', error);
      return [];
    }
  }
}

// Créer une instance globale du logger
const logger = new LoggerService();

module.exports = logger;
