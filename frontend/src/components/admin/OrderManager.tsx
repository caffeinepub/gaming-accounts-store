import React from 'react';
import { Loader2, Package } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useGetAllOrders, useGetProductById } from '../../hooks/useQueries';
import { type Order, PaymentMethod } from '../../backend';

function PaymentMethodBadge({ method }: { method: PaymentMethod }) {
  const labels: Record<PaymentMethod, string> = {
    [PaymentMethod.paypal]: 'PayPal',
    [PaymentMethod.cryptocurrency]: 'Crypto',
    [PaymentMethod.ukGiftCard]: 'Gift Card',
    [PaymentMethod.payIn3Installments]: 'Pay in 3',
  };
  return (
    <Badge variant="outline" className="font-rajdhani text-xs">
      {labels[method] ?? String(method)}
    </Badge>
  );
}

function OrderRow({ order, index }: { order: Order; index: number }) {
  const { data: product } = useGetProductById(order.productId);

  return (
    <TableRow>
      <TableCell className="font-mono text-xs text-muted-foreground">#{index + 1}</TableCell>
      <TableCell className="font-medium">{order.buyerUsername}</TableCell>
      <TableCell className="text-sm text-muted-foreground">{order.buyerEmail || '—'}</TableCell>
      <TableCell className="text-sm text-muted-foreground">{order.buyerContact || '—'}</TableCell>
      <TableCell className="text-sm">
        {product ? (
          <div>
            <p className="font-medium">{product.gameName}</p>
            <p className="text-xs text-muted-foreground truncate max-w-[150px]">{product.title}</p>
          </div>
        ) : (
          <span className="text-muted-foreground">Loading...</span>
        )}
      </TableCell>
      <TableCell>
        <PaymentMethodBadge method={order.paymentMethod} />
      </TableCell>
      <TableCell>
        <Badge variant={order.status === 'completed' ? 'default' : 'secondary'} className="font-rajdhani text-xs">
          {order.status}
        </Badge>
      </TableCell>
    </TableRow>
  );
}

export default function OrderManager() {
  const { data: orders = [], isLoading } = useGetAllOrders();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Package className="w-4 h-4 text-primary" />
        <h3 className="font-orbitron text-sm font-bold tracking-wider">ORDERS</h3>
        <span className="text-xs text-muted-foreground">({orders.length} total)</span>
      </div>

      {orders.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground font-rajdhani">
          No orders yet.
        </div>
      ) : (
        <div className="rounded-lg border border-border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="font-rajdhani tracking-wide">#</TableHead>
                <TableHead className="font-rajdhani tracking-wide">Username</TableHead>
                <TableHead className="font-rajdhani tracking-wide">Email</TableHead>
                <TableHead className="font-rajdhani tracking-wide">Contact</TableHead>
                <TableHead className="font-rajdhani tracking-wide">Product</TableHead>
                <TableHead className="font-rajdhani tracking-wide">Payment</TableHead>
                <TableHead className="font-rajdhani tracking-wide">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.map((order, i) => (
                <OrderRow key={i} order={order} index={i} />
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
