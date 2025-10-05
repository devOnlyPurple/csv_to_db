# CSV to Database Converter 🚀

[![Hacktoberfest](https://img.shields.io/badge/Hacktoberfest-2025-brightgreen)](https://hacktoberfest.com)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D14.0.0-brightgreen)](https://nodejs.org/)

## 📖 About The Project

This project is a Node.js application that converts CSV files into database tables. It provides an easy way to:

- Upload CSV file
- Store CSV data as JSON on the server (data/db.json)
- Generate SQL scripts from the JSON data (data/sql/db.sql)
- Provide a direct download link for the generated SQL file
- Handle basic data type detection and column cleaning

Perfect for developers who need to migrate data from spreadsheets to databases!

## 🛠️ Built With

- Node.js
- Express.js
- Multer
- CSV-Parse
- fs-extra
<!-- - Jest (for testing) -->

## 🚀 Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm (v6 or higher)
- Git

### Installation

1. Clone the repository

```bash
git clone https://github.com/devOnlyPurple/csv_to_db.git
```

2. Install NPM packages

```bash
cd csv-to-db
npm install
```

3. Start the development server

```bash
npm run dev
```

## 📊 Project Structure

```
csv_to_db/
├─ data/
│  ├─ db.json             # Données JSON générées depuis CSV
│  └─ sql/
│     └─ db.sql           # Fichiers SQL générés
├─ package-lock.json
├─ package.json
├─ README.md
├─ src/
│  ├─ app.js              # Point d’entrée de l’application
│  ├─ routes/
│  │  └─ table_routes.js  # Routes pour gérer CSV et SQL
│  └─ utils/
│     └─ csv_utils.js     # Fonctions utilitaires pour parser CSV et générer SQL
└─ uploads/               # Dossier pour stocker les CSV uploadés

```

## 🔥 Features

- [x] CSV file upload
- [x] Automatic data type detection
- [x] SQL script generation
- [x] Column mapping configuration
- [x] Basic data validation
- [ ] Multiple database support
- [ ] Custom data transformations
- [ ] Batch processing

## 🤝 Contributing

We love contributions! Here's how you can help:

### Getting Started with Contributions

1. Fork the Project
2. Create your Feature Branch

```bash
git checkout -b feature/AmazingFeature
```

3. Commit your Changes

```bash
git commit -m 'Add some AmazingFeature'
```

4. Push to the Branch

```bash
git push origin feature/AmazingFeature
```

5. Open a Pull Request

### Contribution Guidelines

#### Code Style

- Follow ESLint configuration
- Write meaningful commit messages
- Add tests for new features

#### Pull Request Process

1. Update the README.md with details of changes
2. Update the CHANGELOG.md following semantic versioning
3. Link any related issues
4. Request review from maintainers

### Good First Issues

Look for these labels in our issues:

- `good first issue`
- `help wanted`
- `hacktoberfest`
- `documentation`

## 📝 API Documentation

### Endpoints

#### Endpoint list

```
POST /api/v1/
Content-Type: application/json

{
    "success": true,
    "message": "Welcome to CSV to DB API",
    "data": [
        {
            "method": "POST",
            "path": "/api/v1/tables/upload",
            "description": "Upload a CSV file"
        },
        {
            "method": "GET",
            "path": "/api/v1/tables/:tableName",
            "description": "Get table data"
        },
        {
            "method": "DELETE",
            "path": "/api/v1/tables/:tableName",
            "description": "Delete a table"
        }
    ]
}
```

#### Upload CSV

```
POST /api/v1/upload
Content-Type: multipart/form-data
{
    "success": true,
    "tableName": "projet4",
    "rows": 23
}
```

#### Export SQL

```
POST /api/v1/:tableName/export
Content-Type: application/json

{
    "success": true,
    "downloadUrl": "http://localhost:3000/api/v1/tables/download/projet4.sql"
}
```

````

## 📈 Development

### Setting Up Development Environment

1. Install development dependencies

```bash
npm install --save-dev
````

2. Set up pre-commit hooks

```bash
npm run prepare
```

### Debug Mode

```bash
npm run dev:debug
```

Then attach your debugger to port 9229.

## 🔄 CI/CD

We use GitHub Actions for:

- Running tests
- Linting
- Building
- Publishing to npm

Check `.github/workflows` for details.

## 📚 Documentation

- [API Documentation](docs/API.md)
- [Contributing Guide](CONTRIBUTING.md)
- [Code of Conduct](CODE_OF_CONDUCT.md)

## 🎯 Hacktoberfest 2025

This project is participating in Hacktoberfest 2025! We welcome contributions from developers of all skill levels.

### How to Participate

1. Register at [Hacktoberfest](https://hacktoberfest.com)
2. Pick an issue labeled `hacktoberfest`
3. Follow our contribution guidelines
4. Submit your PR
5. Get it merged!

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.

## 📫 Contact

Project Link: [https://github.com/yourusername/csv-to-db](https://github.com/yourusername/csv-to-db)

## 🙏 Acknowledgments

- [Choose an Open Source License](https://choosealicense.com)
- [Img Shields](https://shields.io)
- [GitHub Pages](https://pages.github.com)
