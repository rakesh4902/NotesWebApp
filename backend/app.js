const express = require("express");
const cors=require("cors")
const app = express();
app.use(express.json());
app.use(cors())
require("dotenv").config();
const sqlite3 = require("sqlite3");
const { open } = require("sqlite");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const path = require("path");
const { env } = require("process");
const dbPath = path.join(__dirname, "notesStorage.db");
let db = null;

const initializeDbAndServer = async () => {
    try {
      // Open SQLite database connection
      db = await open({
        filename: dbPath,
        driver: sqlite3.Database,
      });
  
    //   db.run(`CREATE TABLE IF NOT EXISTS users (
    //     id INTEGER PRIMARY KEY AUTOINCREMENT,
    //     username TEXT UNIQUE,
    //     password TEXT
    //   )`);
    
    //   db.run(`CREATE TABLE IF NOT EXISTS notes (
    //     id INTEGER PRIMARY KEY AUTOINCREMENT,
    //     user_id INTEGER,
    //     title TEXT,
    //     content TEXT,
    //     tags TEXT,
    //     color TEXT,
    //     archived INTEGER DEFAULT 0,
    //     deleted INTEGER DEFAULT 0,
    //     reminder DATE,
    //     created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    //     updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    //     FOREIGN KEY(user_id) REFERENCES users(id)
    //   )`);
  
     
  
      // Retrieve and log all table names
      // const getTablesQuery = `
      //   SELECT name FROM sqlite_master WHERE type='table';
      // `;
      // const tables = await db.all(getTablesQuery);
      // console.log("Tables in the database:", tables.map(table => table.name));
     
  
      // Start the server
      app.listen(3000, () => {
        console.log("Server is running...");
      });
    } catch (e) {
      console.log(`DB Error: ${e.message}`);
      process.exit(1);
    }
};
  
initializeDbAndServer();

// Registration endpoint
app.post("/register/", async (request, response) => {
    const { username, password } = request.body;
  
    // Check if the user already exists
    const selectUserQuery = `
      SELECT *
      FROM users
      WHERE username = ?;
    `;
    const dbUser = await db.get(selectUserQuery, username);
  
    if (dbUser !== undefined) {
      response.status(400).json({ error: "User already exists" });
    } else {
      // Validate password length
      if (password.length < 6) {
        response.status(400).json({ error: "Password is too short" });
      } else {
        // Hash the password and insert the user
        const hashedPassword = await bcrypt.hash(password, 10);
        const insertQuery = `
          INSERT INTO users (username, password)
          VALUES (?, ?);
        `;
        await db.run(insertQuery, username, hashedPassword, );
        response.json({ message: "User created successfully" });
      }
    }
});


// Login endpoint
app.post("/login/", async (request, response) => {
    const { username, password } = request.body;
    // console.log(username)
    // Check if the user exists
    const selectUserQuery = `
      SELECT *
      FROM users
      WHERE username = ?;
    `;
    const dbUser = await db.get(selectUserQuery, username);
    
    if (dbUser === undefined) {
      response.status(400).json({ error: "You need to signup before login" });
    } else {
      // Verify the password
      const isCorrectPassword = await bcrypt.compare(password, dbUser.password);
  
      if (!isCorrectPassword) {
        response.status(400).json({ error: "Invalid password" });
      } else {
        // Generate and send JWT token on successful login
        const payload = { username: dbUser.username, id: dbUser.id };
        // console.log(payload)
        const jwtToken = jwt.sign(payload, env.SECRET_KEY);
        response.status(200).json({ jwtToken });
      }
    }
});

// Get all users
app.get("/users" , async (request, response) => {
    try {
      const getUsersQuery = `
        SELECT *
        FROM users;
      `;
      const users = await db.all(getUsersQuery);
    //   console.log(users)
      response.status(200).json(users);
    } catch (error) {
      response.status(500).json({ error: error.message });
    }
});

