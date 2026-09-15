# shopcart-racer

A private, mobile-first prototype for building an Aisle One shopping list organized by store route.

## What is included

- Local catalog data for prototyping, with no live scraping or storefront login.
- Search by product, brand, category, or section.
- Category filters and quantity controls.
- Shopping list grouped and sorted by aisle.
- Current shopping list saved locally in the browser, with a New list reset action.
- Print-friendly list view and a link back to the official store.

## Run locally

```bash
npm install
npm run server
npm run dev
```

The catalog database is stored at `data/shopcart-racer.sqlite`. The current import button loads the local seed catalog. A complete live import should use a permissioned data feed from Aisle One rather than automated scraping; the storefront currently blocks direct server requests.
