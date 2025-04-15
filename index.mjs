import puppeteer from 'puppeteer-extra'
import StealthPlugin from 'puppeteer-extra-plugin-stealth'
import fs from 'fs'

puppeteer.use(StealthPlugin())

const run = async () => {
  const browser = await puppeteer.launch({
    headless: false, // Muy importante para login manual
    defaultViewport: { width: 1280, height: 800 },
    args: ['--start-maximized']
  })

  const page = await browser.newPage()
  await page.goto('https://fantasy.marca.com', { waitUntil: 'networkidle2' })

  console.log('👉 Inicia sesión manualmente en el navegador. Luego presiona ENTER en la consola para continuar...')
  await new Promise(resolve => process.stdin.once('data', resolve))

  const cookies = await page.cookies()
  const localStorageData = await page.evaluate(() => {
    let json = {}
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      json[key] = localStorage.getItem(key)
    }
    return json
  })

  fs.writeFileSync('cookies.json', JSON.stringify(cookies, null, 2))
  fs.writeFileSync('localStorage.json', JSON.stringify(localStorageData, null, 2))

  console.log('✅ Sesión guardada correctamente (cookies.json + localStorage.json)')
  await browser.close()
}

run()
