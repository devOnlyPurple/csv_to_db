const express = require("express");
const router = express.Router();
const multer = require("multer");
const fs = require("fs-extra");
const path = require("path");
const { parseCSV, generateSQL } = require("../utils/csv_utils");

const upload = multer({ dest: "uploads/" });

const DATA_DIR = path.join(__dirname, "../../data");
fs.ensureDirSync(DATA_DIR);

const SQL_DIR = path.join(DATA_DIR, "sql");
fs.ensureDirSync(SQL_DIR);
router.post("/upload", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res
        .status(400)
        .json({ success: false, error: "No file uploaded" });
    }

    // Vérifier l'extension du fichier
    const ext = path.extname(req.file.originalname).toLowerCase();
    if (ext !== ".csv") {
      // Supprimer le fichier temporaire
      await fs.remove(req.file.path);
      return res.status(400).json({
        success: false,
        error: "Invalid file format. Only CSV allowed.",
      });
    }

    const tableName = req.body.tableName || `table_${Date.now()}`;
    const data = await parseCSV(req.file.path);
    if (!data || data.length === 0) {
      await fs.remove(req.file.path);
      return res
        .status(400)
        .json({ success: false, error: "CSV is empty or has no usable data" });
    }
    await fs.writeJson(path.join(DATA_DIR, `${tableName}.json`), data);

    // Supprimer le fichier temporaire après lecture
    await fs.remove(req.file.path);

    res.json({ success: true, tableName, rows: data.length });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: "Server error" });
  }
});
router.get("/:tableName", async (req, res) => {
  const tableFile = path.join(DATA_DIR, `${req.params.tableName}.json`);
  if (!(await fs.pathExists(tableFile)))
    return res.status(404).json({ error: "Table not found" });

  const data = await fs.readJson(tableFile);
  res.json(data);
});
router.get("/:tableName/export", async (req, res) => {
  try {
    const tableFile = path.join(DATA_DIR, `${req.params.tableName}.json`);
    if (!(await fs.pathExists(tableFile)))
      return res.status(404).json({ error: "Table not found" });

    const data = await fs.readJson(tableFile);
    const sql = generateSQL(req.params.tableName, data);

    const fileName = `${req.params.tableName}.sql`;
    const sqlPath = path.join(SQL_DIR, fileName);
    await fs.writeFile(sqlPath, sql, "utf8");

    const host = req.get("host");
    const protocol = req.protocol;
    const downloadUrl = `${protocol}://${host}/api/v1/tables/download/${encodeURIComponent(
      fileName
    )}`;

    return res.json({ success: true, downloadUrl });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Server error" });
  }
});

router.get("/download/:fileName", async (req, res) => {
  try {
    const fileName = path.basename(req.params.fileName);
    const sqlPath = path.join(SQL_DIR, fileName);

    if (!(await fs.pathExists(sqlPath)))
      return res.status(404).json({ error: "File not found" });
    if (path.extname(fileName).toLowerCase() !== ".sql")
      return res.status(400).json({ error: "Invalid file type" });

    res.download(sqlPath, fileName, (err) => {
      if (err) console.error("Download error", err);
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Server error" });
  }
});
module.exports = router;
