import { Given, When, Then } from '@cucumber/cucumber'
import assert from 'assert'

Given('the login page is open', async function () {
  const page = this.page
  if (!page) throw new Error('Page not initialized')
  await page.goto('http://localhost:5173/login')
})

When('I enter {string} as the username and {string} as the password and submit', async function (username, password) {
  const page = this.page
  if (!page) throw new Error('Page not initialized')
  
  // Llenar los campos de usuario y contraseña
  await page.fill('#username', username)
  await page.fill('#password', password)
  
  // Hacer clic en el botón de submit
  await page.click('.submit-button')
})

Then('I should be redirected to {string}', async function (expectedUrl) {
  const page = this.page
  if (!page) throw new Error('Page not initialized')
  
  // Esperar a que se complete la navegación
  await page.waitForNavigation({ timeout: 10000 })
  
  // Verificar que la URL actual contiene la ruta esperada
  const currentUrl = page.url()
  assert.ok(
    currentUrl.includes(expectedUrl),
    `Expected URL to include "${expectedUrl}" but got "${currentUrl}"`
  )
})

Then('I should see an error message', async function () {
  const page = this.page
  if (!page) throw new Error('Page not initialized')
  
  // Esperar a que aparezca un mensaje de error
  const errorSelector = '.login-error'
  
  try {
    await page.waitForSelector(errorSelector, { timeout: 5000 })
  } catch (e) {
    throw new Error('Error message not found on the page')
  }
  
  // Verificar que el elemento de error es visible
  const errorVisible = await page.isVisible(errorSelector)
  assert.ok(errorVisible, 'Error message is not visible')
})
