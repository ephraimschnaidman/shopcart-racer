import { useEffect, useMemo, useState } from 'react'

type Product = {
  id: number
  name: string
  brand: string
  size: string
  price: number
  section: string
  aisle: number
  category: string
  tone: string
  mark: string
}

type Cart = Record<number, number>

const products: Product[] = [
  { id: 1, name: 'Chocolate Babka', brand: 'Babkatoure', size: '24 oz', price: 28.79, section: 'Bakery', aisle: 1, category: 'Bakery', tone: 'cocoa', mark: 'B' },
  { id: 2, name: 'Cinnamon Babka', brand: 'Babkatoure', size: '24 oz', price: 28.79, section: 'Bakery', aisle: 1, category: 'Bakery', tone: 'honey', mark: 'C' },
  { id: 3, name: 'Challah, Classic', brand: 'Aisle One', size: '16 oz', price: 6.49, section: 'Bakery', aisle: 1, category: 'Bakery', tone: 'wheat', mark: 'C' },
  { id: 4, name: 'Standing Rib Roast', brand: "Solomon's", size: '5 lb', price: 35.99, section: 'Fresh meat', aisle: 2, category: 'Meat', tone: 'rose', mark: 'R' },
  { id: 5, name: 'First Cut Brisket', brand: "Solomon's", size: '2.45 lb', price: 19.99, section: 'Fresh meat', aisle: 2, category: 'Meat', tone: 'brick', mark: 'B' },
  { id: 6, name: 'Chicken & Turkey Cutlets', brand: 'KJ Poultry', size: '21 oz', price: 14.99, section: 'Fresh meat', aisle: 2, category: 'Meat', tone: 'peach', mark: 'KJ' },
  { id: 7, name: 'Osem Chicken Soup Mix', brand: 'Osem', size: '1.9 oz', price: 3.49, section: 'Pantry', aisle: 3, category: 'Pantry', tone: 'lemon', mark: 'O' },
  { id: 8, name: 'Gefilte Fish, Original', brand: 'Rokeach', size: '24 oz', price: 8.99, section: 'Pantry', aisle: 3, category: 'Pantry', tone: 'sea', mark: 'R' },
  { id: 9, name: 'Extra Virgin Olive Oil', brand: 'Tuscanini', size: '33.8 fl oz', price: 14.49, section: 'Pantry', aisle: 3, category: 'Pantry', tone: 'sage', mark: 'T' },
  { id: 10, name: 'Black Tea Bags', brand: 'Wissotzky', size: '20 ct', price: 5.99, section: 'Pantry', aisle: 3, category: 'Pantry', tone: 'ink', mark: 'W' },
  { id: 11, name: 'Assorted Cookie Platter', brand: 'Chewzy', size: '32 oz', price: 15.79, section: 'Sweets', aisle: 4, category: 'Sweets', tone: 'berry', mark: 'C' },
  { id: 12, name: 'Medjool Dates with Almond', brand: 'Dorrel', size: '7.5 oz', price: 14.49, section: 'Sweets', aisle: 4, category: 'Sweets', tone: 'plum', mark: 'D' },
  { id: 13, name: 'Chocolate Coins', brand: 'Elite', size: '3.5 oz', price: 4.99, section: 'Sweets', aisle: 4, category: 'Sweets', tone: 'gold', mark: 'E' },
  { id: 14, name: 'Sparkling Water, Lime', brand: 'Aqua Panna', size: '6 x 1 L', price: 8.99, section: 'Drinks', aisle: 5, category: 'Drinks', tone: 'mint', mark: 'A' },
  { id: 15, name: 'Grape Juice', brand: 'Kedem', size: '64 fl oz', price: 7.49, section: 'Drinks', aisle: 5, category: 'Drinks', tone: 'grape', mark: 'K' },
  { id: 16, name: 'Ginger Ale', brand: 'Dr. Brown\'s', size: '2 L', price: 3.99, section: 'Drinks', aisle: 5, category: 'Drinks', tone: 'ginger', mark: 'D' },
  { id: 17, name: 'Shredded Mozzarella', brand: 'Cholov Yisroel', size: '8 oz', price: 6.99, section: 'Chilled', aisle: 6, category: 'Chilled', tone: 'cream', mark: 'M' },
  { id: 18, name: 'Sour Cream', brand: 'Tnuva', size: '16 oz', price: 4.49, section: 'Chilled', aisle: 6, category: 'Chilled', tone: 'sky', mark: 'T' },
  { id: 19, name: 'Salted Butter', brand: 'Meadow', size: '4 sticks', price: 7.99, section: 'Chilled', aisle: 6, category: 'Chilled', tone: 'butter', mark: 'M' },
  { id: 20, name: 'Frozen Potato Knishes', brand: 'Mrs. Adler\'s', size: '13 oz', price: 8.49, section: 'Frozen', aisle: 7, category: 'Frozen', tone: 'blue', mark: 'M' },
]

