import { setWorldConstructor, Before, After, setDefaultTimeout, BeforeAll } from '@cucumber/cucumber'
import { chromium } from 'playwright'
import http from 'http'

setDefaultTimeout(60_000)

class CustomWorld {
  browser = null
  page = null
}

setWorldConstructor(CustomWorld)

async function checkPort(port) {
  return new Promise((resolve) => {
    const req = http.get(`http://localhost:${port}`, (res) => {
      res.on('data', () => {}); // consume the response
      res.on('end', () => resolve(true));
      res.on('error', () => resolve(false));
    });
    req.on('error', () => resolve(false));
    req.setTimeout(1000, () => {
      req.destroy();
      resolve(false);
    });
  });
}

async function waitForPort(port, maxAttempts = 60, interval = 1000) {
  for (let i = 0; i < maxAttempts; i++) {
    if (await checkPort(port)) {
      console.log(`✓ Servicio en puerto ${port} está listo`);
      return true;
    }
    console.log(`Esperando puerto ${port}... (${i + 1}/${maxAttempts})`);
    await new Promise(resolve => setTimeout(resolve, interval));
  }
  throw new Error(`Timeout esperando por el puerto ${port}`);
}

BeforeAll(async function () {
  console.log('Esperando a que esté listo el puerto 4000...');
  await waitForPort(4000, 180, 2000); // 180 intentos * 2 segundos = 6 minutos
});

Before(async function () {
  // Allow turning off headless mode and enabling slow motion/devtools via env vars
  const headless = true
  const slowMo = 0
  const devtools = false

  this.browser = await chromium.launch({ headless, slowMo, devtools })
  this.page = await this.browser.newPage()
  
  // Limpiar localStorage y sessionStorage navegando primero a un dominio
  await this.page.goto('http://localhost:5173')
  await this.page.evaluate(() => {
    localStorage.clear()
    sessionStorage.clear()
  })
})

After(async function () {
  if (this.page) await this.page.close()
  if (this.browser) await this.browser.close()
})
