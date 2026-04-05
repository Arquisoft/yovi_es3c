import { Given, When, Then } from '@cucumber/cucumber'
import assert from 'assert'

const API_URL = process.env.VITE_GAMEY_API_URL || 'http://localhost:4000';
const BOARD_SIZE = 8;
const MAX_MOVES = 100;
const EMPTY_LAYOUT = Array.from({ length: BOARD_SIZE }, (_, i) => '.'.repeat(i + 1)).join('/');
const DIALOG_SELECTOR = '.game-dialog__title--win, .game-dialog__title--loss';

async function login(page) {
    await page.goto('http://localhost:5173/login');
    await page.fill('#username', 'Alice');
    await page.fill('#password', '12345');
    await page.click('.submit-button');
    await page.waitForURL('**/dashboard');
    await page.waitForSelector('.game-setup-form');
}

async function getBotMove(botId, layout) {
    const res = await fetch(`${API_URL}/v1/ybot/choose/${botId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ size: BOARD_SIZE, players: ['B', 'R'], turn: 1, layout }),
    });

    const data = await res.json();

    if (!data?.coords) throw new Error('API no devolvió coordenadas: ' + JSON.stringify(data));
    const row = BOARD_SIZE - 1 - data.coords.x;
    const col = data.coords.y;
    if (row < 0 || row >= BOARD_SIZE || col < 0 || col > row) {
        throw new Error(`Coordenada inválida: row=${row}, col=${col}`);
    }
    return { row, col };
}

async function playUntilEnd(page, botId, endSelector) {
    let finished = false;
    let moves = 0;
    while (!finished && moves < MAX_MOVES) {
        const layout = await page.evaluate(() => window.localStorage.getItem('game-board')) || EMPTY_LAYOUT;
        const { row, col } = await getBotMove(botId, layout);
        await page.waitForSelector(`[data-row="${row}"][data-col="${col}"]`, { timeout: 5000 });
        await page.click(`[data-row="${row}"][data-col="${col}"]`);
        await Promise.race([
            page.waitForTimeout(2000),
            page.waitForSelector(endSelector, { timeout: 5000 })
        ]);
        finished = await page.isVisible(endSelector);
        moves++;
    }

}

Given('el usuario está logueado y en la pantalla de configuración', async function () {
    await login(this.page);
});

When('selecciona la dificultad {string}, el bot {string} y el tamaño {string}', async function (dificultad, bot, tamano) {
    const page = this.page;
    await page.click(`button:has-text("${dificultad.charAt(0).toUpperCase() + dificultad.slice(1)}")`);
    await page.click(`button:has-text("${bot}")`);
    const input = await page.$('input[type="range"]');
    if (input) await input.fill(tamano);
    await page.click('button:has-text("Jugar")');
    await page.waitForSelector('.game-board');
});

When('realiza movimientos hasta ganar la partida', async function () {
    const page = this.page;
    await playUntilEnd(page, 'montecarlo_bot', '.game-dialog__title--win');
    const content = await page.textContent('.game-dialog__title--win');
    assert.ok(content.includes('¡Has ganado!'), 'No se detectó la victoria');
});

When('realiza movimientos hasta perder la partida', async function () {
    const page = this.page;
    await playUntilEnd(page, 'random_bot', '.game-dialog__title--loss');
    const content = await page.textContent('.game-dialog__title--loss');
    assert.ok(content.includes('¡Has perdido!'), 'No se detectó la derrota');
});

Given('el usuario ha terminado una partida', async function () {
    const page = this.page;
    await login(page);
    await page.click('button:has-text("Fácil")');
    await page.click('button:has-text("Aleatorio")');
    const input = await page.$('input[type="range"]');
    if (input) await input.fill('8');
    await page.click('button:has-text("Jugar")');
    await page.waitForSelector('.game-board');
    await playUntilEnd(page, 'montecarlo_bot', DIALOG_SELECTOR);
    await page.waitForSelector(DIALOG_SELECTOR, { timeout: 10000 });
});

Then('debería ver el mensaje {string} en el resumen', async function (mensaje) {
    const page = this.page;
    await page.waitForSelector(DIALOG_SELECTOR);
    const el = await page.$(DIALOG_SELECTOR);
    const content = await el.textContent();
    assert.ok(content.includes(mensaje), `No se encontró el mensaje "${mensaje}"`);
});

When('pulsa jugar de nuevo', async function () {
    await this.page.click('button:has-text("Jugar de nuevo")');
});

When('pulsa volver al inicio', async function () {
    await this.page.click('button:has-text("Volver al inicio")');
});

Then('debería volver a empezar una nueva partida', async function () {
    await this.page.waitForSelector('.game-board');
    const texto = await this.page.textContent('.player-info');
    assert.ok(texto.includes('10000'), 'No se reinició la puntuación a 10000');
});

Then('debería volver a la pantalla de configuración', async function () {
    await this.page.waitForSelector('.game-setup-form');
});