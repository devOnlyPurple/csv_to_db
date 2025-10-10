const request = require('supertest');
const app = require('./app');
const fs = require('fs-extra');
const path = require('path');

describe('CSV to Database API', () => {
  const testDataDir = path.join(__dirname, '../data');
  const testUploadsDir = path.join(__dirname, '../uploads');

  beforeEach(async () => {
    // Nettoyer les dossiers de test
    await fs.emptyDir(testDataDir);
    await fs.emptyDir(testUploadsDir);
  });

  afterAll(async () => {
    // Nettoyer après tous les tests
    await fs.emptyDir(testDataDir);
    await fs.emptyDir(testUploadsDir);
  });

  describe('GET /api/v1/', () => {
    it('devrait retourner la documentation de l\'API', async () => {
      const response = await request(app)
        .get('/api/v1/')
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('Welcome to CSV to DB API');
      expect(response.body.data).toBeInstanceOf(Array);
    });
  });

  describe('POST /api/v1/tables/upload', () => {
    it('devrait refuser un fichier sans extension CSV', async () => {
      const response = await request(app)
        .post('/api/v1/tables/upload')
        .attach('file', Buffer.from('col1,col2\nval1,val2'), 'test.txt')
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('CSV');
    });

    it('devrait accepter un fichier CSV valide', async () => {
      const csvContent = 'name,age,city\nJohn,25,Paris\nJane,30,Lyon';

      const response = await request(app)
        .post('/api/v1/tables/upload')
        .attach('file', Buffer.from(csvContent), 'test.csv')
        .field('tableName', 'users')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.tableName).toBe('users');
      expect(response.body.rows).toBe(2);
    });
  });

  describe('GET /api/v1/tables/:tableName', () => {
    beforeEach(async () => {
      // Créer des données de test
      const testData = [
        { id: 1, name: 'John', age: '25' },
        { id: 2, name: 'Jane', age: '30' }
      ];
      await fs.writeJson(path.join(testDataDir, 'test_table.json'), testData);
    });

    it('devrait retourner les données d\'une table existante', async () => {
      const response = await request(app)
        .get('/api/v1/tables/test_table')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(2);
      expect(response.body.data[0]).toHaveProperty('name', 'John');
    });

    it('devrait retourner 404 pour une table inexistante', async () => {
      const response = await request(app)
        .get('/api/v1/tables/nonexistent')
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('not found');
    });

    it('devrait refuser un nom de table invalide', async () => {
      const response = await request(app)
        .get('/api/v1/tables/invalid-table')
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('Invalid table name');
    });
  });

  describe('GET /api/v1/tables/:tableName/export', () => {
    beforeEach(async () => {
      // Créer des données de test
      const testData = [
        { id: 1, name: 'John', age: '25' },
        { id: 2, name: 'Jane', age: '30' }
      ];
      await fs.writeJson(path.join(testDataDir, 'export_test.json'), testData);
    });

    it('devrait exporter une table en SQL', async () => {
      const response = await request(app)
        .get('/api/v1/tables/export_test/export')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.downloadUrl).toContain('export_test.sql');
    });
  });

  describe('Validation des noms de table', () => {
    const validNames = ['users', 'products_2023', 'my_table'];
    const invalidNames = ['123invalid', 'invalid-table', ''];

    test.each(validNames)('devrait accepter le nom de table valide: %s', async (tableName) => {
      const csvContent = 'col1\nval1';

      const response = await request(app)
        .post('/api/v1/tables/upload')
        .attach('file', Buffer.from(csvContent), 'test.csv')
        .field('tableName', tableName);

      if (tableName) {
        expect(response.status).toBe(200);
        expect(response.body.tableName).toBe(tableName);
      }
    });

    test.each(invalidNames)('devrait refuser le nom de table invalide: "%s"', async (tableName) => {
      const csvContent = 'col1\nval1';

      const response = await request(app)
        .post('/api/v1/tables/upload')
        .attach('file', Buffer.from(csvContent), 'test.csv')
        .field('tableName', tableName)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('Invalid table name');
    });
  });
});

describe('FileService', () => {
  const FileService = require('./services/FileService');

  let fileService;

  beforeEach(() => {
    fileService = new FileService();
  });

  describe('ensureDirectoriesExist', () => {
    it('devrait créer les dossiers nécessaires', () => {
      expect(() => fileService.ensureDirectoriesExist()).not.toThrow();
    });

    it('devrait définir les chemins des dossiers', () => {
      expect(fileService.DATA_DIR).toContain('data');
      expect(fileService.SQL_DIR).toContain('data/sql');
      expect(fileService.UPLOADS_DIR).toContain('uploads');
    });
  });

  describe('saveTableData', () => {
    it('devrait sauvegarder des données dans un fichier JSON', async () => {
      const testData = [{ id: 1, name: 'test' }];
      const tableName = 'test_save';

      await expect(fileService.saveTableData(tableName, testData)).resolves.not.toThrow();

      // Vérifier que le fichier existe
      const filePath = path.join(fileService.DATA_DIR, `${tableName}.json`);
      const exists = await fs.pathExists(filePath);
      expect(exists).toBe(true);
    });
  });
});

describe('CsvService', () => {
  const CsvService = require('./services/CsvService');

  describe('validateTableName', () => {
    const validNames = ['users', 'products_2023', 'my_table_1'];
    const invalidNames = ['123invalid', 'invalid-table', '', 'table with spaces'];

    test.each(validNames)('devrait valider le nom: %s', (name) => {
      expect(CsvService.validateTableName(name)).toBe(true);
    });

    test.each(invalidNames)('devrait invalider le nom: "%s"', (name) => {
      expect(CsvService.validateTableName(name)).toBe(false);
    });
  });

  describe('cleanValue', () => {
    it('devrait nettoyer les valeurs correctement', () => {
      expect(CsvService.cleanValue('test')).toBe('test');
      expect(CsvService.cleanValue('')).toBe('');
      expect(CsvService.cleanValue(null)).toBe('');
      expect(CsvService.cleanValue('test\'quote')).toBe('test\'\'quote');
    });
  });

  describe('generateSQL', () => {
    it('devrait générer un script SQL valide', () => {
      const data = [
        { name: 'John', age: '25' },
        { name: 'Jane', age: '30' }
      ];

      const sql = CsvService.generateSQL('users', data);

      expect(sql).toContain('CREATE TABLE users');
      expect(sql).toContain('INSERT INTO users');
      expect(sql).toContain('John');
      expect(sql).toContain('Jane');
    });

    it('devrait retourner une chaîne vide pour des données vides', () => {
      const sql = CsvService.generateSQL('empty', []);
      expect(sql).toBe('');
    });
  });
});
