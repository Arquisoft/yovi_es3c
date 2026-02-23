const express = require('express');
const app = express();
const port = 3000; 
const swaggerUi = require('swagger-ui-express');
const fs = require('node:fs');
const YAML = require('js-yaml');
const promBundle = require('express-prom-bundle');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Modelo de usuario
const User = require('./models/User'); 

// CONEXIÓN A MONGODB ATLAS
const mongoUri = process.env.MONGO_URL;
if (!mongoUri) {
  console.error("ERROR: No se encuentra la variable MONGO_URI en el archivo .env");
} else {
  mongoose.connect(mongoUri)
    .then(() => console.log("Conectado con éxito a MongoDB Atlas"))
    .catch(err => console.error("Error al conectar a MongoDB:", err));
}

const metricsMiddleware = promBundle({includeMethod: true});
app.use(metricsMiddleware);

// Configuración de Swagger
try {
  const swaggerDocument = YAML.load(fs.readFileSync('./openapi.yaml', 'utf8'));
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
} catch (e) {
  console.log("Error cargando Swagger:", e);
}

// Middleware CORS
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.sendStatus(204);
  next();
});

app.use(express.json());

// Endpoint de creación de usuario
app.post('/createuser', async (req, res) => {
  const { username, password, confirmPassword } = req.body;

  try {
    
    // Comprobacion de los campos
    if (!username || !password || !confirmPassword) {
      return res.status(400).json({ error: "Todos los campos son obligatorios" });
    }

    // Las contraseñas coinciden
    if (password !== confirmPassword) {
      return res.status(400).json({ error: "Las contraseñas no coinciden" });
    }

    // Comprobamos si el usuario existe
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(409).json({ error: "El nombre de usuario ya está en uso" });
    }

    // Hasheamos la contraseña
    const salt = await bcrypt.genSalt(10);  // 10 rondas de sal para fortalecer el hash
    const hashedPassword = await bcrypt.hash(password, salt);

    // Creamos y guardamos el usuario
    const newUser = new User({
      username,
      password: hashedPassword 
    });

    await newUser.save();

    res.status(201).json({ 
      message: `Usuario ${username} creado con éxito`,
      username: username
    });

  } catch (err) {
    console.error("Error en POST /createuser:", err);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

if (require.main === module) {
  app.listen(port, () => {
    console.log(`User Service escuchando en http://localhost:${port}`)
  })
}

module.exports = app;