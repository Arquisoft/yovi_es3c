const express = require('express');
const app = express();
const port = 3000;
const swaggerUi = require('swagger-ui-express');
const fs = require('node:fs');
const YAML = require('js-yaml');
const promBundle = require('express-prom-bundle');
const mongoose = require('mongoose');
require('dotenv').config();

const metricsMiddleware = promBundle({includeMethod: true});
app.use(metricsMiddleware);

try {
  const swaggerDocument = YAML.load(fs.readFileSync('./openapi.yaml', 'utf8'));
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
} catch (e) {
  console.log(e);
}

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.sendStatus(204);
  next();
});

app.use(express.json());

app.post('/createuser', async (req, res) => {
  // Parámetros
  const { username, password, confirmPassword } = req.body;

  try {
    // 1. Validaciones de Negocio (Capa de Integridad)
    if (!username || !password || !confirmPassword) {
      return res.status(400).json({ error: "Todos los campos son obligatorios" });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ error: "Las contraseñas no coinciden" });
    }

    // 2. Comprobar si el usuario ya existe 

    // 3. Seguridad: Hashear la contraseña

    // 4. Almacenamiento

    // 5. Respuesta (Sin devolver la contraseña por seguridad)
    res.status(201).json({ 
      message: `Usuario ${username} creado con éxito`,
      username: username
    });

  } catch (err) {
    res.status(500).json({ error: "Error interno del servidor" });
  }
});


if (require.main === module) {
  app.listen(port, () => {
    console.log(`User Service listening at http://localhost:${port}`)
  })
}

module.exports = app
