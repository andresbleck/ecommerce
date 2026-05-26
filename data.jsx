const CATEGORIES = [
  { id: 'mates', label: 'Mates', desc: 'Calabaza, algarrobo, cuero' },
  { id: 'bombillas', label: 'Bombillas', desc: 'Alpaca, acero, pico de rey' },
  { id: 'termos', label: 'Termos', desc: 'Conservan el agua, conservan la ronda' },
];

const formatPrice = (n) =>
  '$' + (n || 0).toLocaleString('es-AR', { minimumFractionDigits: 0 });

function useProducts() {
  const [products, setProducts] = React.useState([]);
  const [loading, setLoading] = React.useState(true);

  const reload = React.useCallback(async () => {
    setLoading(true);
    const { data, error } = await sb.from('products').select('*').order('created_at', { ascending: false });
    if (!error) {
      setProducts((data || []).map(p => ({
        id: p.slug,
        _dbId: p.id,
        name: p.name,
        category: p.category,
        price: p.price,
        stock: p.stock,
        short: p.short_description,
        long: p.long_description,
        badge: p.badge,
        monogram: p.monogram,
        accent: p.accent_color,
        image_url: p.image_url,
        image_url_2: p.image_url_2,
        image_url_3: p.image_url_3,
      })));
    }
    setLoading(false);
  }, []);

  React.useEffect(() => { reload(); }, [reload]);
  return { products, loading, reload };
}

window.CATEGORIES = CATEGORIES;
window.formatPrice = formatPrice;
window.useProducts = useProducts;
