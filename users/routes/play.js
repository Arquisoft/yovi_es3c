//codigo a quitar o cambiar, consultar aun.
const express = require('express');
const router = express.Router();

const RUST_URL = process.env.RUST_URL ?? "http://localhost:4000";

router.post('/play', async (req, res) => {
  const { position, bot_id } = req.body;

  // position YA es un YEN completo
  if (!position) {
    return res.status(400).json({ error: 'position is required' });
  }

  try {
    const rustResponse = await fetch(`${RUST_URL}/v1/ybot/choose/${bot_id}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(position)   // <-- enviamos el YEN tal cual
    });

    const data = await rustResponse.json();

    return res.json({ next_move: data.coords });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Error contacting Rust module' });
  }
});

module.exports = router;
