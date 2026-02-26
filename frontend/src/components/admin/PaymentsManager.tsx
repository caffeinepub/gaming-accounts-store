import React from 'react';
import { CheckCircle, XCircle, Clock, Loader2, CreditCard, Gift, Coins, Calendar, AlertTriangle, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { useGetAllOrders, useApproveOrder, useDeclineOrder } from '../../hooks/useQueries';
import { useAdminSession } from '../../contexts/AdminSessionContext';
import { OrderApprovalStatus, PaymentMethod, type Order } from '../../backend';

function PaymentMethodBadge({ method }: { method: PaymentMethod }) {
  const config = {
    [PaymentMethod.paypal]: { label: 'PayPal', icon: CreditCard, color: 'text-blue-400 bg-blue-400/10' },
    [PaymentMethod.cryptocurrency]: { label: 'Crypto', icon: Coins, color: 'text-yellow-400 bg-yellow-400/10' },
    [PaymentMethod.ukGiftCard]: { label: 'Gift Card', icon: Gift, color: 'text-pink-400 bg-pink-400/10' },
    [PaymentMethod.payIn3Installments]: { label: 'Pay in 3', icon: Calendar, color: 'text-purple-400 bg-purple-400/10' },
  };
  const { label, icon: Icon, color } = config[method] ?? { label: String(method), icon: CreditCard, color: 'text-muted-foreground bg-muted' };
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${color}`}>
      <Icon className="w-3 h-3" />
      {label}
    </span>
  );
}

function StatusBadge({ status }: { status: OrderApprovalStatus }) {
  const config = {
    [OrderApprovalStatus.pending]: { label: 'Pending', icon: Clock, color: 'text-yellow-400 bg-yellow-400/10' },
    [OrderApprovalStatus.approved]: { label: 'Approved', icon: CheckCircle, color: 'text-green-400 bg-green-400/10' },
    [OrderApprovalStatus.declined]: { label: 'Declined', icon: XCircle, color: 'text-red-400 bg-red-400/10' },
  };
  const { label, icon: Icon, color } = config[status] ?? { label: String(status), icon: Clock, color: 'text-muted-foreground bg-muted' };
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${color}`}>
      <Icon className="w-3 h-3" />
      {label}
    </span>
  );
}

interface OrderRowProps {
  order: Order;
  orderId: bigint;
}

function OrderRow({ order, orderId }: OrderRowProps) {
  const approveOrder = useApproveOrder();
  const declineOrder = useDeclineOrder();

  const handleApprove = async () => {
    try {
      await approveOrder.mutateAsync(orderId);
      toast.success('Order approved successfully');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to approve order');
    }
  };

  const handleDecline = async () => {
    try {
      await declineOrder.mutateAsync(orderId);
      toast.success('Order declined');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to decline order');
    }
  };

  const isActing = approveOrder.isPending || declineOrder.isPending;

  return (
    <tr className="border-b border-border/30 hover:bg-muted/20 transition-colors">
      <td className="px-4 py-3">
        <div className="font-medium text-foreground">{order.buyerUsername || '—'}</div>
        <div className="text-xs text-muted-foreground">{order.buyerEmail || '—'}</div>
        {order.buyerContact && <div className="text-xs text-muted-foreground">{order.buyerContact}</div>}
      </td>
      <td className="px-4 py-3 text-sm text-muted-foreground">#{order.productId.toString()}</td>
      <td className="px-4 py-3">
        <PaymentMethodBadge method={order.paymentMethod} />
        {order.paymentMethod === PaymentMethod.ukGiftCard && (
          <div className="mt-1 text-xs text-muted-foreground space-y-0.5">
            {order.giftCardNumber && <div>Card #: {order.giftCardNumber}</div>}
            {order.giftCardBalance && <div>Balance: {order.giftCardBalance}</div>}
          </div>
        )}
      </td>
      <td className="px-4 py-3">
        <StatusBadge status={order.approvalStatus} />
      </td>
      <td className="px-4 py-3">
        {order.approvalStatus === OrderApprovalStatus.pending ? (
          <div className="flex gap-2">
            <button
              onClick={handleApprove}
              disabled={isActing}
              className="inline-flex items-center gap-1 px-3 py-1 rounded text-xs font-medium bg-green-500/20 text-green-400 hover:bg-green-500/30 disabled:opacity-50 transition-colors"
            >
              {approveOrder.isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : <CheckCircle className="w-3 h-3" />}
              Approve
            </button>
            <button
              onClick={handleDecline}
              disabled={isActing}
              className="inline-flex items-center gap-1 px-3 py-1 rounded text-xs font-medium bg-red-500/20 text-red-400 hover:bg-red-500/30 disabled:opacity-50 transition-colors"
            >
              {declineOrder.isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : <XCircle className="w-3 h-3" />}
              Decline
            </button>
          </div>
        ) : (
          <span className="text-xs text-muted-foreground">No action needed</span>
        )}
      </td>
    </tr>
  );
}

export default function PaymentsManager() {
  const { adminVerified } = useAdminSession();
  const { data: orders = [], isLoading, isError, error, refetch, isFetching } = useGetAllOrders(adminVerified);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
        <span className="ml-2 text-muted-foreground">Loading payments...</span>
      </div>
    );
  }

  if (isError) {
    const msg = error instanceof Error ? error.message : String(error);
    return (
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-foreground">Payments & Approvals</h2>
        <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-6 text-center space-y-3">
          <AlertTriangle className="w-10 h-10 mx-auto text-destructive opacity-70" />
          <p className="text-sm font-medium text-destructive">Failed to load payments</p>
          <p className="text-xs text-muted-foreground max-w-sm mx-auto">{msg}</p>
          <button
            onClick={() => refetch()}
            disabled={isFetching}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 disabled:opacity-50 transition-opacity"
          >
            {isFetching ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-foreground">Payments & Approvals</h2>
        <div className="flex items-center gap-2">
          <button
            onClick={() => refetch()}
            disabled={isFetching}
            title="Refresh payments"
            className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/30 disabled:opacity-50 transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${isFetching ? 'animate-spin' : ''}`} />
          </button>
          <span className="text-sm text-muted-foreground">{orders.length} order{orders.length !== 1 ? 's' : ''}</span>
        </div>
      </div>

      {orders.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <CreditCard className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p>No orders yet</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-border/50">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border/50 bg-muted/30">
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Buyer</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Product</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Payment</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Status</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order: Order, index: number) => (
                <OrderRow key={index} order={order} orderId={BigInt(index + 1)} />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