const categories = ['All', 'Bakery', 'Meat', 'Pantry', 'Sweets', 'Drinks', 'Chilled', 'Frozen']
const aisleNames: Record<number, string> = {
  1: 'Bakery counter',
  2: 'Fresh meat',
  3: 'Pantry staples',
  4: 'Sweets & treats',
  5: 'Drinks',
  6: 'Chilled',
  7: 'Frozen',
}
const listStorageKey = 'shopcart-racer.current-list'
const starterCart: Cart = { 4: 1, 7: 1, 14: 2 }

function formatPrice(price: number) {
  return `$${price.toFixed(2)}`
}

function readSavedCart(): Cart {
  try {
    const savedList = window.localStorage.getItem(listStorageKey)
    return savedList ? JSON.parse(savedList) as Cart : starterCart
  } catch {
    return starterCart
  }
}

function catalogProduct(product: Product & { image_url?: string; source_url?: string }) {
  return { ...product, tone: product.tone || 'sage', mark: product.mark || product.brand.slice(0, 2).toUpperCase() }
}

function App() {
  const [catalog, setCatalog] = useState<Product[]>(products)
  const [query, setQuery] = useState('')
  const [activeCategory, setActiveCategory] = useState('All')
  const [cart, setCart] = useState<Cart>(readSavedCart)
  const [showList, setShowList] = useState(false)
  const [importing, setImporting] = useState(false)
  const [importMessage, setImportMessage] = useState('')

  useEffect(() => {
    fetch('/api/catalog')
      .then((response) => response.ok ? response.json() : Promise.reject(new Error('Local catalog server unavailable')))
      .then((data: { items: (Product & { image_url?: string; source_url?: string })[] }) => {
        if (data.items.length) setCatalog(data.items.map(catalogProduct))
      })
      .catch(() => setImportMessage('Start the local catalog server to use SQLite.'))
  }, [])

  useEffect(() => {
    window.localStorage.setItem(listStorageKey, JSON.stringify(cart))
  }, [cart])

  const filteredProducts = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase()
    return catalog.filter((product) => {
      const matchesCategory = activeCategory === 'All' || product.category === activeCategory
      const matchesQuery = !normalizedQuery || [product.name, product.brand, product.category, product.section].some((value) => value.toLowerCase().includes(normalizedQuery))
      return matchesCategory && matchesQuery
    })
  }, [activeCategory, catalog, query])

  const listProducts = useMemo(() => catalog.filter((product) => cart[product.id]).sort((a, b) => a.aisle - b.aisle || a.name.localeCompare(b.name)), [cart, catalog])
  const itemCount = Object.values(cart).reduce((total, quantity) => total + quantity, 0)
  const subtotal = listProducts.reduce((total, product) => total + product.price * cart[product.id], 0)

  function updateQuantity(productId: number, change: number) {
    setCart((current) => {
      const nextQuantity = (current[productId] || 0) + change
      if (nextQuantity <= 0) {
        const { [productId]: _, ...rest } = current
        return rest
      }
      return { ...current, [productId]: nextQuantity }
    })
  }

  function startNewList() {
    if (itemCount && !window.confirm('Start a new list? Your current list will be cleared.')) return
    setCart({})
    setShowList(true)
  }

  async function importCatalog() {
    setImporting(true)
    setImportMessage('Importing catalog into SQLite...')
    try {
      const response = await fetch('/api/catalog/import', { method: 'POST' })
      const result = await response.json() as { count?: number; warning?: string; error?: string }
      if (!response.ok) throw new Error(result.error || 'Catalog import failed')
      const catalogResponse = await fetch('/api/catalog')
      const data = await catalogResponse.json() as { items: (Product & { image_url?: string; source_url?: string })[] }
      setCatalog(data.items.map(catalogProduct))
      setImportMessage(`${result.count} items stored in SQLite. ${result.warning || ''}`)
    } catch (error) {
      setImportMessage(error instanceof Error ? error.message : 'Catalog import failed')
    } finally {
      setImporting(false)
    }
  }

  return (
    <main className="app-shell">
      <header className="topbar">
        <a className="wordmark" href="#top" aria-label="Shopcart Racer home">
          <span className="wordmark-dot" />
          <span>Shopcart <em>Racer</em></span>
        </a>
        <div className="header-actions">
          <span className="private-badge"><span className="status-dot" /> Private prototype</span>
          <button className="new-list-button" type="button" onClick={startNewList}>+ New list</button>
          <button className="list-button" type="button" onClick={() => setShowList(!showList)} aria-expanded={showList}>
            <span className="list-icon">=</span>
            <span>My list</span>
            <strong>{itemCount}</strong>
          </button>
        </div>
      </header>

      <section className="intro" id="top">
        <div className="intro-copy">
          <p className="eyebrow">Your store walk, organized</p>
          <h1>Shop the aisles<br /><span>with a plan.</span></h1>
          <p className="intro-text">Find what you need, add it once, and your list will line up in the order you walk the store.</p>
        </div>
        <div className="route-map" aria-label="Aisle route from bakery to frozen">
          <div className="map-line" />
          <span className="map-stop stop-one">01</span>
          <span className="map-stop stop-two">03</span>
          <span className="map-stop stop-three">07</span>
          <span className="map-label label-one">Bake</span>
          <span className="map-label label-two">Pantry</span>
          <span className="map-label label-three">Frozen</span>
        </div>
      </section>

      <div className="notice"><span className="notice-mark">i</span><span>Catalog and shopping lists are stored locally in this browser. Availability and prices may change.</span><a href="https://shop.aisleonekosher.com/" target="_blank" rel="noreferrer">Visit store <span aria-hidden="true">-&gt;</span></a></div>

      <section className="workspace">
        <div className="catalog-column">
          <div className="catalog-heading">
            <div>
              <p className="section-kicker">Browse catalog</p>
              <h2>What are you picking up?</h2>
            </div>
            <div className="catalog-tools"><span className="result-count">{filteredProducts.length} items</span><button className="import-button" type="button" onClick={importCatalog} disabled={importing}>{importing ? 'Importing...' : 'Import catalog'}</button></div>
          </div>
          {importMessage && <p className="import-message">{importMessage}</p>}
          <label className="search-field">
            <span className="search-mark">/</span>
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search by item, brand, or section" aria-label="Search products" />
            {query && <button type="button" className="clear-search" onClick={() => setQuery('')} aria-label="Clear search">x</button>}
          </label>
          <div className="category-row" role="tablist" aria-label="Product categories">
            {categories.map((category) => <button key={category} type="button" role="tab" aria-selected={activeCategory === category} className={activeCategory === category ? 'category active' : 'category'} onClick={() => setActiveCategory(category)}>{category}</button>)}
          </div>
          <div className="product-grid">
            {filteredProducts.map((product) => {
              const quantity = cart[product.id] || 0
              return <article className="product-card" key={product.id}>
                <div className={`product-art ${product.tone}`}><span>{product.mark}</span><small>{product.category}</small></div>
                <div className="product-info"><p className="product-section">Aisle {product.aisle} <span>/</span> {product.section}</p><h3>{product.name}</h3><p className="product-meta">{product.brand} <span>·</span> {product.size}</p><div className="product-bottom"><strong>{formatPrice(product.price)}</strong>{quantity ? <div className="stepper"><button type="button" onClick={() => updateQuantity(product.id, -1)} aria-label={`Remove one ${product.name}`}>-</button><span>{quantity}</span><button type="button" onClick={() => updateQuantity(product.id, 1)} aria-label={`Add one ${product.name}`}>+</button></div> : <button className="add-button" type="button" onClick={() => updateQuantity(product.id, 1)}><span>+</span> Add</button>}</div></div>
              </article>
            })}
          </div>
          {!filteredProducts.length && <div className="empty-state"><strong>No items found</strong><span>Try a different search or category.</span></div>}
        </div>

        <aside className={showList ? 'list-column mobile-visible' : 'list-column'}>
          <div className="list-header"><div><p className="section-kicker">Your route</p><h2>Shopping list</h2></div><span className="route-total">{itemCount} {itemCount === 1 ? 'item' : 'items'}</span></div>
          {listProducts.length ? <div className="route-list">{Array.from(new Set(listProducts.map((product) => product.aisle))).map((aisle) => <div className="aisle-group" key={aisle}><div className="aisle-heading"><span className="aisle-number">0{aisle}</span><span>{aisleNames[aisle]}</span></div>{listProducts.filter((product) => product.aisle === aisle).map((product) => <div className="list-item" key={product.id}><button className="check-button" type="button" onClick={() => updateQuantity(product.id, -cart[product.id])} aria-label={`Remove ${product.name} from list`} /> <div><strong>{product.name}</strong><span>{product.brand} · {product.size}</span></div><div className="list-quantity"><button type="button" onClick={() => updateQuantity(product.id, -1)} aria-label={`Decrease ${product.name}`}>-</button><b>{cart[product.id]}</b><button type="button" onClick={() => updateQuantity(product.id, 1)} aria-label={`Increase ${product.name}`}>+</button></div></div>)}</div>)}</div> : <div className="list-empty"><span className="empty-basket">+</span><strong>Your list is clear</strong><span>Add products from the catalog and they will sort here by aisle.</span></div>}
          <div className="list-footer"><div><span>Estimated subtotal</span><strong>{formatPrice(subtotal)}</strong></div><button className="print-button" type="button" onClick={() => window.print()}>Print list <span>-&gt;</span></button></div>
        </aside>
      </section>
      <footer><span>Built for a calmer store run.</span><span>Catalog last curated Sep 2026</span></footer>
    </main>
  )
}

export default App
