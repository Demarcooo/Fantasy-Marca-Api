import puppeteer from 'puppeteer-extra'
import StealthPlugin from 'puppeteer-extra-plugin-stealth'
import fs from 'fs'

puppeteer.use(StealthPlugin())

const run = async () => {

  const id = '52375'

  const browser = await puppeteer.launch({ headless: false }) // Abre navegador visible
  const page = await browser.newPage()

  // Carga cookies desde el archivo 'cookies.json'
  const cookies = JSON.parse(fs.readFileSync('cookies.json'))
  await page.setCookie(...cookies)

  // Accede al sitio web (como si estuvieras logueado)
  await page.goto('https://fantasy.marca.com', { waitUntil: 'networkidle2' })

  console.log('✅ Accediste con sesión guardada.')

  // Espera a que se cargue la página y el contexto
  await page.waitForSelector('body')

  // Restaura localStorage
  const localStorageData = JSON.parse(fs.readFileSync('localStorage.json'))
  await page.evaluate((data) => {
    for (const key in data) {
      localStorage.setItem(key, data[key])
    }
  }, localStorageData)

  // Refresca la página para aplicar completamente el login
  await page.reload({ waitUntil: 'networkidle2' })

  // Accede a la página del jugador Mbappé
  await page.goto('https://fantasy.marca.com/more#players/' + id, { waitUntil: 'networkidle2' })

  // Extrae el nombre y valor del jugador específicamente dentro de .player-profile-header
  const playerData = await page.evaluate(() => {
    const profileHeader = document.querySelector('.player-profile-header');

    const name = profileHeader.querySelector('.name')?.textContent.trim() || 'Nombre no encontrado';
    const surname = profileHeader.querySelector('.surname')?.textContent.trim() || 'Apellido no encontrado';

    return { name, surname };
  });

  const playerStats = await page.evaluate(() => {
    const profileHeader = document.querySelector('.player-stats-wrapper');
    const subHeader = profileHeader.querySelector('.item');

    const price = subHeader.querySelector('.value')?.textContent.trim() || 'Nombre no encontrado';
    // const pts = subHeader.querySelector('.value')?.textContent.trim() || 'Apellido no encontrado';

    return { price };
  });

  console.log('Datos del Jugador:', playerData)
  console.log('Stats del Jugador:', playerStats)

  // Cierra el navegador
  await browser.close()
}

run()
