import { createServer } from 'node:http'
import { readFile, mkdir } from 'node:fs/promises'
import { DatabaseSync } from 'node:sqlite'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

const root = path.dirname(fileURLToPath(import.meta.url))
const dataDir = path.join(root, 'data')
const databasePath = path.join(dataDir, 'shopcart-racer.sqlite')
const seedPath = path.join(dataDir, 'catalog.json')
const port = Number(process.env.PORT || 8787)
await mkdir(dataDir, { recursive: true })
const database = new DatabaseSync(databasePath)

database.exec(`
  CREATE TABLE IF NOT EXISTS catalog_items (
    id INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    brand TEXT NOT NULL,
    size TEXT NOT NULL,
    price REAL NOT NULL,
    section TEXT NOT NULL,
    aisle INTEGER NOT NULL,
    category TEXT NOT NULL,
    image_url TEXT,
    source_url TEXT,
    imported_at TEXT NOT NULL
  )
`)

function sendJson(response, status, payload) {
  response.writeHead(status, { 'content-type': 'application/json; charset=utf-8', 'access-control-allow-origin': '*' })
  response.end(JSON.stringify(payload))
}

function catalogRows() {
  return database.prepare('SELECT * FROM catalog_items ORDER BY aisle, name').all()
}

async function importLocalSeed() {
  const seed = JSON.parse(await readFile(seedPath, 'utf8'))
  const insert = database.prepare(`
    INSERT OR REPLACE INTO catalog_items
    (id, name, brand, size, price, section, aisle, category, image_url, source_url, imported_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `)
  const importedAt = new Date().toISOString()
  database.exec('BEGIN')
  try {
    for (const product of seed) {
      insert.run(product.id, product.name, product.brand, product.size, product.price, product.section, product.aisle, product.category, product.imageUrl || null, product.sourceUrl || null, importedAt)
    }
    database.exec('COMMIT')
  } catch (error) {
    database.exec('ROLLBACK')
    throw error
  }
  return { count: seed.length, importedAt, source: 'local seed catalog' }
}

async function route(request, response) {
  if (request.method === 'GET' && request.url === '/api/catalog') {
    return sendJson(response, 200, { items: catalogRows(), imported: catalogRows().length > 0 })
  }

  if (request.method === 'POST' && request.url === '/api/catalog/import') {
    try {
      const result = await importLocalSeed()
      return sendJson(response, 200, { ...result, warning: 'This is the local prototype catalog. A complete live import requires an approved catalog feed from Aisle One.' })
    } catch (error) {
      return sendJson(response, 500, { error: error instanceof Error ? error.message : 'Catalog import failed' })
    }
  }

  if (request.method === 'GET' && request.url === '/api/catalog/status') {
    const row = database.prepare('SELECT COUNT(*) AS count, MAX(imported_at) AS importedAt FROM catalog_items').get()
    return sendJson(response, 200, row)
  }

  sendJson(response, 404, { error: 'Not found' })
}

const existingCatalog = database.prepare('SELECT COUNT(*) AS count FROM catalog_items').get()
if (existingCatalog.count === 0) await importLocalSeed()
createServer((request, response) => route(request, response).catch((error) => sendJson(response, 500, { error: error.message }))).listen(port, () => {
  console.log(`Shopcart Racer local catalog server: http://localhost:${port}`)
})
