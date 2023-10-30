const express = require('express');
require("dotenv").config();
const { Pool } = require('pg');
const router = express.Router();

const URL = "postgres://mqpnptxk:RmLLPKHco0tZNR3p7pr0lhCc2BnJzhwQ@ella.db.elephantsql.com/mqpnptxk";

const pool = new Pool({
  connectionString: URL,
  ssl: {
    rejectUnauthorized: false, 
  },
});

//get all tasks
router.get('/', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM task');
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

//get completed tasks
router.get('/completed', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM task where status = $1 ',['DONE']);
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


//get tasks by user's telegram id
router.get('/telegram/:telegramid', async (req, res) => {
  const telegramid = req.params.telegramid; 
  if (!telegramid) {
   
    return res.status(400).json({ error: 'Telegram ID is required' });
  }
  try {
    const { rows } = await pool.query('SELECT * from task t JOIN botuser b ON b.userid = t.userid where b.telegramid = $1', [telegramid]);
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});


//get completed tasks by user's telegram id
router.get('/telegram/completed/:telegramid', async (req, res) => {
  const telegramid = req.params.telegramid; 
  if (!telegramid) {
   
    return res.status(400).json({ error: 'Telegram ID is required' });
  }
  try {
    const { rows } = await pool.query('SELECT * from task t JOIN botuser b ON b.userid = t.userid where b.telegramid = $1 and t.status = $2', [telegramid, 'DONE']);
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});


router.post('/', async (req, res) => {
  const { message, status, senderurl, userid } = req.body;
  try {
    let currentDate = new Date();
    currentDate = currentDate.toISOString().replace('T', ' ').slice(0, -5);
    //user id in this case is the telegram user id

    const { rows } = await pool.query('SELECT userid FROM botuser WHERE telegramid = $1', [userid]);

    if (rows.length === 0) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    const actualid = rows[0].userid;
    console.log('actualid:', actualid);

    const query = 'INSERT INTO task (creationdate,message, status, senderurl,userid) VALUES ($1, $2, $3, $4, $5) RETURNING *';
    const { rows: insertedRows } = await pool.query(query, [ currentDate, message,status,senderurl, actualid]);
    res.status(201).json(insertedRows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

//edit task
router.put('/:id', async (req, res) => {
  const taskId = req.params.id;
  const { message, status, reminder } = req.body;
  try {
    const { rows } = await pool.query('UPDATE task SET message = $1, status = $2, reminder = $3 WHERE taskid = $4 RETURNING *', [message, status,reminder, taskId]);
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


//edit task status
router.put('/status/:id', async (req, res) => {
  const taskId = req.params.id;
  const {status} = req.body;
  try {
    const { rows } = await pool.query('UPDATE task SET status = $1 WHERE taskid = $2 RETURNING *', [status, taskId]);
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

//edit task reminder 
router.put('/reminder/:id', async (req, res) => {
  const taskId = req.params.id;
  const { reminder } = req.body;
  try {
    const { rows } = await pool.query('UPDATE task SET reminder = $1 WHERE taskid = $4 RETURNING *', [reminder, taskId]);
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
    const { rows } = await pool.query('DELETE FROM task WHERE taskid = $1 RETURNING *', [taskId]);
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
