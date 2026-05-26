# La Gauchada

E-commerce de mates artesanales. HTML + React via Babel standalone + Supabase.

## Setup local

1. Crear cuenta en https://supabase.com y un nuevo proyecto
2. SQL Editor → pegar y ejecutar `supabase/schema.sql`
3. Storage → New bucket → nombre: `product-images` → marcar como **público**
4. Authentication → Users → invitar al admin con email + password
5. Settings → API → copiar `URL` y `anon public key`
6. Copiar `config.example.js` a `config.js` y pegar las credenciales
7. Abrir `La Gauchada.html` con **Live Server** de VS Code

## Deploy en Netlify

1. Subir el proyecto a GitHub (`config.js` está en `.gitignore`, no se sube)
2. https://app.netlify.com → "Add new site" → conectar con GitHub o arrastrar la carpeta
3. En producción: subir `config.js` real por separado (drag & drop en el panel de Netlify, o usar variables de entorno con un `config.js` generado en build)

## Estructura

```
E-commerce/
├── La Gauchada.html      — entrypoint con CSS embebido
├── config.js             — credenciales Supabase (no se commitea)
├── config.example.js     — template de credenciales
├── data.jsx              — categorías + hook useProducts()
├── products.jsx          — catálogo y detalle de producto
├── app.jsx               — router principal
├── image-slot.js         — componente web para slots de imagen
├── pages/
│   ├── home.jsx          — home con hero
│   ├── cart-checkout.jsx — carrito y checkout WhatsApp
│   ├── about-contact.jsx — nosotros y contacto
│   └── curar.jsx         — guía para curar el mate
├── components/
│   ├── components.jsx    — Header, Footer, ProductCard, CartProvider, Router
│   └── tweaks-panel.jsx  — panel de ajustes visuales (dev)
├── admin/
│   └── admin.jsx         — login Supabase Auth + CRUD de productos + tabla de pedidos
└── supabase/
    └── schema.sql        — schema + RLS + seed de productos
```
