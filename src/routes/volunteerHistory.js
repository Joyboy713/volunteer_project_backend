import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const router = express.Router();

// Handle ES module paths for __dirname and __filename
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Path to volunteer history JSON file
const volunteerHistoryFilePath = path.join(__dirname, '../data/volunteerHistory.json');

// Route to get volunteer history data
router.get('/', (req, res) => {
  fs.readFile(volunteerHistoryFilePath, 'utf8', (err, data) => {
    if (err) {
      console.error('Error reading volunteer history file:', err);
      return res.status(500).json({ message: 'Error reading volunteer history data' });
    }
    try {
      const volunteerHistory = JSON.parse(data);
      res.json(volunteerHistory);
    } catch (parseErr) {
      console.error('Error parsing volunteer history JSON:', parseErr);
      res.status(500).json({ message: 'Error parsing volunteer history data' });
    }
  });
});

export default router;
