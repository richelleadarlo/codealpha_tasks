import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import LoadingSpinner from '@/components/LoadingSpinner';
import { Package } from 'lucide-react';
import type { Order } from '@/types';

const statusColor: Record<string, string> = {
  Pending: 'bg-yellow-100 text-yellow-800',
  Processing: 'bg-blue-100 text-blue-800',
  Shipped: 'bg-purple-100 text-purple-800',
  Delivered: 'bg-green-100 text-green-800',
};

export default function Orders() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const fetch = async () => {
      const { data } = await supabase
        .from('orders')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      setOrders((data as unknown as Order[]) ?? []);
      setLoading(false);
    };
    fetch();
  }, [user]);

  if (loading) return <LoadingSpinner message="Loading orders..." />;

  if (orders.length === 0) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-20 text-center">
        <Package className="mx-auto h-16 w-16 text-muted-foreground/40" />
        <h2 className="mt-4 font-heading text-2xl font-bold text-foreground">No orders yet</h2>
        <p className="mt-2 text-muted-foreground">Your order history will appear here.</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
      <h1 className="font-heading text-3xl font-bold text-foreground">Order History</h1>

      <div className="mt-8 space-y-4">
        {orders.map(order => (
          <div key={order.id} className="rounded-xl border bg-card p-6">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <p className="text-xs text-muted-foreground">Order #{order.id.slice(0, 8)}</p>
                <p className="text-xs text-muted-foreground">
                  {new Date(order.created_at).toLocaleDateString('en-US', {
                    year: 'numeric', month: 'long', day: 'numeric',
                  })}
                </p>
              </div>
              <span className={`rounded-full px-3 py-1 text-xs font-medium ${statusColor[order.status] || ''}`}>
                {order.status}
              </span>
            </div>

            <div className="mt-4 space-y-1">
              {order.items.map((item, i) => (
                <div key={i} className="flex justify-between text-sm">
                  <span className="text-foreground">{item.name} × {item.quantity}</span>
                  <span className="text-muted-foreground">${(item.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>

            <div className="mt-3 border-t pt-3 flex justify-between font-heading font-bold text-foreground">
              <span>Total</span>
              <span>${order.total_price.toFixed(2)}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
