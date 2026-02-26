import React from 'react';
import { CheckCircle, Package, ArrowRight, Loader2, AlertCircle, Clock, ThumbsUp, ThumbsDown } from 'lucide-react';
import { useGetOrderById, useGetProductById } from '../hooks/useQueries';
import { PaymentMethod, OrderApprovalStatus } from '../backend';

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

function ApprovalStatusBadge({ status }: { status: OrderApprovalStatus }) {
  if (status === OrderApprovalStatus.approved) {
    return (
      <div className="flex items-center gap-2 px-3 py-1.5 rounded-sm bg-success/10 border border-success/30 w-fit">
        <ThumbsUp className="w-3.5 h-3.5 text-success" />
        <span className="font-rajdhani text-sm font-bold text-success">Approved</span>
      </div>
    );
  }
  if (status === OrderApprovalStatus.declined) {
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

// Generic success screen shown when orderId is 0n (sentinel: order placed but ID unknown)
function GenericSuccessScreen({ onContinueShopping }: { onContinueShopping: () => void }) {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-full bg-success/10 border border-success/30 flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-success" />
          </div>
          <h1 className="font-orbitron text-2xl font-bold text-foreground mb-2">Order Placed!</h1>
          <p className="font-rajdhani text-muted-foreground">
            Your order has been submitted successfully. Our team will review it shortly.
          </p>
        </div>

        <div className="p-6 rounded-sm border border-border bg-card space-y-4 mb-8">
          <div className="flex items-center gap-2 text-sunset-gold">
            <Clock className="w-4 h-4" />
            <span className="font-rajdhani font-semibold text-sm">What happens next?</span>
          </div>
          <ul className="space-y-2 font-rajdhani text-sm text-muted-foreground">
            <li className="flex items-start gap-2">
              <span className="text-sunset-gold mt-0.5">1.</span>
              Our admin team will review your payment details.
            </li>
            <li className="flex items-start gap-2">
              <span className="text-sunset-gold mt-0.5">2.</span>
              Once approved, your account details will be delivered.
            </li>
            <li className="flex items-start gap-2">
              <span className="text-sunset-gold mt-0.5">3.</span>
              You'll be able to track your order status here.
            </li>
          </ul>
        </div>

        <div className="text-center">
          <button
            onClick={onContinueShopping}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-sm bg-gradient-to-r from-sunset-orange to-sunset-gold text-dusk-bg font-orbitron font-bold text-sm tracking-wider hover:opacity-90 transition-opacity"
          >
            Continue Shopping
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

export default function OrderConfirmationPage({ orderId, onContinueShopping }: OrderConfirmationPageProps) {
  // Sentinel: 0n means order was placed but we don't have a real ID to poll
  if (orderId === 0n) {
    return <GenericSuccessScreen onContinueShopping={onContinueShopping} />;
  }

  return <OrderStatusPoller orderId={orderId} onContinueShopping={onContinueShopping} />;
}

function OrderStatusPoller({ orderId, onContinueShopping }: OrderConfirmationPageProps) {
  const { data: order, isLoading, isError } = useGetOrderById(orderId);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-3">
          <Loader2 className="w-8 h-8 animate-spin text-sunset-gold mx-auto" />
          <p className="font-rajdhani text-muted-foreground">Loading your order...</p>
        </div>
      </div>
    );
  }

  if (isError || !order) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="text-center space-y-4 max-w-sm">
          <AlertCircle className="w-10 h-10 text-destructive mx-auto" />
          <p className="font-orbitron text-foreground font-bold">Order Not Found</p>
          <p className="font-rajdhani text-muted-foreground text-sm">
            We couldn't load your order details. It may still be processing.
          </p>
          <button
            onClick={onContinueShopping}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-sm bg-gradient-to-r from-sunset-orange to-sunset-gold text-dusk-bg font-orbitron font-bold text-sm tracking-wider hover:opacity-90 transition-opacity"
          >
            Back to Store
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-full bg-success/10 border border-success/30 flex items-center justify-center mx-auto mb-4">
            <Package className="w-8 h-8 text-success" />
          </div>
          <h1 className="font-orbitron text-2xl font-bold text-foreground mb-2">Order Confirmed</h1>
          <p className="font-rajdhani text-muted-foreground">
            Order #{orderId.toString()} — updates every 10 seconds
          </p>
        </div>

        {/* Status */}
        <div className="p-5 rounded-sm border border-border bg-card space-y-4 mb-6">
          <div className="flex items-center justify-between">
            <span className="font-rajdhani text-sm text-muted-foreground font-semibold uppercase tracking-wider">
              Approval Status
            </span>
            <ApprovalStatusBadge status={order.approvalStatus} />
          </div>

          <div className="flex items-center justify-between">
            <span className="font-rajdhani text-sm text-muted-foreground font-semibold uppercase tracking-wider">
              Payment Method
            </span>
            <span className="font-rajdhani text-sm text-foreground">
              {paymentMethodLabels[order.paymentMethod] ?? String(order.paymentMethod)}
            </span>
          </div>

          {order.buyerUsername && (
            <div className="flex items-center justify-between">
              <span className="font-rajdhani text-sm text-muted-foreground font-semibold uppercase tracking-wider">
                Buyer
              </span>
              <span className="font-rajdhani text-sm text-foreground">{order.buyerUsername}</span>
            </div>
          )}
        </div>

        {/* Product */}
        <div className="mb-8">
          <p className="font-rajdhani text-xs text-muted-foreground uppercase tracking-wider mb-2">Product</p>
          <ProductDetails productId={order.productId} />
        </div>

        {/* Approved: show account details */}
        {order.approvalStatus === OrderApprovalStatus.approved && (
          <div className="p-5 rounded-sm border border-success/30 bg-success/5 mb-6">
            <p className="font-orbitron text-sm font-bold text-success mb-2">✓ Order Approved</p>
            <p className="font-rajdhani text-sm text-muted-foreground">
              Your order has been approved. Please check your contact details for delivery information.
            </p>
          </div>
        )}

        {/* Declined */}
        {order.approvalStatus === OrderApprovalStatus.declined && (
          <div className="p-5 rounded-sm border border-destructive/30 bg-destructive/5 mb-6">
            <p className="font-orbitron text-sm font-bold text-destructive mb-2">✗ Order Declined</p>
            <p className="font-rajdhani text-sm text-muted-foreground">
              Unfortunately your order was declined. Please contact support or try again.
            </p>
          </div>
        )}

        <div className="text-center">
          <button
            onClick={onContinueShopping}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-sm bg-gradient-to-r from-sunset-orange to-sunset-gold text-dusk-bg font-orbitron font-bold text-sm tracking-wider hover:opacity-90 transition-opacity"
          >
            Continue Shopping
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
