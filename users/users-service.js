const express = require('express');
const app = express();
const port = 3000;
const swaggerUi = require('swagger-ui-express');
const fs = require('node:fs');
const YAML = require('js-yaml');
const promBundle = require('express-prom-bundle');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
dotenv.config();

// Modelo de usuario
const User = require('./models/User');

// Rutas de estadísticas
const statsRoutes = require('./routes/stats');

// CONEXIÓN A MONGODB ATLAS
const mongoUri = process.env.MONGO_URL;
mongoose.connect(mongoUri)
  .then(() => console.log("Conectado con éxito a MongoDB Atlas"))
  .catch(err => console.error("Error al conectar a MongoDB:", err));

const metricsMiddleware = promBundle({ includeMethod: true });
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

// Registrar rutas de estadísticas
app.use(statsRoutes);

// Endpoint inicio de sesion
app.post('/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    // Validación básica
    if (!username || !password) {
      return res.status(400).json({ error: "Todos los campos son obligatorios" });
    }

    // Sanitizar username igual que en createuser para solo permitir letras numeros arroba puntos y guiones
    const sanitizedUsername = String(username || '')
      .trim()
      .replace(/[^\w\s@.-]/gi, '');

    // Buscar usuario
    const user = await User.findOne({ username: sanitizedUsername });
    if (!user) {
      return res.status(401).json({ error: "Usuario o contraseña incorrectos" });
    }

    // Comparar contraseñas
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: "Usuario o contraseña incorrectos" });
    }

    // Login correcto
    return res.json({
      message: "Login exitoso",
      id: user._id.toString(),
      username: user.username
    });

  } catch (err) {
    console.error("Error en POST /login:", err);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});




// Endpoint de creación de usuario
app.post('/createuser', async (req, res) => {
  const { username, password, confirmPassword } = req.body;

  try {

    // Comprobacion de los campos
    if (!username || !password || !confirmPassword) {
      return res.status(400).json({ error: "Todos los campos son obligatorios" });
    }

    // Comprobación para asegurarnos que los datos son strings
    if (typeof username !== 'string' || typeof password !== 'string' || typeof confirmPassword !== 'string') {
      return res.status(400).json({ error: "Datos de entrada inválidos" });
    }

    // Las contraseñas coinciden
    if (password !== confirmPassword) {
      return res.status(400).json({ error: "Las contraseñas no coinciden" });
    }

    // Antes de empezar introducir el username a la bbdd, los sanitizamos
    const sanitizedUsername = String(username || '')
      .trim()
      .replace(/[^\w\s@.-]/gi, ''); // Solo permite letras, números, @, puntos y guiones    

    // Comprobamos si el usuario existe
    const existingUser = await User.findOne({ username: { $eq: sanitizedUsername } });
    if (existingUser) {
      return res.status(409).json({ error: "El nombre de usuario ya está en uso" });
    }

    // Hasheamos la contraseña
    const salt = await bcrypt.genSalt(10);  // 10 rondas de sal para fortalecer el hash
    const hashedPassword = await bcrypt.hash(password, salt);

    // Creamos y guardamos el usuario
    const newUser = new User({
      username: sanitizedUsername,
      password: hashedPassword
    });

    await newUser.save();

    res.status(201).json({
      message: `Usuario creado con éxito`,
      username
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