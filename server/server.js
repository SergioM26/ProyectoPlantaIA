import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import sqlite3 from 'sqlite3';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET || 'change_this_secret';

// Middlewares
app.use(cors());
app.use(express.json());

// DB setup
const dbFile = path.join(__dirname, 'plantaia.db');
const db = new sqlite3.Database(dbFile);

db.serialize(() => {
	db.run(`CREATE TABLE IF NOT EXISTS users (
		id INTEGER PRIMARY KEY AUTOINCREMENT,
		name TEXT NOT NULL,
		email TEXT NOT NULL UNIQUE,
		password_hash TEXT NOT NULL,
		created_at TEXT NOT NULL
	)`);
});

function generateToken(user) {
	return jwt.sign({ id: user.id, email: user.email, name: user.name }, JWT_SECRET, { expiresIn: '7d' });
}

app.post('/api/register', (req, res) => {
	const { name, email, password } = req.body;
	if (!name || !email || !password) {
		return res.status(400).json({ message: 'Faltan campos requeridos' });
	}
	const passwordHash = bcrypt.hashSync(password, 10);
	const createdAt = new Date().toISOString();
	db.run(
		`INSERT INTO users (name, email, password_hash, created_at) VALUES (?, ?, ?, ?)`,
		[name, email.toLowerCase(), passwordHash, createdAt],
		function(err) {
			if (err) {
				if (err.message.includes('UNIQUE')) {
					return res.status(409).json({ message: 'El correo ya está registrado' });
				}
				return res.status(500).json({ message: 'Error al registrar usuario' });
			}
			const user = { id: this.lastID, name, email: email.toLowerCase() };
			const token = generateToken(user);
			return res.status(201).json({ user, token });
		}
	);
});

app.post('/api/login', (req, res) => {
	const { email, password } = req.body;
	if (!email || !password) {
		return res.status(400).json({ message: 'Faltan credenciales' });
	}
	db.get(`SELECT * FROM users WHERE email = ?`, [email.toLowerCase()], (err, row) => {
		if (err) {
			return res.status(500).json({ message: 'Error al buscar usuario' });
		}
		if (!row) {
			return res.status(401).json({ message: 'Credenciales inválidas' });
		}
		const ok = bcrypt.compareSync(password, row.password_hash);
		if (!ok) {
			return res.status(401).json({ message: 'Credenciales inválidas' });
		}
		const user = { id: row.id, name: row.name, email: row.email };
		const token = generateToken(user);
		return res.json({ user, token });
	});
});

// Simple endpoint to validate token
app.get('/api/me', (req, res) => {
	const auth = req.headers.authorization || '';
	const token = auth.startsWith('Bearer ') ? auth.slice(7) : null;
	if (!token) return res.status(401).json({ message: 'No autorizado' });
	try {
		const payload = jwt.verify(token, JWT_SECRET);
		return res.json({ user: payload });
	} catch (e) {
		return res.status(401).json({ message: 'Token inválido' });
	}
});

app.listen(PORT, () => {
	console.log(`API escuchando en http://localhost:${PORT}`);
}); 