import { Link } from 'react-router-dom';
import { ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCart } from '@/context/CartContext';
import type { Product } from '@/types';
import { toast } from 'sonner';

export default function ProductCard({ product }: { product: Product }) {
  const { addToCart } = useCart();

  const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    addToCart(product);
    toast.success(`${product.name} added to cart`);
  };

  return (
    <Link
      to={`/product/${product.id}`}
      className="group block overflow-hidden rounded-xl border border-white/20 bg-white/10 shadow-lg backdrop-blur-md card-hover"
    >
      <div className="aspect-[4/3] overflow-hidden bg-white/5">
        <img
          src={product.image_url}
          alt={product.name}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          loading="lazy"
        />
      </div>
      <div className="p-4">
        <span className="mb-1 inline-block rounded-full bg-accent/20 px-2.5 py-0.5 text-[11px] font-medium uppercase tracking-wider text-accent">
          {product.category}
        </span>
        <h3 className="mt-1 font-heading text-base font-semibold text-white line-clamp-1">
          {product.name}
        </h3>
        <p className="mt-1 text-xs text-white/60 line-clamp-2">{product.description}</p>
        <div className="mt-3 flex items-center justify-between">
          <span className="font-heading text-lg font-bold text-white">${product.price.toFixed(2)}</span>
          <Button size="sm" onClick={handleAdd} className="gap-1.5">
            <ShoppingCart className="h-3.5 w-3.5" /> Add
          </Button>
        </div>
      </div>
    </Link>
  );
}
