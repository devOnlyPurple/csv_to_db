const express = require("express");
const tableRoutes = require("./routes/table_routes");
const port = process.env.PORT || 3000;
const path = require("path");
const fs = require("fs-extra");
const app = express();
const DATA_DIR = path.join(__dirname, "../../data");
const SQL_DIR = path.join(DATA_DIR, "sql");
fs.ensureDirSync(SQL_DIR);
app.use(express.json());
app.use("/api/v1/tables", tableRoutes);
app.get("/api/v1/", (req, res) => {
  return res.status(200).json({
    success: true,
    message: "Welcome to CSV to DB API",
    data: [
      {
        method: "POST",
        path: "/api/v1/tables/upload",
        description: "Upload a CSV file",
      },
      {
        method: "GET",
        path: "/api/v1/tables/:tableName",
        description: "Get table data",
      },
      {
        method: "GET",
        path: "/api/v1/tables/:tableName/export",
        description: "Export table data as SQL",
      },
    ],
  });
});
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
