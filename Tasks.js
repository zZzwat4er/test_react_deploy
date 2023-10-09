const express = require('express');
require("dotenv").config();
const { Pool } = require('pg');
const router = express.Router();

const URL = process.env.DBURL;

const pool = new Pool({
  connectionString: URL,
  ssl: {
    rejectUnauthorized: false, 
  },
});

router.get('/', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM task');
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.get('/:id', async (req, res) => {
  const taskId = req.params.id;
  try {
    const { rows } = await pool.query('SELECT * FROM task WHERE taskid = $1', [taskId]);
    if (rows.length === 0) {
      res.status(404).json({ error: 'Task not found' });
    } else {
      res.json(rows[0]);
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.get('/telegram/:telegramid', async (req, res) => {
  const telegramid = req.params.telegramid; 
  if (!telegramid) {
   
    return res.status(400).json({ error: 'Telegram ID is required' });
  }
  try {
    const { rows } = await pool.query('SELECT message from task t JOIN botuser b ON b.userid = t.userid where b.telegramid = $1;', [telegramid]);
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.post('/', async (req, res) => {
  const { message, status, userid } = req.body;
  try {
    let currentDate = new Date();
    currentDate = currentDate.toISOString().replace('T', ' ').slice(0, -5);

    const { rows } = await pool.query('SELECT userid FROM botuser WHERE telegramid = $1', [userid]);

    if (rows.length === 0) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    const actualid = rows[0].userid;
    console.log('actualid:', actualid);

    const query = 'INSERT INTO task (message, creationdate, status, userid) VALUES ($1, $2, $3, $4) RETURNING *';
    const { rows: insertedRows } = await pool.query(query, [message, currentDate, status, actualid]);
    res.status(201).json(insertedRows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});


router.put('/:id', async (req, res) => {
  const taskId = req.params.id;
  const { message, status } = req.body;
  try {
    const { rows } = await pool.query('UPDATE task SET message = $1, status = $2 WHERE id = $3 RETURNING *', [message, status, taskId]);
    if (rows.length === 0) {
      res.status(404).json({ error: 'Task not found' });
    } else {
      res.json(rows[0]);
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.delete('/:id', async (req, res) => {
  const taskId = req.params.id;
  try {
    const { rows } = await pool.query('DELETE FROM task WHERE id = $1 RETURNING *', [taskId]);
    if (rows.length === 0) {
      res.status(404).json({ error: 'Task not found' });
    } else {
      res.json({ message: 'Task deleted successfully' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

module.exports = router;
