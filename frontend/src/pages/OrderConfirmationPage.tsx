import React from 'react';
import { CheckCircle, Package, ArrowRight, Loader2, AlertCircle, Clock, ThumbsUp, ThumbsDown } from 'lucide-react';
import { useGetOrderById, useGetProductById } from '../hooks/useQueries';
import { PaymentMethod, ApprovalStatus } from '../backend';

interface OrderConfirmationPageProps {
  orderId: bigint;
  onContinueShopping: () => void;
}

const paymentMethodLabels: Record<string, string> = {
  [PaymentMethod.paypal]: 'PayPal',
  [PaymentMethod.cryptocurrency]: 'Cryptocurrency',
  [PaymentMethod.ukGiftCard]: 'UK Gift Card',
  [PaymentMethod.payIn3Installments]: 'Pay in 3',
};

function ProductDetails({ productId }: { productId: bigint }) {
  const { data: product, isLoading } = useGetProductById(productId);

  if (isLoading) return <Loader2 className="w-4 h-4 animate-spin text-sunset-gold" />;
  if (!product) return null;

  return (
    <div className="p-3 rounded-sm border border-border bg-background">
      <p className="font-orbitron text-sm font-bold text-foreground">{product.gameName}</p>
      <p className="font-rajdhani text-xs text-muted-foreground mt-0.5">{product.title}</p>
      <p className="font-orbitron text-sm font-bold text-sunset-gold mt-1">
        £{(Number(product.price) / 100).toFixed(2)}
      </p>
    </div>
  );
}

function ApprovalStatusBadge({ status }: { status: ApprovalStatus }) {
  if (status === ApprovalStatus.approved) {
    return (
      <div className="flex items-center gap-2 px-3 py-1.5 rounded-sm bg-success/10 border border-success/30 w-fit">
        <ThumbsUp className="w-3.5 h-3.5 text-success" />
        <span className="font-rajdhani text-sm font-bold text-success">Approved</span>
      </div>
    );
  }
  if (status === ApprovalStatus.declined) {
    return (
      <div className="flex items-center gap-2 px-3 py-1.5 rounded-sm bg-destructive/10 border border-destructive/30 w-fit">
        <ThumbsDown className="w-3.5 h-3.5 text-destructive" />
        <span className="font-rajdhani text-sm font-bold text-destructive">Declined</span>
      </div>
    );
  }
  // pending
  return (
    <div className="flex items-center gap-2 px-3 py-1.5 rounded-sm bg-sunset-gold/10 border border-sunset-gold/30 w-fit">
      <Clock className="w-3.5 h-3.5 text-sunset-gold" />
      <span className="font-rajdhani text-sm font-bold text-sunset-gold">Pending Review</span>
    </div>
  );
}

