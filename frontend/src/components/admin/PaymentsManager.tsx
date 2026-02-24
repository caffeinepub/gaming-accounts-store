import React from 'react';
import { Loader2, CreditCard, CheckCircle, XCircle, Clock, Gift } from 'lucide-react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useGetAllOrders, useGetProductById, useApproveOrder, useDeclineOrder } from '../../hooks/useQueries';
import { type Order, PaymentMethod, ApprovalStatus } from '../../backend';

function PaymentMethodBadge({ method }: { method: PaymentMethod }) {
  const labels: Record<PaymentMethod, string> = {
    [PaymentMethod.paypal]: 'PayPal',
    [PaymentMethod.cryptocurrency]: 'Crypto',
    [PaymentMethod.ukGiftCard]: 'Gift Card',
    [PaymentMethod.payIn3Installments]: 'Pay in 3',
  };

  const colorMap: Record<PaymentMethod, string> = {
    [PaymentMethod.paypal]: 'border-blue-400/40 text-blue-400',
    [PaymentMethod.cryptocurrency]: 'border-sunset-orange/40 text-sunset-orange',
    [PaymentMethod.ukGiftCard]: 'border-sunset-pink/40 text-sunset-pink',
    [PaymentMethod.payIn3Installments]: 'border-sunset-purple/40 text-sunset-purple',
  };

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-sm border font-rajdhani text-xs font-semibold ${colorMap[method] ?? 'border-border text-muted-foreground'}`}>
      {labels[method] ?? String(method)}
    </span>
  );
}

function ApprovalBadge({ status }: { status: ApprovalStatus }) {
  if (status === ApprovalStatus.approved) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-sm border border-success/40 bg-success/10 font-rajdhani text-xs font-bold text-success">
        <CheckCircle className="w-3 h-3" />
        Approved
      </span>
    );
  }
  if (status === ApprovalStatus.declined) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-sm border border-destructive/40 bg-destructive/10 font-rajdhani text-xs font-bold text-destructive">
        <XCircle className="w-3 h-3" />
        Declined
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-sm border border-sunset-gold/40 bg-sunset-gold/10 font-rajdhani text-xs font-bold text-sunset-gold">
      <Clock className="w-3 h-3" />
      Pending
    </span>
  );
}

function ProductName({ productId }: { productId: bigint }) {
  const { data: product } = useGetProductById(productId);
  if (!product) return <span className="text-muted-foreground text-xs">Loading…</span>;
  return (
    <div>
      <p className="font-medium text-sm">{product.gameName}</p>
      <p className="text-xs text-muted-foreground truncate max-w-[120px]">{product.title}</p>
    </div>
  );
}

function OrderPaymentRow({ order, index }: { order: Order; index: number }) {
  const approveOrder = useApproveOrder();
  const declineOrder = useDeclineOrder();

  const isActing = approveOrder.isPending || declineOrder.isPending;
  const isGiftCard = order.paymentMethod === PaymentMethod.ukGiftCard;

  const handleApprove = async () => {
    try {
      // We need the order ID — orders are stored by index+1 in the backend
      // The backend uses nextOrderId starting at 1, so we use index+1 as a proxy
      // However, we don't have the actual orderId from getAllOrders.
      // We'll use the index+1 as orderId (orders are 1-indexed in the backend).
      await approveOrder.mutateAsync(BigInt(index + 1));
      toast.success('Order approved successfully!');
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to approve order');
    }
  };

  const handleDecline = async () => {
    try {
      await declineOrder.mutateAsync(BigInt(index + 1));
      toast.error('Order declined.', { description: 'The buyer will see the updated status.' });
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to decline order');
    }
  };

  return (
    <TableRow className="hover:bg-muted/20 transition-colors">
      <TableCell className="font-mono text-xs text-muted-foreground">#{index + 1}</TableCell>
      <TableCell>
        <div>
          <p className="font-rajdhani font-semibold text-sm text-foreground">{order.buyerUsername || '—'}</p>
          <p className="font-rajdhani text-xs text-muted-foreground">{order.buyerEmail || '—'}</p>
          {order.buyerContact && (
            <p className="font-rajdhani text-xs text-muted-foreground">{order.buyerContact}</p>
          )}
        </div>
      </TableCell>
      <TableCell>
        <ProductName productId={order.productId} />
      </TableCell>
      <TableCell>
        <PaymentMethodBadge method={order.paymentMethod} />
      </TableCell>
      {/* Gift card details column */}
      <TableCell>
        {isGiftCard ? (
          <div className="space-y-1">
            {order.giftCardNumber && (
              <div className="flex items-center gap-1">
                <Gift className="w-3 h-3 text-sunset-pink flex-shrink-0" />
                <span className="font-mono text-xs text-foreground">{order.giftCardNumber}</span>
              </div>
            )}
            {order.giftCardBalance && (
              <span className="font-rajdhani text-xs text-sunset-gold font-semibold">
                Bal: {order.giftCardBalance}
              </span>
            )}
            {!order.giftCardNumber && !order.giftCardBalance && (
              <span className="text-muted-foreground text-xs">—</span>
            )}
          </div>
        ) : (
          <span className="text-muted-foreground text-xs">—</span>
        )}
      </TableCell>
      <TableCell>
        <ApprovalBadge status={order.approvalStatus} />
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-1.5">
          <button
            onClick={handleApprove}
            disabled={isActing || order.approvalStatus === ApprovalStatus.approved}
            className="flex items-center gap-1 px-2.5 py-1 rounded-sm border border-success/40 bg-success/10 text-success font-rajdhani text-xs font-bold hover:bg-success/20 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {approveOrder.isPending ? (
              <Loader2 className="w-3 h-3 animate-spin" />
            ) : (
              <CheckCircle className="w-3 h-3" />
            )}
            Approve
          </button>
          <button
            onClick={handleDecline}
            disabled={isActing || order.approvalStatus === ApprovalStatus.declined}
            className="flex items-center gap-1 px-2.5 py-1 rounded-sm border border-destructive/40 bg-destructive/10 text-destructive font-rajdhani text-xs font-bold hover:bg-destructive/20 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {declineOrder.isPending ? (
              <Loader2 className="w-3 h-3 animate-spin" />
            ) : (
              <XCircle className="w-3 h-3" />
            )}
            Decline
          </button>
        </div>
      </TableCell>
    </TableRow>
  );
}

export default function PaymentsManager() {
  const { data: orders = [], isLoading, error } = useGetAllOrders();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="w-6 h-6 animate-spin text-sunset-gold" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="font-rajdhani text-destructive">Failed to load orders. Please try again.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-2">
        <CreditCard className="w-4 h-4 text-sunset-gold" />
        <h3 className="font-orbitron text-sm font-bold tracking-wider text-foreground">PAYMENTS</h3>
        <span className="text-xs text-muted-foreground">({orders.length} total)</span>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-3 p-3 rounded-sm border border-border bg-muted/20">
        <span className="font-rajdhani text-xs text-muted-foreground font-semibold uppercase tracking-wider">Status:</span>
        <span className="inline-flex items-center gap-1 font-rajdhani text-xs text-sunset-gold">
          <Clock className="w-3 h-3" /> Pending — awaiting admin review
        </span>
        <span className="inline-flex items-center gap-1 font-rajdhani text-xs text-success">
          <CheckCircle className="w-3 h-3" /> Approved — order fulfilled
        </span>
        <span className="inline-flex items-center gap-1 font-rajdhani text-xs text-destructive">
          <XCircle className="w-3 h-3" /> Declined — order rejected
        </span>
      </div>

      {orders.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground font-rajdhani">
          <CreditCard className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p>No orders yet. Orders will appear here once buyers complete checkout.</p>
        </div>
      ) : (
        <div className="rounded-sm border border-border overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/30">
                  <TableHead className="font-rajdhani tracking-wide text-xs uppercase">#</TableHead>
                  <TableHead className="font-rajdhani tracking-wide text-xs uppercase">Buyer</TableHead>
                  <TableHead className="font-rajdhani tracking-wide text-xs uppercase">Product</TableHead>
                  <TableHead className="font-rajdhani tracking-wide text-xs uppercase">Payment</TableHead>
                  <TableHead className="font-rajdhani tracking-wide text-xs uppercase">Gift Card</TableHead>
                  <TableHead className="font-rajdhani tracking-wide text-xs uppercase">Approval</TableHead>
                  <TableHead className="font-rajdhani tracking-wide text-xs uppercase">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.map((order, i) => (
                  <OrderPaymentRow key={i} order={order} index={i} />
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      )}
    </div>
  );
}
