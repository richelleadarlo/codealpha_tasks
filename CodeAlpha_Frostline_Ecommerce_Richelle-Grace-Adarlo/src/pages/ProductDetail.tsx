import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, ShoppingCart, Minus, Plus } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useCart } from '@/context/CartContext';
import { Button } from '@/components/ui/button';
import LoadingSpinner from '@/components/LoadingSpinner';
import type { Product } from '@/types';
import { toast } from 'sonner';

export default function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const { addToCart } = useCart();

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase.from('products').select('*').eq('id', id).single();
      setProduct(data as Product | null);
      setLoading(false);
    };
    fetch();
  }, [id]);

  if (loading) return <LoadingSpinner />;
  if (!product) return (
    <div className="mx-auto max-w-7xl px-4 py-20 text-center">
      <p className="text-lg text-muted-foreground">Product not found.</p>
      <Link to="/" className="mt-4 inline-block text-primary underline">Back to shop</Link>
    </div>
  );

  const handleAdd = () => {
    addToCart(product, quantity);
    toast.success(`${product.name} added to cart`);
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <Link to="/" className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Back to Products
      </Link>

      <div className="grid gap-8 md:grid-cols-2">
        <div className="overflow-hidden rounded-xl border bg-muted">
          <img src={product.image_url} alt={product.name} className="h-full w-full object-cover" />
        </div>

        <div className="flex flex-col justify-center">
          <span className="mb-2 inline-block w-fit rounded-full bg-secondary px-3 py-1 text-xs font-medium uppercase tracking-wider text-secondary-foreground">
            {product.category}
          </span>
          <h1 className="font-heading text-3xl font-bold text-foreground">{product.name}</h1>
          <p className="mt-4 text-muted-foreground leading-relaxed">{product.description}</p>

          <div className="mt-6 font-heading text-3xl font-bold text-foreground">${product.price.toFixed(2)}</div>

          <p className="mt-2 text-sm text-muted-foreground">
            {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
          </p>

          {product.stock > 0 && (
            <div className="mt-6 flex items-center gap-4">
              <div className="flex items-center rounded-lg border">
                <button onClick={() => setQuantity(q => Math.max(1, q - 1))} className="px-3 py-2 text-muted-foreground hover:text-foreground">
                  <Minus className="h-4 w-4" />
                </button>
                <span className="w-12 text-center font-medium text-foreground">{quantity}</span>
                <button onClick={() => setQuantity(q => Math.min(product.stock, q + 1))} className="px-3 py-2 text-muted-foreground hover:text-foreground">
                  <Plus className="h-4 w-4" />
                </button>
              </div>
              <Button onClick={handleAdd} className="gap-2">
                <ShoppingCart className="h-4 w-4" /> Add to Cart
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
