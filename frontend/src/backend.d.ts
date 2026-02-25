import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface SubscriptionTier {
    id: bigint;
    freeTrialEnabled: boolean;
    name: string;
    yearlyPrice: number;
    monthlyPrice: number;
    perks: Array<string>;
}
export interface Order {
    status: string;
    buyerEmail: string;
    paymentMethod: PaymentMethod;
    giftCardBalance: string;
    giftCardNumber: string;
    productId: bigint;
    buyerUsername: string;
    approvalStatus: ApprovalStatus;
    buyerContact: string;
    buyer: Principal;
}
export type Result = {
    __kind__: "ok";
    ok: null;
} | {
    __kind__: "err";
    err: string;
};
export interface StoreSettings {
    bitcoinWalletAddress: string;
    paypalWalletAddress: string;
    ethereumWalletAddress: string;
}
export interface ProductCategory {
    id: bigint;
    name: string;
    description: string;
}
export interface Product {
    id: bigint;
    categoryId: bigint;
    title: string;
    description: string;
    available: boolean;
    gameName: string;
    price: bigint;
    accountDetails: string;
}
export interface UserProfile {
    contact: string;
    username: string;
    email: string;
}
export enum ApprovalStatus {
    pending = "pending",
    approved = "approved",
    declined = "declined"
}
export enum PaymentMethod {
    cryptocurrency = "cryptocurrency",
    payIn3Installments = "payIn3Installments",
    ukGiftCard = "ukGiftCard",
    paypal = "paypal"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    addAdminUser(username: string): Promise<void>;
    addCategory(name: string, description: string): Promise<Result>;
    addProduct(gameName: string, categoryId: bigint, title: string, description: string, accountDetails: string, price: bigint, available: boolean): Promise<Result>;
    approveOrder(orderId: bigint): Promise<{
        __kind__: "ok";
        ok: null;
    } | {
        __kind__: "err";
        err: string;
    }>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    createUsername(username: string): Promise<void>;
    declineOrder(orderId: bigint): Promise<{
        __kind__: "ok";
        ok: null;
    } | {
        __kind__: "err";
        err: string;
    }>;
    deleteCategory(id: bigint): Promise<Result>;
    deleteProduct(id: bigint): Promise<Result>;
    getAdminPinLockoutStatus(principal: Principal): Promise<{
        remainingSeconds: bigint;
        isLockedOut: boolean;
    }>;
    getAllCategories(): Promise<Array<ProductCategory>>;
    getAllOrders(): Promise<Array<Order>>;
    getAvailableProducts(): Promise<Array<Product>>;
    getAvailableProductsByPrice(): Promise<Array<Product>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getCategoryById(id: bigint): Promise<ProductCategory>;
    getOrderById(id: bigint): Promise<Order>;
    getOrders(): Promise<Array<Order>>;
    getOrdersByBuyer(principal: Principal): Promise<Array<Order>>;
    getOrdersByUsername(username: string): Promise<Array<Order>>;
    getProductById(id: bigint): Promise<Product>;
    getStoreSettings(): Promise<StoreSettings>;
    getSubscriptionTiers(): Promise<Array<SubscriptionTier>>;
    getUserOrders(user: Principal): Promise<Array<Order>>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    getUsernameByPrincipal(user: Principal): Promise<string | null>;
    hasUsername(user: Principal): Promise<boolean>;
    isAdminUsername(username: string): Promise<boolean>;
    isCallerAdmin(): Promise<boolean>;
    isUsernameAvailable(username: string): Promise<boolean>;
    placeOrder(buyerPrincipal: Principal, username: string, email: string, contactInfo: string, productId: bigint, paymentMethod: PaymentMethod, giftCardNumber: string, giftCardBalance: string): Promise<Result>;
    removeAdminUser(username: string): Promise<void>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    setSubscriptionTierFreeTrial(id: bigint, enabled: boolean): Promise<Result>;
    updateBitcoinWalletAddress(address: string): Promise<Result>;
    updateCategory(id: bigint, name: string, description: string): Promise<Result>;
    updateEthereumWalletAddress(address: string): Promise<Result>;
    updatePaypalWalletAddress(address: string): Promise<Result>;
    updateProduct(id: bigint, gameName: string, categoryId: bigint, title: string, description: string, accountDetails: string, price: bigint, available: boolean): Promise<Result>;
    updateSubscriptionTierPrices(id: bigint, monthlyPrice: number, yearlyPrice: number): Promise<Result>;
    verifyAdminPin(pin: string): Promise<{
        __kind__: "ok";
        ok: boolean;
    } | {
        __kind__: "err";
        err: string;
    }>;
}