export default function OrderConfirmationPage({ orderId, onContinueShopping }: OrderConfirmationPageProps) {
  // Refetch every 30 seconds so the buyer sees live approval status updates
  const { data: order, isLoading, error } = useGetOrderById(orderId, 30_000);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-sunset-gold" />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-3">
        <AlertCircle className="w-10 h-10 text-destructive" />
        <p className="font-rajdhani text-muted-foreground">Failed to load order details.</p>
        <button
          onClick={onContinueShopping}
          className="px-4 py-2 rounded-sm bg-gradient-to-r from-sunset-orange to-sunset-pink text-white font-rajdhani font-semibold hover:opacity-90 transition-all"
        >
          Return to Store
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Success header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-full bg-success/10 border border-success/30 flex items-center justify-center mx-auto mb-4 sunset-glow-sm">
            <CheckCircle className="w-8 h-8 text-success" />
          </div>
          <h1 className="font-orbitron text-2xl font-black text-foreground mb-2">Order Confirmed!</h1>
          <p className="font-rajdhani text-muted-foreground">
            Order #{orderId.toString()} has been placed successfully.
          </p>
        </div>

        {/* Order Status Card */}
        <div className="rounded-sm border border-border bg-card overflow-hidden mb-6">
          <div className="h-1 w-full bg-gradient-to-r from-sunset-gold via-sunset-orange to-sunset-pink" />
          <div className="p-5">
            <div className="flex items-center gap-2 mb-3">
              <Clock className="w-4 h-4 text-sunset-gold" />
              <h2 className="font-orbitron text-sm font-bold text-sunset-gold uppercase tracking-wider">
                Order Status
              </h2>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-rajdhani text-sm text-muted-foreground mb-2">
                  Your order is being reviewed by our team. Status updates automatically every 30 seconds.
                </p>
                <ApprovalStatusBadge status={order.approvalStatus} />
              </div>
            </div>
            {order.approvalStatus === ApprovalStatus.declined && (
              <div className="mt-3 p-3 rounded-sm bg-destructive/5 border border-destructive/20">
                <p className="font-rajdhani text-sm text-destructive">
                  Your order has been declined. Please contact support for assistance or try a different payment method.
                </p>
              </div>
            )}
            {order.approvalStatus === ApprovalStatus.approved && (
              <div className="mt-3 p-3 rounded-sm bg-success/5 border border-success/20">
                <p className="font-rajdhani text-sm text-success">
                  Your order has been approved! Your account credentials will be delivered to your email shortly.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Order details card */}
        <div className="rounded-sm border border-border bg-card overflow-hidden mb-6">
          <div className="h-1 w-full bg-gradient-to-r from-sunset-orange via-sunset-pink to-sunset-purple" />
          <div className="p-6 space-y-5">
            {/* Product */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Package className="w-4 h-4 text-sunset-orange" />
                <h2 className="font-orbitron text-sm font-bold text-sunset-orange uppercase tracking-wider">
                  Product
                </h2>
              </div>
              <ProductDetails productId={order.productId} />
            </div>

            {/* Buyer info */}
            <div className="pt-4 border-t border-border">
              <h2 className="font-orbitron text-sm font-bold text-sunset-gold uppercase tracking-wider mb-3">
                Order Details
              </h2>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="font-rajdhani text-sm text-muted-foreground">Username</span>
                  <span className="font-rajdhani text-sm font-semibold text-foreground">{order.buyerUsername}</span>
                </div>
                {order.buyerEmail && (
                  <div className="flex justify-between">
                    <span className="font-rajdhani text-sm text-muted-foreground">Email</span>
                    <span className="font-rajdhani text-sm font-semibold text-foreground">{order.buyerEmail}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="font-rajdhani text-sm text-muted-foreground">Payment</span>
                  <span className="font-rajdhani text-sm font-semibold text-foreground">
                    {paymentMethodLabels[order.paymentMethod] ?? order.paymentMethod}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="font-rajdhani text-sm text-muted-foreground">Status</span>
                  <span className="font-rajdhani text-sm font-semibold text-success capitalize">{order.status}</span>
                </div>
                {/* Gift card details if applicable */}
                {order.paymentMethod === PaymentMethod.ukGiftCard && order.giftCardNumber && (
                  <div className="flex justify-between">
                    <span className="font-rajdhani text-sm text-muted-foreground">Gift Card #</span>
                    <span className="font-mono text-sm font-semibold text-foreground">
                      {order.giftCardNumber}
                    </span>
                  </div>
                )}
                {order.paymentMethod === PaymentMethod.ukGiftCard && order.giftCardBalance && (
                  <div className="flex justify-between">
                    <span className="font-rajdhani text-sm text-muted-foreground">Card Balance</span>
                    <span className="font-rajdhani text-sm font-semibold text-foreground">
                      {order.giftCardBalance}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Next steps */}
        {order.approvalStatus !== ApprovalStatus.declined && (
          <div className="rounded-sm border border-border bg-card p-5 mb-6">
            <h2 className="font-orbitron text-sm font-bold text-sunset-gold uppercase tracking-wider mb-3">
              Next Steps
            </h2>
            <ul className="space-y-2">
              {[
                'Your account credentials will be delivered to your email once approved.',
                "Check your spam folder if you don't receive an email within 10 minutes.",
                'Contact support if you have any issues with your order.',
              ].map((s, i) => (
                <li key={i} className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-sunset-gold mt-1.5 shrink-0" />
                  <span className="font-rajdhani text-sm text-muted-foreground">{s}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        <button
          onClick={onContinueShopping}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-sm bg-gradient-to-r from-sunset-orange to-sunset-pink text-white font-rajdhani font-bold tracking-wider uppercase hover:opacity-90 transition-all sunset-glow"
        >
          Continue Shopping
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
