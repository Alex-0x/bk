const express = require("express");
const { Pool } = require("pg");
const dotenv = require("dotenv");
const cors = require("cors");

dotenv.config();

const app = express();
const port = process.env.PORT || 3000; // Usa la porta dinamica fornita da Render o 3000 per sviluppo locale

// Configurazione del database
const pool = new Pool({
	host: process.env.DB_HOST,
	port: process.env.DB_PORT,
	user: process.env.DB_USER,
	password: process.env.DB_PASSWORD,
	database: process.env.DB_NAME,
});

// Middleware
app.use(cors()); // Abilita CORS per tutte le origini
app.use(express.json());

// Endpoint CRUD
// CREATE
app.post("/users", async (req, res) => {
	const { name, profession } = req.body;
	try {
		const result = await pool.query(
			"INSERT INTO users (name, profession) VALUES ($1, $2) RETURNING *",
			[name, profession]
		);
		res.status(201).json(result.rows[0]);
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
});

// READ
app.get("/users/:id", async (req, res) => {
	const { id } = req.params;
	try {
		const result = await pool.query("SELECT * FROM users WHERE id = $1", [
			id,
		]);
		if (result.rows.length === 0) {
			return res.status(404).json({ error: "user not found" });
		}
		res.json(result.rows[0]);
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
});

//READ ALL
app.get("/users", async (req, res) => {
	try {
		const result = await pool.query("SELECT * FROM users");
		if (result.rows.length === 0) {
			return res.status(404).json({ error: "users not found" });
		}
		res.json(result.rows);
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
});

// UPDATE
app.put("/users/:id", async (req, res) => {
	const { id } = req.params;
	const { name, profession } = req.body;
	try {
		const result = await pool.query(
			"UPDATE users SET name = $1, profession = $2 WHERE id = $3 RETURNING *",
			[name, profession, id]
		);
		if (result.rows.length === 0) {
			return res.status(404).json({ error: "user not found" });
		}
		res.json(result.rows[0]);
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
});

// DELETE
app.delete("/users/:id", async (req, res) => {
	const { id } = req.params;
	try {
		const result = await pool.query(
			"DELETE FROM users WHERE id = $1 RETURNING *",
			[id]
		);
		if (result.rows.length === 0) {
			return res.status(404).json({ error: "user not found" });
		}
		res.json(result.rows[0]);
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
});

// Avvia il server
app.listen(port, () => {
	console.log(`Server running on port ${port}`);
});
