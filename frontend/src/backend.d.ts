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
    approvalStatus: OrderApprovalStatus;
    buyerContact: string;
    buyer: Principal;
}
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
export enum OrderApprovalStatus {
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
    addCategory(name: string, description: string): Promise<{
        __kind__: "ok";
        ok: null;
    } | {
        __kind__: "err";
        err: string;
    }>;
    addProduct(gameName: string, categoryId: bigint, title: string, description: string, accountDetails: string, price: bigint, available: boolean): Promise<{
        __kind__: "ok";
        ok: null;
    } | {
        __kind__: "err";
        err: string;
    }>;
    approveOrder(orderId: bigint): Promise<{
        __kind__: "ok";
        ok: null;
    } | {
        __kind__: "err";
        err: string;
    }>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    createSubscriptionTier(name: string, monthlyPrice: number, yearlyPrice: number, perks: Array<string>, freeTrialEnabled: boolean): Promise<{
        __kind__: "ok";
        ok: SubscriptionTier;
    } | {
        __kind__: "err";
        err: string;
    }>;
    createUsername(username: string): Promise<void>;
    declineOrder(orderId: bigint): Promise<{
        __kind__: "ok";
        ok: null;
    } | {
        __kind__: "err";
        err: string;
    }>;
    deleteCategory(id: bigint): Promise<{
        __kind__: "ok";
        ok: null;
    } | {
        __kind__: "err";
        err: string;
    }>;
    deleteProduct(id: bigint): Promise<{
        __kind__: "ok";
        ok: null;
    } | {
        __kind__: "err";
        err: string;
    }>;
    deleteSubscriptionTier(id: bigint): Promise<{
        __kind__: "ok";
        ok: null;
    } | {
        __kind__: "err";
        err: string;
    }>;
    getAllCategories(): Promise<Array<ProductCategory>>;
    getAllOrders(): Promise<Array<Order>>;
    getAvailableProducts(): Promise<Array<Product>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getCategoryById(id: bigint): Promise<ProductCategory>;
    getOrderById(id: bigint): Promise<Order>;
    getOrders(): Promise<Array<Order>>;
    getOrdersByBuyer(principal: Principal): Promise<Array<Order>>;
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
    placeOrder(buyerPrincipal: Principal, username: string, email: string, contactInfo: string, productId: bigint, paymentMethod: PaymentMethod, giftCardNumber: string, giftCardBalance: string): Promise<{
        __kind__: "ok";
        ok: null;
    } | {
        __kind__: "err";
        err: string;
    }>;
    removeAdminUser(username: string): Promise<void>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    setSubscriptionTierFreeTrial(id: bigint, enabled: boolean): Promise<{
        __kind__: "ok";
        ok: null;
    } | {
        __kind__: "err";
        err: string;
    }>;
    updateBitcoinWalletAddress(address: string): Promise<{
        __kind__: "ok";
        ok: null;
    } | {
        __kind__: "err";
        err: string;
    }>;
    updateCategory(id: bigint, name: string, description: string): Promise<{
        __kind__: "ok";
        ok: null;
    } | {
        __kind__: "err";
        err: string;
    }>;
    updateEthereumWalletAddress(address: string): Promise<{
        __kind__: "ok";
        ok: null;
    } | {
        __kind__: "err";
        err: string;
    }>;
    updatePaypalWalletAddress(address: string): Promise<{
        __kind__: "ok";
        ok: null;
    } | {
        __kind__: "err";
        err: string;
    }>;
    updateProduct(id: bigint, gameName: string, categoryId: bigint, title: string, description: string, accountDetails: string, price: bigint, available: boolean): Promise<{
        __kind__: "ok";
        ok: null;
    } | {
        __kind__: "err";
        err: string;
    }>;
    updateSubscriptionTierPrices(id: bigint, monthlyPrice: number, yearlyPrice: number): Promise<{
        __kind__: "ok";
        ok: null;
    } | {
        __kind__: "err";
        err: string;
    }>;
}
