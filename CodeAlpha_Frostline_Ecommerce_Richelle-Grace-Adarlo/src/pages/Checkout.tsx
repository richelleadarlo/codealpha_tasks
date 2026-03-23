import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import type { OrderItem, ShippingAddress } from '@/types';

export default function Checkout() {
  const { items, totalPrice, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'credit_card' | 'cash_on_delivery'>('credit_card');
  const [address, setAddress] = useState<ShippingAddress>({
    fullName: '', address: '', city: '', postalCode: '', country: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || items.length === 0) return;

    const missing = Object.entries(address).find(([, v]) => !v.trim());
    if (missing) {
      toast.error('Please fill in all shipping fields');
      return;
    }

    setLoading(true);
    const orderItems: OrderItem[] = items.map(i => ({
      productId: i.product.id,
      name: i.product.name,
      price: i.product.price,
      quantity: i.quantity,
    }));

    const { error } = await supabase.from('orders').insert({
      user_id: user.id,
      items: orderItems as any,
      shipping_address: address as any,
      payment_method: paymentMethod,
      total_price: totalPrice,
    });

    setLoading(false);
    if (error) {
      toast.error('Failed to place order');
      return;
    }
    clearCart();
    toast.success('Order placed successfully!');
    navigate('/orders');
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
      <h1 className="font-heading text-3xl font-bold text-foreground">Checkout</h1>

      <form onSubmit={handleSubmit} className="mt-8 space-y-8">
        {/* Order Summary */}
        <div className="rounded-xl border bg-card p-6">
          <h2 className="font-heading text-lg font-semibold text-foreground">Order Summary</h2>
          <div className="mt-4 space-y-2">
            {items.map(({ product, quantity }) => (
              <div key={product.id} className="flex justify-between text-sm">
                <span className="text-foreground">{product.name} × {quantity}</span>
                <span className="font-medium text-foreground">${(product.price * quantity).toFixed(2)}</span>
              </div>
            ))}
            <div className="border-t pt-2 mt-2 flex justify-between font-heading font-bold text-foreground">
              <span>Total</span>
              <span>${totalPrice.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Shipping */}
        <div className="rounded-xl border bg-card p-6">
          <h2 className="font-heading text-lg font-semibold text-foreground mb-4">Shipping Address</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {([
              ['fullName', 'Full Name', 'col-span-full'],
              ['address', 'Address', 'col-span-full'],
              ['city', 'City', ''],
              ['postalCode', 'Postal Code', ''],
              ['country', 'Country', 'col-span-full'],
            ] as const).map(([key, label, span]) => (
              <div key={key} className={`sm:${span}`}>
                <label className="mb-1 block text-sm font-medium text-foreground">{label}</label>
                <input
                  type="text"
                  required
                  value={address[key]}
                  onChange={e => setAddress(prev => ({ ...prev, [key]: e.target.value }))}
                  className="w-full rounded-lg border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Payment */}
        <div className="rounded-xl border bg-card p-6">
          <h2 className="font-heading text-lg font-semibold text-foreground mb-4">Payment Method</h2>
          <div className="flex gap-3">
            {([['credit_card', 'Credit Card'], ['cash_on_delivery', 'Cash on Delivery']] as const).map(([val, label]) => (
              <button
                key={val}
                type="button"
                onClick={() => setPaymentMethod(val)}
                className={`rounded-lg border px-4 py-2 text-sm font-medium transition-colors ${
                  paymentMethod === val
                    ? 'border-primary bg-primary text-primary-foreground'
                    : 'border-border bg-card text-foreground hover:bg-secondary'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        <Button type="submit" size="lg" className="w-full" disabled={loading || items.length === 0}>
          {loading ? 'Placing Order...' : 'Place Order'}
        </Button>
      </form>
    </div>
  );
}
