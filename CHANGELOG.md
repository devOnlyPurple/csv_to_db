# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Architecture MVC avec séparation claire des responsabilités
- Services dédiés pour la gestion des fichiers et du traitement CSV
- Contrôleur pour la logique métier des tables
- Middleware de gestion d'erreurs centralisée
- Validation des noms de tables et des fichiers uploadés
- Limite de taille de fichier (10MB)
- Tests unitaires avec Jest et Supertest
- Scripts de test et de développement
- Configuration ESLint et Prettier
- Documentation des API améliorée

### Changed
- Refactorisation complète de la structure du projet
- Séparation de la logique métier des routes
- Amélioration de la gestion d'erreurs
- Sécurisation des téléchargements de fichiers
- Standardisation des réponses JSON

### Fixed
- Sécurité : validation des noms de tables
- Sécurité : limitation de la taille des fichiers
- Gestion des erreurs : middleware centralisé
- Nettoyage automatique des fichiers temporaires

## [1.0.0] - 2024-12-19

### Added
- Upload de fichiers CSV
- Conversion CSV vers JSON
- Génération de scripts SQL
- Export et téléchargement de fichiers SQL
- Interface web basique

[Unreleased]: https://github.com/devOnlyPurple/csv_to_db/compare/v1.0.0...HEAD
[1.0.0]: https://github.com/devOnlyPurple/csv_to_db/releases/tag/v1.0.0