// Middleware to authenticate token
const authenticateToken = (request, response, next) => {
    const authHeader = request.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (token == null) return response.sendStatus(401);
  
    jwt.verify(token, env.SECRET_KEY, (err, payload) => {
      if (err) return response.sendStatus(403);
      request.user = payload;
      next();
    });
};

// Create a new note
app.post("/notes", authenticateToken, async (request, response) => {
    const { title, content, tags, color, reminder } = request.body;
    const user_id = request.user.id; 
    // console.log(user_id)
    try {
        const insertNoteQuery = `
          INSERT INTO notes (user_id, title, content, tags, color, reminder)
          VALUES (?, ?, ?, ?, ?, ?);
        `;
        await db.run(insertNoteQuery, user_id, title, content, tags, color, reminder);
        response.status(201).json({ message: "Note created successfully" });
    } catch (error) {
        console.error(error);
        response.status(500).json({ error: "Failed to create note" });
    }
});



// Get all notes for a user
app.get("/notes", authenticateToken, async (request, response) => {
    const user_id = request.user.id;
    // console.log(user_id)
    try {
        const getNotesQuery = `
            SELECT *
            FROM notes
            WHERE user_id = ? AND deleted = 0 AND archived = 0;
        `;
        const notes = await db.all(getNotesQuery, user_id);
        response.status(200).json(notes);
    } catch (error) {
        console.error(error);
        response.status(500).json({ error: "Failed to retrieve notes" });
    }
});


// Update a note
app.put("/notes/:id", authenticateToken, async (request, response) => {
  const { id } = request.params;
  const { title, content, tags, color, reminder } = request.body;
  try{
    const updateNoteQuery = `
      UPDATE notes
      SET title = ?, content = ?, tags = ?, color = ?, reminder = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?;
    `;
    await db.run(updateNoteQuery, title, content, tags, color, reminder, id);
    response.json({ message: "Note updated successfully" });
  }catch (error) {
    console.error(error);
    response.status(500).json({ error: "Failed to Update notes" });
}
});

// Delete a note 
app.delete("/notes/:id", authenticateToken, async (request, response) => {
  const noteId = request.params.id;
  const user_id = request.user.id;

  try {
      const deleteNoteQuery = `
          UPDATE notes
          SET deleted = 1
          WHERE id = ? AND user_id = ? AND deleted = 0;
      `;
      await db.run(deleteNoteQuery, noteId, user_id);
      response.status(200).json({ message: "Note deleted successfully" });
  } catch (error) {
      console.error(error);
      response.status(500).json({ error: "Failed to delete note" });
  }
});

// Archive a note
app.patch("/notes/:id/archive", authenticateToken, async (request, response) => {
  const noteId = request.params.id;
  const user_id = request.user.id;

  try {
    // Check if the note exists and belongs to the user
    const selectNoteQuery = `
      SELECT *
      FROM notes
      WHERE id = ? AND user_id = ? AND deleted = 0;
    `;
    const note = await db.get(selectNoteQuery, noteId, user_id);

    if (!note) {
      return response.status(404).json({ error: "Note not found or already deleted" });
    }

    // Archive the note
    const archiveNoteQuery = `
      UPDATE notes
      SET archived = 1, updated_at = CURRENT_TIMESTAMP
      WHERE id = ? AND user_id = ? AND deleted = 0;
    `;
    const result = await db.run(archiveNoteQuery, noteId, user_id);

    if (result.changes === 0) {
      return response.status(500).json({ error: "Failed to archive note" });
    }

    response.status(200).json({ message: "Note archived successfully" });
  } catch (error) {
    console.error(error);
    response.status(500).json({ error: "Failed to archive note" });
  }
});


// Restore a note from the archive
app.patch("/notes/:id/restore", authenticateToken, async (request, response) => {
  const noteId = request.params.id;
  const user_id = request.user.id;

  try {
      const restoreNoteQuery = `
          UPDATE notes
          SET archived = 0
          WHERE id = ? AND user_id = ? AND deleted = 0;
      `;
      await db.run(restoreNoteQuery, noteId, user_id);
      response.status(200).json({ message: "Note restored successfully" });
  } catch (error) {
      console.error(error);
      response.status(500).json({ error: "Failed to restore note" });
  }
});

