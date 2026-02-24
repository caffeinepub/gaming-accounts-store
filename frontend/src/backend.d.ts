import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
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
export type Result = {
    __kind__: "ok";
    ok: null;
} | {
    __kind__: "err";
    err: string;
};
export interface Order {
    status: string;
    buyerEmail: string;
    paymentMethod: PaymentMethod;
    productId: bigint;
    buyerUsername: string;
    buyerContact: string;
    buyer: Principal;
}
export interface ProductCategory {
    id: bigint;
    name: string;
    description: string;
}
export interface UserProfile {
    contact: string;
    username: string;
    email: string;
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
    addOrder(productId: bigint, paymentMethod: PaymentMethod, status: string): Promise<bigint>;
    addProduct(gameName: string, categoryId: bigint, title: string, description: string, accountDetails: string, price: bigint, available: boolean): Promise<Result>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    createUsername(username: string): Promise<void>;
    deleteCategory(id: bigint): Promise<Result>;
    deleteProduct(id: bigint): Promise<Result>;
    getAllCategories(): Promise<Array<ProductCategory>>;
    getAllOrders(): Promise<Array<Order>>;
    getAvailableProducts(): Promise<Array<Product>>;
    getAvailableProductsByPrice(): Promise<Array<Product>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getCategoryById(id: bigint): Promise<ProductCategory>;
    getOrderById(id: bigint): Promise<Order>;
    getOrdersByUsername(username: string): Promise<Array<Order>>;
    getProductById(id: bigint): Promise<Product>;
    getUserOrders(user: Principal): Promise<Array<Order>>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    getUsernameByPrincipal(user: Principal): Promise<string | null>;
    hasUsername(user: Principal): Promise<boolean>;
    isAdminUsername(username: string): Promise<boolean>;
    isCallerAdmin(): Promise<boolean>;
    isUsernameAvailable(username: string): Promise<boolean>;
    removeAdminUser(username: string): Promise<void>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    updateCategory(id: bigint, name: string, description: string): Promise<Result>;
    updateProduct(id: bigint, gameName: string, categoryId: bigint, title: string, description: string, accountDetails: string, price: bigint, available: boolean): Promise<Result>;
}
