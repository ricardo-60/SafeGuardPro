import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import { dbService, db } from "./server/dbService";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize Database
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS companies (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    nif TEXT,
    logo_url TEXT,
    address TEXT
  );

  CREATE TABLE IF NOT EXISTS vigilantes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    bi_number TEXT UNIQUE,
    birth_date DATE,
    marital_status TEXT,
    address TEXT,
    contact TEXT,
    nif TEXT,
    inss_number TEXT,
    contract_type TEXT,
    admission_date DATE,
    base_salary REAL,
    subsidies REAL,
    bank_account TEXT,
    status TEXT DEFAULT 'active'
  );

  CREATE TABLE IF NOT EXISTS weapons (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    type TEXT NOT NULL,
    brand TEXT,
    model TEXT,
    serial_number TEXT UNIQUE,
    caliber TEXT,
    status TEXT DEFAULT 'available'
  );

  CREATE TABLE IF NOT EXISTS equipment (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    serial_number TEXT UNIQUE,
    status TEXT DEFAULT 'available'
  );

  CREATE TABLE IF NOT EXISTS posts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    client_name TEXT,
    address TEXT,
    vigilantes_needed INTEGER
  );

  CREATE TABLE IF NOT EXISTS occurrences (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    type TEXT NOT NULL,
    date_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    post_id INTEGER,
    vigilante_id INTEGER,
    description TEXT,
    FOREIGN KEY(post_id) REFERENCES posts(id),
    FOREIGN KEY(vigilante_id) REFERENCES vigilantes(id)
  );

  CREATE TABLE IF NOT EXISTS vehicles (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    plate TEXT UNIQUE,
    model TEXT,
    status TEXT DEFAULT 'active'
  );

  CREATE TABLE IF NOT EXISTS scales (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    vigilante_id INTEGER,
    post_id INTEGER,
    shift_start DATETIME,
    shift_end DATETIME,
    status TEXT DEFAULT 'scheduled',
    FOREIGN KEY(vigilante_id) REFERENCES vigilantes(id),
    FOREIGN KEY(post_id) REFERENCES posts(id)
  );

  CREATE TABLE IF NOT EXISTS transactions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    type TEXT NOT NULL,
    category TEXT,
    amount REAL NOT NULL,
    date DATETIME DEFAULT CURRENT_TIMESTAMP,
    description TEXT
  );

  CREATE TABLE IF NOT EXISTS attendance (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    vigilante_id INTEGER,
    post_id INTEGER,
    check_in DATETIME DEFAULT CURRENT_TIMESTAMP,
    check_out DATETIME,
    lat REAL,
    lng REAL,
    FOREIGN KEY(vigilante_id) REFERENCES vigilantes(id),
    FOREIGN KEY(post_id) REFERENCES posts(id)
  );
`);

// Seed initial admin if not exists
const adminExists = db.prepare("SELECT * FROM users WHERE email = ?").get("admin@safeguard.com");
if (!adminExists) {
  db.prepare("INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)").run(
    "Administrador Geral",
    "admin@safeguard.com",
    "admin123",
    "admin"
  );
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Routes
  app.get("/api/stats", async (req, res) => {
    try {
      const stats = await dbService.getStats();
      res.json(stats);
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  });

  // Users CRUD
  app.get("/api/users", async (req, res) => {
    try {
      res.json(await dbService.getUsers());
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  });

  app.post("/api/users", async (req, res) => {
    try {
      res.json(await dbService.createUser(req.body));
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  });

  app.delete("/api/users/:id", async (req, res) => {
    try {
      await dbService.deleteUser(req.params.id);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  });

  // Vigilantes CRUD
  app.get("/api/vigilantes", async (req, res) => {
    res.json(await dbService.getVigilantes());
  });

  app.post("/api/vigilantes", async (req, res) => {
    res.json(await dbService.createVigilante(req.body));
  });

  app.delete("/api/vigilantes/:id", async (req, res) => {
    await dbService.deleteVigilante(req.params.id);
    res.json({ success: true });
  });

  // Weapons CRUD
  app.get("/api/weapons", async (req, res) => {
    res.json(await dbService.getWeapons());
  });

  app.post("/api/weapons", async (req, res) => {
    res.json(await dbService.createWeapon(req.body));
  });

  app.delete("/api/weapons/:id", async (req, res) => {
    await dbService.deleteWeapon(req.params.id);
    res.json({ success: true });
  });

  // Equipment CRUD
  app.get("/api/equipment", async (req, res) => {
    res.json(await dbService.getEquipment());
  });

  app.post("/api/equipment", async (req, res) => {
    res.json(await dbService.createEquipment(req.body));
  });

  app.delete("/api/equipment/:id", async (req, res) => {
    await dbService.deleteEquipment(req.params.id);
    res.json({ success: true });
  });

  // Posts CRUD
  app.get("/api/posts", async (req, res) => {
    res.json(await dbService.getPosts());
  });

  app.post("/api/posts", async (req, res) => {
    res.json(await dbService.createPost(req.body));
  });

  app.delete("/api/posts/:id", async (req, res) => {
    await dbService.deletePost(req.params.id);
    res.json({ success: true });
  });

  // Occurrences CRUD
  app.get("/api/occurrences", async (req, res) => {
    res.json(await dbService.getOccurrences());
  });

  app.post("/api/occurrences", async (req, res) => {
    res.json(await dbService.createOccurrence(req.body));
  });

  app.delete("/api/occurrences/:id", async (req, res) => {
    await dbService.deleteOccurrence(req.params.id);
    res.json({ success: true });
  });

  // Vehicles CRUD
  app.get("/api/vehicles", async (req, res) => {
    res.json(await dbService.getVehicles());
  });

  app.post("/api/vehicles", async (req, res) => {
    res.json(await dbService.createVehicle(req.body));
  });

  app.put("/api/vehicles/:id", async (req, res) => {
    res.json(await dbService.updateVehicle(req.params.id, req.body));
  });

  app.delete("/api/vehicles/:id", async (req, res) => {
    await dbService.deleteVehicle(req.params.id);
    res.json({ success: true });
  });

  // Scales CRUD
  app.get("/api/scales", async (req, res) => {
    res.json(await dbService.getScales());
  });

  app.post("/api/scales", async (req, res) => {
    res.json(await dbService.createScale(req.body));
  });

  app.put("/api/scales/:id", async (req, res) => {
    res.json(await dbService.updateScale(req.params.id, req.body));
  });

  app.delete("/api/scales/:id", async (req, res) => {
    await dbService.deleteScale(req.params.id);
    res.json({ success: true });
  });

  // Transactions CRUD
  app.get("/api/transactions", async (req, res) => {
    res.json(await dbService.getTransactions());
  });

  app.post("/api/transactions", async (req, res) => {
    res.json(await dbService.createTransaction(req.body));
  });

  app.delete("/api/transactions/:id", async (req, res) => {
    await dbService.deleteTransaction(req.params.id);
    res.json({ success: true });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // In electron production, the server is inside dist-server, so the frontend dist is ../dist
    const distPath = process.env.DB_PATH ? path.join(__dirname, '..', 'dist') : path.join(__dirname, "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
