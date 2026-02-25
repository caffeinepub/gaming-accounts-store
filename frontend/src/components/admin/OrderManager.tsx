import React, { useState } from 'react';
import { Search, Package, Loader2, Clock, CheckCircle, XCircle, AlertTriangle, RefreshCw } from 'lucide-react';
import { useGetAllOrders } from '../../hooks/useQueries';
import { ApprovalStatus, PaymentMethod, type Order } from '../../backend';

function StatusBadge({ status }: { status: ApprovalStatus }) {
  const config = {
    [ApprovalStatus.pending]: { label: 'Pending', icon: Clock, color: 'text-yellow-400 bg-yellow-400/10' },
    [ApprovalStatus.approved]: { label: 'Approved', icon: CheckCircle, color: 'text-green-400 bg-green-400/10' },
    [ApprovalStatus.declined]: { label: 'Declined', icon: XCircle, color: 'text-red-400 bg-red-400/10' },
  };
  const { label, icon: Icon, color } = config[status] ?? { label: String(status), icon: Clock, color: 'text-muted-foreground bg-muted' };
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${color}`}>
      <Icon className="w-3 h-3" />
      {label}
    </span>
  );
}

function PaymentLabel({ method }: { method: PaymentMethod }) {
  const labels: Record<PaymentMethod, string> = {
    [PaymentMethod.paypal]: 'PayPal',
    [PaymentMethod.cryptocurrency]: 'Crypto',
    [PaymentMethod.ukGiftCard]: 'Gift Card',
    [PaymentMethod.payIn3Installments]: 'Pay in 3',
  };
  return <span>{labels[method] ?? String(method)}</span>;
}

export default function OrderManager() {
  const { data: orders = [], isLoading, isError, error, refetch, isFetching } = useGetAllOrders();
  const [search, setSearch] = useState('');

  const filtered = orders.filter((o: Order) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      o.buyerUsername.toLowerCase().includes(q) ||
      o.buyerEmail.toLowerCase().includes(q) ||
      o.buyerContact.toLowerCase().includes(q) ||
      o.productId.toString().includes(q)
    );
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
        <span className="ml-2 text-muted-foreground">Loading orders...</span>
      </div>
    );
  }

  if (isError) {
    const msg = error instanceof Error ? error.message : String(error);
    return (
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-foreground">Orders</h2>
        <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-6 text-center space-y-3">
          <AlertTriangle className="w-10 h-10 mx-auto text-destructive opacity-70" />
          <p className="text-sm font-medium text-destructive">Failed to load orders</p>
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
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-lg font-semibold text-foreground">Orders</h2>
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search orders..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-sm bg-muted/30 border border-border/50 rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => refetch()}
            disabled={isFetching}
            title="Refresh orders"
            className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/30 disabled:opacity-50 transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${isFetching ? 'animate-spin' : ''}`} />
          </button>
          <span className="text-sm text-muted-foreground whitespace-nowrap">{filtered.length} order{filtered.length !== 1 ? 's' : ''}</span>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <Package className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p>{search ? 'No orders match your search' : 'No orders yet'}</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-border/50">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border/50 bg-muted/30">
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Buyer</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Email</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Contact</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Product ID</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Payment</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((order: Order, index: number) => (
                <tr key={index} className="border-b border-border/30 hover:bg-muted/20 transition-colors">
                  <td className="px-4 py-3 font-medium text-foreground">{order.buyerUsername || '—'}</td>
                  <td className="px-4 py-3 text-muted-foreground">{order.buyerEmail || '—'}</td>
                  <td className="px-4 py-3 text-muted-foreground">{order.buyerContact || '—'}</td>
                  <td className="px-4 py-3 text-muted-foreground">#{order.productId.toString()}</td>
                  <td className="px-4 py-3"><PaymentLabel method={order.paymentMethod} /></td>
                  <td className="px-4 py-3"><StatusBadge status={order.approvalStatus} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
