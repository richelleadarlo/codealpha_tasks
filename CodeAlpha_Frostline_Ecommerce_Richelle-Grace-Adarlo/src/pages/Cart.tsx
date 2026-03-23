import { Link } from 'react-router-dom';
import { Trash2, Minus, Plus, ShoppingBag } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { Button } from '@/components/ui/button';

export default function Cart() {
  const { items, removeFromCart, updateQuantity, totalPrice } = useCart();

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-20 text-center">
        <ShoppingBag className="mx-auto h-16 w-16 text-muted-foreground/40" />
        <h2 className="mt-4 font-heading text-2xl font-bold text-foreground">Your cart is empty</h2>
        <p className="mt-2 text-muted-foreground">Start shopping to add items to your cart.</p>
        <Link to="/">
          <Button className="mt-6">Browse Products</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
      <h1 className="font-heading text-3xl font-bold text-foreground">Shopping Cart</h1>

      <div className="mt-8 space-y-4">
        {items.map(({ product, quantity }) => (
          <div key={product.id} className="flex gap-4 rounded-xl border bg-card p-4">
            <img src={product.image_url} alt={product.name} className="h-24 w-24 rounded-lg object-cover" />
            <div className="flex flex-1 flex-col justify-between">
              <div>
                <h3 className="font-heading font-semibold text-foreground">{product.name}</h3>
                <p className="text-sm text-muted-foreground">${product.price.toFixed(2)} each</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center rounded-lg border">
                  <button onClick={() => updateQuantity(product.id, quantity - 1)} className="px-2 py-1 text-muted-foreground hover:text-foreground">
                    <Minus className="h-3.5 w-3.5" />
                  </button>
                  <span className="w-8 text-center text-sm font-medium">{quantity}</span>
                  <button onClick={() => updateQuantity(product.id, quantity + 1)} className="px-2 py-1 text-muted-foreground hover:text-foreground">
                    <Plus className="h-3.5 w-3.5" />
                  </button>
                </div>
                <button onClick={() => removeFromCart(product.id)} className="text-destructive hover:text-destructive/80">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
            <div className="flex items-center font-heading font-bold text-foreground">
              ${(product.price * quantity).toFixed(2)}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 rounded-xl border bg-card p-6">
        <div className="flex items-center justify-between">
          <span className="text-lg font-medium text-foreground">Total</span>
          <span className="font-heading text-2xl font-bold text-foreground">${totalPrice.toFixed(2)}</span>
        </div>
        <Link to="/checkout">
          <Button className="mt-4 w-full" size="lg">Proceed to Checkout</Button>
        </Link>
      </div>
    </div>
  );
}
