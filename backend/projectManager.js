const fs = require("fs");
const path = require("path");
const sqlite3 = require("sqlite3").verbose();

class ProjectManager {
  constructor(projectName, modelName) {
    this.projectPath = path.join(__dirname, "..", "projects", projectName);
    this.metadataFile = path.join(this.projectPath, "metadata.json");
    this.contextChunksPath = path.join(this.projectPath, "context_chunks");
    this.embeddingsDb = new sqlite3.Database(
      path.join(
        __dirname,
        "..",
        "embeddings",
        `${projectName}_${modelName}.sqlite`
      )
    );
  }

  // Read project metadata from JSON file
  readMetadata() {
    if (fs.existsSync(this.metadataFile)) {
      const rawData = fs.readFileSync(this.metadataFile);
      return JSON.parse(rawData);
    } else {
      throw new Error(`Metadata not found for project: 
${this.projectPath}`);
    }
  }

  // Read file content from the project code directory
  readFile(fileName) {
    const filePath = path.join(this.projectPath, "code", fileName);
    if (fs.existsSync(filePath)) {
      return fs.readFileSync(filePath, "utf-8");
    } else {
      throw new Error(`File not found: ${fileName}`);
    }
  }

  // Write content to a file in the project code directory
  writeFile(fileName, content) {
    const filePath = path.join(this.projectPath, "code", fileName);
    fs.writeFileSync(filePath, content);
  }

  // Read context chunks for RAG from the project directory
  readContextChunks() {
    return fs.readdirSync(this.contextChunksPath).map((chunkFileName) => {
      const chunkFilePath = path.join(this.contextChunksPath, chunkFileName);
      return fs.readFileSync(chunkFilePath, "utf-8");
    });
  }

  // Update embeddings cache for the project and model in SQLite
  database;
  updateEmbeddingsCache(embeddings) {
    const stmt = this.embeddingsDb.prepare(
      "INSERT OR REPLACE INTO embeddings (id, vector) VALUES (?, ?)"
    );
    embeddings.forEach(({ id, vector }) => {
      stmt.run(id, JSON.stringify(vector));
    });
    stmt.finalize();
  }
}

module.exports = ProjectManager;
