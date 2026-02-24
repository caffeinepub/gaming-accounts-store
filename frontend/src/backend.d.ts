import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface Order {
    status: string;
    paymentMethod: PaymentMethod;
    productId: bigint;
    buyer: Principal;
}
export interface ProductCategory {
    id: bigint;
    name: string;
    description: string;
}
export interface UserProfile {
    name: string;
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
    addCategory(name: string, description: string): Promise<bigint>;
    addOrder(productId: bigint, paymentMethod: PaymentMethod, status: string): Promise<bigint>;
    addProduct(gameName: string, categoryId: bigint, title: string, description: string, accountDetails: string, price: bigint, available: boolean): Promise<bigint>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    deleteCategory(id: bigint): Promise<void>;
    deleteProduct(id: bigint): Promise<void>;
    editCategory(id: bigint, name: string, description: string): Promise<void>;
    editProduct(id: bigint, gameName: string, categoryId: bigint, title: string, description: string, accountDetails: string, price: bigint, available: boolean): Promise<void>;
    getAllCategories(): Promise<Array<ProductCategory>>;
    getAvailableProducts(): Promise<Array<Product>>;
    getAvailableProductsByPrice(): Promise<Array<Product>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getCategoryById(id: bigint): Promise<ProductCategory>;
    getOrderById(id: bigint): Promise<Order>;
    getProductById(id: bigint): Promise<Product>;
    getUserOrders(user: Principal): Promise<Array<Order>>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
}
