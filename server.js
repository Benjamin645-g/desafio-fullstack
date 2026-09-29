const express = require('express');
const fs = require('fs');
const csv = require('csv-parser');
const cors = require('cors');

const app = express();
const PORT = 3000;

let products = [];

app.use(cors()); 
app.use('/assets', express.static('frontend/assets'));

fs.createReadStream('data/catalog.csv')
  .pipe(csv())
  .on('data', (row) => products.push(row))
  .on('end', () => {
    console.log('Catálogo cargado:', products.length, 'productos');
  });

app.get('/api/products', (req, res) => {
  const { search, category, page = 1, limit = 20 } = req.query;

  let filtered = products;

  if (search) {
    filtered = filtered.filter(p =>
      p.name?.toLowerCase().includes(search.toLowerCase())
    );
  }

  if (category) {
    filtered = filtered.filter(p =>
      p.category?.toLowerCase().includes(category.toLowerCase())
    );
  }

  const start = (page - 1) * limit;
  const end = start + parseInt(limit);

  const results = filtered.slice(start, end).map(p => ({
    ...p,
    imageUrl: p.image ? `/assets/${p.image}` : null
  }));

  res.json({
    total: filtered.length,
    page: parseInt(page),
    limit: parseInt(limit),
    results
  });
});

app.get('/api/products/:id', (req, res) => {
  const product = products.find(p => p.id === req.params.id);
  if (!product) {
    return res.status(404).json({ error: 'Producto no encontrado' });
  }

  res.json({
    ...product,
   imageUrl: p.image ? `/assets/${p.image}` : null

  });
});

app.get('/api/products/filters', (req, res) => {
  if (products.length === 0) {
    return res.json({ categories: [], formats: [] });
  }

  const categories = [...new Set(products.map(p => p.category?.split(' > ')[0]))];
  const formats = [...new Set(products.map(p => p.format))];

  res.json({ categories, formats });
});

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
