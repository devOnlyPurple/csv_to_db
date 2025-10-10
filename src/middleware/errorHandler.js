const logger = require("../services/LoggerService");

/**
 * Middleware de gestion centralisée des erreurs
 * @param {Error} err - L'erreur capturée
 * @param {Object} req - Requête Express
 * @param {Object} res - Réponse Express
 * @param {Function} next - Fonction next
 */
const errorHandler = (err, req, res, next) => {
  const timestamp = new Date().toISOString();
  const ip = req.ip || req.connection?.remoteAddress || 'inconnu';
  const userAgent = req.get('User-Agent') || 'inconnu';

  logger.error('ERROR_HANDLER', `ERREUR CRITIQUE: ${err.name} - ${err.message}`, {
    ip: ip,
    userAgent: userAgent,
    url: `${req.method} ${req.originalUrl}`,
    timestamp: timestamp,
    error: {
      name: err.name,
      message: err.message,
      stack: err.stack
    }
  });

  // Erreur Multer (upload de fichier)
  if (err.name === 'MulterError') {
    if (err.code === 'LIMIT_FILE_SIZE') {
      logger.error('ERROR_HANDLER', `Fichier trop volumineux refusé - Limite: 10MB`);
      return res.status(400).json({
        success: false,
        error: "File too large. Maximum size is 10MB."
      });
    }
    if (err.code === 'LIMIT_FILE_COUNT') {
      logger.error('ERROR_HANDLER', `Trop de fichiers uploadés`);
      return res.status(400).json({
        success: false,
        error: "Too many files uploaded"
      });
    }
    if (err.code === 'LIMIT_UNEXPECTED_FILE') {
      logger.error('ERROR_HANDLER', `Champ de fichier inattendu`);
      return res.status(400).json({
        success: false,
        error: "Unexpected file field"
      });
    }
    logger.error('ERROR_HANDLER', `Erreur Multer: ${err.code} - ${err.message}`);
    return res.status(400).json({
      success: false,
      error: "File upload error: " + err.message
    });
  }

  // Erreur de validation Mongoose
  if (err.name === 'ValidationError') {
    logger.error('ERROR_HANDLER', `Erreur de validation: ${err.message}`);
    return res.status(400).json({
      success: false,
      error: "Validation error",
      details: err.message
    });
  }

  // Erreur de duplication Mongoose
  if (err.code === 11000) {
    logger.error('ERROR_HANDLER', `Doublon détecté: ${err.message}`);
    return res.status(409).json({
      success: false,
      error: "Duplicate entry",
      details: err.message
    });
  }

  // Erreur JWT
  if (err.name === 'JsonWebTokenError') {
    logger.error('ERROR_HANDLER', `Token JWT invalide`);
    return res.status(401).json({
      success: false,
      error: "Invalid token"
    });
  }

  // Erreur d'expiration JWT
  if (err.name === 'TokenExpiredError') {
    logger.error('ERROR_HANDLER', `Token JWT expiré`);
    return res.status(401).json({
      success: false,
      error: "Token expired"
    });
  }

  // Erreur par défaut - erreur interne du serveur
  logger.error('ERROR_HANDLER', `Erreur interne du serveur non gérée`);
  res.status(500).json({
    success: false,
    error: "Internal server error"
  });
};

/**
 * Middleware pour capturer les erreurs async
 * @param {Function} fn - Fonction async à wrapper
 * @returns {Function} Fonction wrappée
 */
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

/**
 * Middleware pour les routes non trouvées
 * @param {Object} req - Requête Express
 * @param {Object} res - Réponse Express
 */
const notFound = (req, res) => {
  const timestamp = new Date().toISOString();
  const ip = req.ip || req.connection?.remoteAddress || 'inconnu';

  logger.warn('NOT_FOUND', `Route non trouvée: ${req.method} ${req.originalUrl}`, {
    ip: ip,
    timestamp: timestamp
  });

  res.status(404).json({
    success: false,
    error: `Route ${req.originalUrl} not found`
  });
};

module.exports = {
  errorHandler,
  asyncHandler,
  notFound
};
