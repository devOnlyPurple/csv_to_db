const fs = require("fs");
const csv = require("csv-parser");
const readline = require("readline");

/**

 * @param {string} value
 * @returns {string}
 */
function cleanValue(value) {
  if (!value) return "";
  return value
    .toString()
    .normalize("NFKD")
    .replace(/[^\x20-\x7E]/g, "")
    .replace(/'/g, "''");
}

/**
 *
 * @param {string} firstLine
 * @returns {string} séparateur
 */
function detectSeparator(firstLine) {
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
  return separator;
}

/**

 * @param {string} filePath
 * @returns {Promise<Array<Object>>}
 */
async function parseCSV(filePath) {
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

  const separator = detectSeparator(firstLine);
  console.log("Detected separator:", separator);

  return new Promise((resolve, reject) => {
    const results = [];
    fs.createReadStream(filePath)
      .pipe(csv({ separator }))
      .on("data", (data) => {
        try {
          const cleanRow = {};
          for (let key in data) {
            const cleanKey = key.replace(/^\uFEFF/, "").trim();
            // Remplacer espaces par underscores
            const normalizedKey = cleanKey.replace(/\s+/g, "_");
            cleanRow[normalizedKey] = cleanValue(data[key]);
          }
          results.push(cleanRow);
        } catch (err) {
          reject(err);
        }
      })
      .on("end", () => {
        if (results.length === 0)
          return reject(new Error("CSV is empty or has no usable data"));

        const headerCols = Object.keys(results[0]);
        for (let row of results) {
          if (Object.keys(row).length !== headerCols.length) {
            return reject(new Error("CSV has inconsistent columns"));
          }
        }

        resolve(results);
      })
      .on("error", reject);
  });
}

/**

 * @param {string} tableName
 * @param {Array<Object>} data
 * @returns {string} SQL
 */
function generateSQL(tableName, data) {
  if (!data || data.length === 0) return "";

  let columns = Object.keys(data[0]);

  if (!columns.includes("id")) {
    columns = ["id", ...columns];
    data = data.map((row, idx) => ({ id: idx + 1, ...row }));
  }

  const createTable =
    `CREATE TABLE ${tableName} (\n` +
    columns
      .map((col) => {
        if (col === "id") return "  id INT PRIMARY KEY AUTO_INCREMENT";

        const comment =
          /[%()]/.test(col) || /FCFA/i.test(col) ? ` COMMENT '${col}'` : "";

        // Remplacer espaces par underscores
        const cleanCol = col.replace(/\s+/g, "_");

        return `  \`${cleanCol}\` VARCHAR(255)${comment}`;
      })
      .join(",\n") +
    "\n);\n\n";

  const insertValues = data
    .map((row) => {
      const vals = columns.map((col) =>
        col === "id" ? row[col] : `'${row[col]}'`
      );
      return `INSERT INTO ${tableName} (${columns
        .map((c) => `\`${c.replace(/\s+/g, "_")}\``)
        .join(", ")}) VALUES (${vals.join(", ")});`;
    })
    .join("\n");

  return createTable + insertValues;
}

module.exports = { parseCSV, generateSQL };
