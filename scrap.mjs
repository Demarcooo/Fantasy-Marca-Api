import puppeteer from 'puppeteer-extra'
import StealthPlugin from 'puppeteer-extra-plugin-stealth'
import fs from 'fs'

puppeteer.use(StealthPlugin())

// Configuración
const CONFIG = {
  headless: false,
  cookiesPath: 'cookies.json',
  localStoragePath: 'localStorage.json',
  baseUrl: 'https://fantasy.marca.com',
  outputPath: 'player_data.json',
  timeout: 30000 // 30 segundos para timeouts
}

// Función principal
const run = async () => {
  const playerId = '52375' // Parametrizado para fácil cambio
  let browser = null
  
  try {
    // Iniciar navegador
    browser = await puppeteer.launch({ 
      headless: CONFIG.headless,
      defaultViewport: null, // Para que se ajuste al tamaño de la ventana
      args: ['--start-maximized']
    })
    
    const page = await browser.newPage()
    
    // Cargar cookies
    console.log('Cargando cookies...')
    await loadCookies(page)
    
    // Acceder al sitio y restaurar sesión
    console.log('Iniciando sesión en el sitio...')
    await loginWithSession(page)
    
    // Navegar al perfil del jugador
    console.log(`Accediendo al perfil del jugador (ID: ${playerId})...`)
    await navigateToPlayerProfile(page, playerId)
    
    // Extraer datos del jugador
    console.log('Extrayendo datos del jugador...')
    const playerData = await extractPlayerData(page)
    const playerStats = await extractPlayerStats(page)
    
    // Combinar todos los datos
    const completePlayerData = {
      id: playerId,
      ...playerData,
      stats: playerStats,
      extractedAt: new Date().toISOString()
    }
    
    // Guardar a archivo
    fs.writeFileSync(
      CONFIG.outputPath, 
      JSON.stringify(completePlayerData, null, 2)
    )
    
    console.log(`✅ Datos guardados exitosamente en ${CONFIG.outputPath}`)
    console.log('Resumen:', {
      nombre: `${playerData.name} ${playerData.surname}`,
      estadísticas: playerStats
    })
    
  } catch (error) {
    console.error('❌ Error durante la ejecución:', error)
  } finally {
    // Cerrar navegador en cualquier caso
    if (browser) await browser.close()
    console.log('Navegador cerrado.')
  }
}

// Función para cargar cookies
const loadCookies = async (page) => {
  try {
    const cookies = JSON.parse(fs.readFileSync(CONFIG.cookiesPath))
    await page.setCookie(...cookies)
    return true
  } catch (error) {
    console.error(`Error cargando cookies desde ${CONFIG.cookiesPath}:`, error.message)
    throw new Error('No se pudieron cargar las cookies')
  }
}

// Función para iniciar sesión con datos guardados
const loginWithSession = async (page) => {
  await page.goto(CONFIG.baseUrl, { 
    waitUntil: 'networkidle2',
    timeout: CONFIG.timeout
  })
  
  await page.waitForSelector('body', { timeout: CONFIG.timeout })
  
  // Restaurar localStorage
  try {
    const localStorageData = JSON.parse(fs.readFileSync(CONFIG.localStoragePath))
    await page.evaluate((data) => {
      for (const key in data) {
        localStorage.setItem(key, data[key])
      }
    }, localStorageData)
    
    // Recargar para aplicar la sesión
    await page.reload({ waitUntil: 'networkidle2', timeout: CONFIG.timeout })
    console.log('✅ Sesión restaurada correctamente')
    
  } catch (error) {
    console.error(`Error cargando localStorage desde ${CONFIG.localStoragePath}:`, error.message)
    throw new Error('No se pudo restaurar la sesión')
  }
}

// Navegar al perfil del jugador
const navigateToPlayerProfile = async (page, playerId) => {
  const playerUrl = `${CONFIG.baseUrl}/more#players/${playerId}`
  await page.goto(playerUrl, { waitUntil: 'networkidle2', timeout: CONFIG.timeout })
  
  // Esperar a que cargue el perfil
  await page.waitForSelector('.player-profile-header', { 
    visible: true,
    timeout: CONFIG.timeout 
  })
}

// Extraer datos básicos del jugador
const extractPlayerData = async (page) => {
  return page.evaluate(() => {
    const profileHeader = document.querySelector('.player-profile-header')
    
    if (!profileHeader) {
      throw new Error('No se encontró el header del perfil del jugador')
    }
    
    // Extraer datos básicos
    const name = profileHeader.querySelector('.name')?.textContent.trim() || null
    const surname = profileHeader.querySelector('.surname')?.textContent.trim() || null
    const team = profileHeader.querySelector('.team')?.textContent.trim() || null
    const position = profileHeader.querySelector('.position')?.textContent.trim() || null
    
    return { name, surname, team, position }
  })
}

// Extraer estadísticas del jugador
const extractPlayerStats = async (page) => {
  return page.evaluate(() => {
    const statsWrapper = document.querySelector('.player-stats-wrapper')
    
    if (!statsWrapper) {
      return []
    }
    
    // Encontrar todos los elementos con clase "item"
    const itemElements = statsWrapper.querySelectorAll('.item')
    const stats = []
    
    // Recorrer cada elemento y extraer su información
    itemElements.forEach((item) => {
      const label = item.querySelector('.label')?.textContent.trim() || null
      const value = item.querySelector('.value')?.textContent.trim() || null
      
      if (label && value) {
        stats.push({ label, value })
      }
    })
    
    return stats
  })
}

// Ejecutar el script
run()