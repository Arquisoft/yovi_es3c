import { Given, When, Then } from '@cucumber/cucumber'
import assert from 'assert'

Given('the register page is open', async function () {
  const page = this.page
  if (!page) throw new Error('Page not initialized')
  await page.goto('http://localhost:5173/register')
})

When('I enter {string} as the username and submit', async function (username) {
  const page = this.page
  if (!page) throw new Error('Page not initialized')
  
  // Generar username único con timestamp para evitar conflictos en ejecuciones sucesivas
  const uniqueUsername = `${username}${Date.now()}`
  const password = 'TestPassword123!'
  
  // Llenar todos los campos del registro
  await page.fill('#username', uniqueUsername)
  await page.fill('#password', password)
  await page.fill('#confirmPassword', password)
  
  // Guardar el username único para usarlo en el siguiente paso
  this.registeredUsername = uniqueUsername
  
  await page.click('.submit-button')
})

When('I enter {string} as a duplicated username and submit', async function (username) {
  const page = this.page
  if(!page) throw new Error('Page not initialized')
  
  // Llenamos todos los campos del registro
  await page.fill('#username', username)
  await page.fill('#password', 'TestPassword123!')
  await page.fill('#confirmPassword', 'TestPassword123!')

  await page.click('.submit-button')
})

Then('I should see a welcome message containing {string}', async function (expected) {
  const page = this.page
  if (!page) throw new Error('Page not initialized')
  
  // Usar el username único que fue registrado
  const registeredUsername = this.registeredUsername
  console.log(`Waiting for dashboard with username: ${registeredUsername}`)
  
  // Esperar a que aparezca el dashboard
  await page.waitForSelector('.dashboard', { timeout: 10000 })
  
  // Verificar que el username registrado está en la página
  const content = await page.content()
  assert.ok(
    content.includes(registeredUsername),
    `Expected page to include registered username "${registeredUsername}"`
  )
})

Then('I should see an error message containing {string}', async function(message) {
  const page = this.page
  if (!page) throw new Error('Page not initialized')

  // Esperar a que aparezca el mensaje de error
  const content = await page.content()
  assert.ok(
    content.includes(message), 
    `Expected page to include error message: "${message}"`
  )

})