// Restore a note from the trash
app.patch("/notes/:id/untrash", authenticateToken, async (request, response) => {
  const noteId = request.params.id;
  const user_id = request.user.id;

  try {
      const restoreNoteQuery = `
          UPDATE notes
          SET deleted = 0
          WHERE id = ? AND user_id = ? AND deleted = 1;
      `;
      await db.run(restoreNoteQuery, noteId, user_id);
      response.status(200).json({ message: "Note restored successfully" });
  } catch (error) {
      console.error(error);
      response.status(500).json({ error: "Failed to restore note" });
  }
});

// Permanently delete a note
app.delete("/notes/:id/permanent", authenticateToken, async (request, response) => {
  const noteId = request.params.id;
  const user_id = request.user.id;

  try {
      const deletePermanentQuery = `
          DELETE FROM notes
          WHERE id = ? AND user_id = ? AND deleted = 1;
      `;
      await db.run(deletePermanentQuery, noteId, user_id);
      response.status(200).json({ message: "Note permanently deleted" });
  } catch (error) {
      console.error(error);
      response.status(500).json({ error: "Failed to permanently delete note" });
  }
});

// Get all archived notes
app.get("/notes/archived", authenticateToken, async (request, response) => {
  const user_id = request.user.id;

  try {
      const getArchivedNotesQuery = `
          SELECT *
          FROM notes
          WHERE user_id = ? AND archived = 1 AND deleted = 0;
      `;
      const notes = await db.all(getArchivedNotesQuery, user_id);
      response.status(200).json(notes);
  } catch (error) {
      console.error(error);
      response.status(500).json({ error: "Failed to retrieve archived notes" });
  }
});

// Get all notes in the trash (deleted in the last 30 days)
app.get("/notes/trash", authenticateToken, async (request, response) => {
  const user_id = request.user.id;

  try {
      const getTrashNotesQuery = `
          SELECT *
          FROM notes
          WHERE user_id = ? AND deleted = 1 AND updated_at >= datetime('now', '-30 day');
      `;
      const notes = await db.all(getTrashNotesQuery, user_id);
      response.status(200).json(notes);
  } catch (error) {
      console.error(error);
      response.status(500).json({ error: "Failed to retrieve notes from trash" });
  }
});

// Get username from DB
app.get('/user', authenticateToken, (req, res) => {
  const { username } = req.user;  
  res.json({ username }); 
});

// Get unique labels for a user
app.get("/labels", authenticateToken, async (request, response) => {
  const user_id = request.user.id;

  try {
    const getLabelsQuery = `
      SELECT DISTINCT tags
      FROM notes
      WHERE user_id = ? AND tags IS NOT NULL AND tags != '';
    `;
    const labels = await db.all(getLabelsQuery, user_id);

  
    const uniqueLabels = [...new Set(labels.map(row => row.tags).join(',').split(','))];

    response.status(200).json(uniqueLabels);
  } catch (error) {
    console.error(error);
    response.status(500).json({ error: "Failed to retrieve labels" });
  }
});


// Get notes by label for a user
app.get("/notes/by-label", authenticateToken, async (request, response) => {
  const user_id = request.user.id;
  const { label } = request.query;

  if (!label) {
      return response.status(400).json({ error: "Label query parameter is required" });
  }

  try {
      const getNotesQuery = `
          SELECT *
          FROM notes
          WHERE user_id = ? AND deleted = 0 AND archived = 0 AND tags LIKE ?;
      `;
      
      const notes = await db.all(getNotesQuery, [user_id, `%${label}%`]);
      response.status(200).json(notes);
  } catch (error) {
      console.error(error);
      response.status(500).json({ error: "Failed to retrieve notes by label" });
  }
});
