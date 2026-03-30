import { setWorldConstructor, Before, After, setDefaultTimeout } from '@cucumber/cucumber'
import { chromium } from 'playwright'

setDefaultTimeout(90_000)

class CustomWorld {
  browser = null
  page = null
}

setWorldConstructor(CustomWorld)

Before(async function () {
  // Allow turning off headless mode and enabling slow motion/devtools via env vars
  const headless = process.env.PLAYWRIGHT_HEADLESS !== 'false'
  const slowMo = process.env.PLAYWRIGHT_SLOW_MO ? parseInt(process.env.PLAYWRIGHT_SLOW_MO) : 0
  const devtools = process.env.PLAYWRIGHT_DEVTOOLS === 'true'

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
