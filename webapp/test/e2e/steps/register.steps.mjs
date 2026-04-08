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

When('I leave the {string} field empty and submit', async function (fieldName) {
  const page = this.page
  if(!page) throw new Error('Page not initialized')

  if(fieldName !== 'username')
    await page.fill('#username', "pruebina")

  if(fieldName !== 'password')
    await page.fill('#password', 'TestPassword123!')

  if(fieldName !== 'confirmPassword')
    await page.fill('#confirmPassword', 'TestPassword123!')

  await page.click('.submit-button')

})

When('I fill the form with two different passwords', async function() {

  const page = this.page
  if(!page) throw new Error('Page not initialized')

  await page.fill('#username', 'pruebina')
  await page.fill('#password', 'TestPassword123!')
  await page.fill('#confirmPassword', 'WrongPassword')

  await page.click('.submit-button')
}) 


Then('I should see a welcome message containing {string}', async function (expected) {
  const page = this.page
  if (!page) throw new Error('Page not initialized')
  
  // Usar el username único que fue registrado
  const registeredUsername = this.registeredUsername
  
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

  await page.waitForSelector('[data-testid="error-message"]', {timeout: 10000})
  const content = await page.content()

  assert.ok(
    content.includes(message),
    `Expected page to include error message: "${message}"`
  )


  // // Esperar a que aparezca el mensaje de error
  // const content = await page.content()
  // assert.ok(
  //   await content.includes(message), 
  //   `Expected page to include error message: "${message}"`
  // )

})