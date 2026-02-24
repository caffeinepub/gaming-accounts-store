import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import { Principal } from '@dfinity/principal';
import { PaymentMethod, ApprovalStatus, type UserProfile, type Product, type ProductCategory, type Order, type Result, type SubscriptionTier, type StoreSettings } from '../backend';

// ── User Profile ──────────────────────────────────────────────────────────────

export function useGetCallerUserProfile() {
  const { actor, isFetching: actorFetching } = useActor();

  const query = useQuery<UserProfile | null>({
    queryKey: ['currentUserProfile'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getCallerUserProfile();
    },
    enabled: !!actor && !actorFetching,
    retry: false,
    staleTime: 60_000,
  });

  return {
    ...query,
    isLoading: actorFetching || query.isLoading,
    isFetched: !!actor && query.isFetched,
  };
}

export function useSaveCallerUserProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation<void, Error, UserProfile>({
    mutationFn: async (profile: UserProfile) => {
      if (!actor) throw new Error('Actor not available');
      await actor.saveCallerUserProfile(profile);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
      queryClient.invalidateQueries({ queryKey: ['usernameByPrincipal'] });
    },
  });
}

// ── Username ──────────────────────────────────────────────────────────────────

export function useCreateUsername() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation<void, Error, string>({
    mutationFn: async (username: string) => {
      if (!actor) throw new Error('Actor not available');
      await actor.createUsername(username);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
      queryClient.invalidateQueries({ queryKey: ['hasUsername'] });
      queryClient.invalidateQueries({ queryKey: ['usernameByPrincipal'] });
    },
  });
}

export function useIsUsernameAvailable(username: string) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<boolean>({
    queryKey: ['usernameAvailable', username],
    queryFn: async () => {
      if (!actor) return false;
      return actor.isUsernameAvailable(username);
    },
    enabled: !!actor && !actorFetching && username.length > 0,
  });
}

/**
 * Fetches the username for a given principal using the public (no-auth) query.
 * Returns a custom state object that properly reflects actor loading state.
 * When the actor is still initialising, isLoading=true and isFetched=false.
 * When the actor is ready and the query has resolved, isFetched=true.
 */
export function useGetUsernameByPrincipal(principalStr: string | undefined) {
  const { actor, isFetching: actorFetching } = useActor();

  // Only fire the query when the actor is ready AND we have a principal to look up.
  const isEnabled = !!actor && !actorFetching && !!principalStr && principalStr.length > 0;

  const query = useQuery<string | null>({
    queryKey: ['usernameByPrincipal', principalStr],
    queryFn: async () => {
      if (!actor || !principalStr) return null;
      try {
        const principal = Principal.fromText(principalStr);
        const result = await actor.getUsernameByPrincipal(principal);
        return result ?? null;
      } catch {
        return null;
      }
    },
    enabled: isEnabled,
    staleTime: 60_000,
    retry: 1,
  });

  // While the actor is still loading, treat as loading (not yet fetched).
  // Once the actor is ready, delegate to the query's own state.
  const isLoading = actorFetching || (isEnabled && query.isLoading);
  const isFetched = !actorFetching && isEnabled && query.isFetched;

  return {
    ...query,
    isLoading,
    isFetched,
  };
}

// ── Categories ────────────────────────────────────────────────────────────────

export function useGetAllCategories() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<ProductCategory[]>({
    queryKey: ['categories'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllCategories();
    },
    enabled: !!actor && !actorFetching,
  });
}

function unwrapResult(result: Result): void {
  if (result.__kind__ === 'err') {
    throw new Error(result.err);
  }
}

// ── Products ──────────────────────────────────────────────────────────────────

export function useGetAvailableProducts() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<Product[]>({
    queryKey: ['availableProducts'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAvailableProducts();
    },
    enabled: !!actor && !actorFetching,
  });
}

export function useGetAllProductsAdmin() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<Product[]>({
    queryKey: ['products'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAvailableProducts();
    },
    enabled: !!actor && !actorFetching,
  });
}

export function useGetProductById(id: bigint | undefined) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<Product>({
    queryKey: ['product', id?.toString()],
    queryFn: async () => {
      if (!actor || id === undefined) throw new Error('Actor or ID not available');
      return actor.getProductById(id);
    },
    enabled: !!actor && !actorFetching && id !== undefined,
  });
}

interface AddProductVars {
  gameName: string;
  title: string;
  description: string;
  accountDetails: string;
  price: bigint;
  available: boolean;
}

export function useAddProduct() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation<void, Error, AddProductVars>({
    mutationFn: async ({ gameName, title, description, accountDetails, price, available }) => {
      if (!actor) throw new Error('Actor not available');
      const result = await actor.addProduct(gameName, 0n, title, description, accountDetails, price, available);
      unwrapResult(result);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['availableProducts'] });
    },
  });
}

interface UpdateProductVars {
  id: bigint;
  gameName: string;
  title: string;
  description: string;
  accountDetails: string;
  price: bigint;
  available: boolean;
}

export function useUpdateProduct() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation<void, Error, UpdateProductVars>({
    mutationFn: async ({ id, gameName, title, description, accountDetails, price, available }) => {
      if (!actor) throw new Error('Actor not available');
      const result = await actor.updateProduct(id, gameName, 0n, title, description, accountDetails, price, available);
      unwrapResult(result);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['availableProducts'] });
    },
  });
}

export function useDeleteProduct() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation<void, Error, bigint>({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error('Actor not available');
      const result = await actor.deleteProduct(id);
      unwrapResult(result);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['availableProducts'] });
    },
  });
}

// ── Orders ────────────────────────────────────────────────────────────────────

interface PlaceOrderVars {
  productId: bigint;
  paymentMethod: PaymentMethod;
  status: string;
  giftCardNumber?: string;
  giftCardBalance?: string;
}

export function usePlaceOrder() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation<bigint, Error, PlaceOrderVars>({
    mutationFn: async ({ productId, paymentMethod, status, giftCardNumber = '', giftCardBalance = '' }) => {
      if (!actor) throw new Error('Actor not available');
      const orderId = await actor.addOrder(
        productId,
        paymentMethod,
        status,
        ApprovalStatus.pending,
        giftCardNumber,
        giftCardBalance,
      );
      return orderId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
  });
}

export function useGetAllOrders() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<Order[]>({
    queryKey: ['orders'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllOrders();
    },
    enabled: !!actor && !actorFetching,
  });
}

export function useGetOrderById(id: bigint | undefined, refetchInterval?: number) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<Order>({
    queryKey: ['order', id?.toString()],
    queryFn: async () => {
      if (!actor || id === undefined) throw new Error('Actor or ID not available');
      return actor.getOrderById(id);
    },
    enabled: !!actor && !actorFetching && id !== undefined,
    refetchInterval: refetchInterval,
  });
}

export function useApproveOrder() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation<void, Error, bigint>({
    mutationFn: async (orderId: bigint) => {
      if (!actor) throw new Error('Actor not available');
      const result = await actor.approveOrder(orderId);
      if (result.__kind__ === 'err') {
        throw new Error(result.err);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['order'] });
    },
  });
}

export function useDeclineOrder() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation<void, Error, bigint>({
    mutationFn: async (orderId: bigint) => {
      if (!actor) throw new Error('Actor not available');
      const result = await actor.declineOrder(orderId);
      if (result.__kind__ === 'err') {
        throw new Error(result.err);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['order'] });
    },
  });
}

export function useOrdersByBuyer(principal: Principal | undefined) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<Order[]>({
    queryKey: ['ordersByBuyer', principal?.toString()],
    queryFn: async () => {
      if (!actor || !principal) return [];
      return actor.getOrdersByBuyer(principal);
    },
    enabled: !!actor && !actorFetching && !!principal,
  });
}

// ── Admin Whitelist ───────────────────────────────────────────────────────────

/**
 * Checks whether a given username is on the admin whitelist.
 * Only fires when a non-empty username string is provided and the actor is ready.
 * Returns custom isFetched/isLoading that properly reflect actor loading state.
 */
export function useIsAdminUsername(username: string) {
  const { actor, isFetching: actorFetching } = useActor();

  // Only fire when actor is ready AND we have a real username to check.
  const isEnabled = !!actor && !actorFetching && username.trim().length > 0;

  const query = useQuery<boolean>({
    queryKey: ['isAdminUsername', username],
    queryFn: async () => {
      if (!actor || !username.trim()) return false;
      return actor.isAdminUsername(username.trim());
    },
    enabled: isEnabled,
    staleTime: 60_000,
    retry: 1,
  });

  // While actor is loading, treat as loading (not yet fetched).
  // Once actor is ready and query has resolved, isFetched=true.
  const isLoading = actorFetching || (isEnabled && query.isLoading);
  const isFetched = !actorFetching && isEnabled && query.isFetched;

  return {
    ...query,
    isLoading,
    isFetched,
  };
}

export function useGetAdminWhitelist() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<string[]>({
    queryKey: ['adminWhitelist'],
    queryFn: async () => {
      if (!actor) return [];
      return [];
    },
    enabled: !!actor && !actorFetching,
  });
}

export function useAddAdminUser() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation<void, Error, string>({
    mutationFn: async (username: string) => {
      if (!actor) throw new Error('Actor not available');
      await actor.addAdminUser(username);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminWhitelist'] });
      queryClient.invalidateQueries({ queryKey: ['isAdminUsername'] });
    },
  });
}

export function useRemoveAdminUser() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation<void, Error, string>({
    mutationFn: async (username: string) => {
      if (!actor) throw new Error('Actor not available');
      await actor.removeAdminUser(username);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminWhitelist'] });
      queryClient.invalidateQueries({ queryKey: ['isAdminUsername'] });
    },
  });
}

// ── Subscription Tiers ────────────────────────────────────────────────────────

export function useSubscriptionTiers() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<SubscriptionTier[]>({
    queryKey: ['subscriptionTiers'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getSubscriptionTiers();
    },
    enabled: !!actor && !actorFetching,
  });
}

interface UpdateTierPricesVars {
  id: bigint;
  monthlyPrice: number;
  yearlyPrice: number;
}

export function useUpdateSubscriptionTierPrices() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation<void, Error, UpdateTierPricesVars>({
    mutationFn: async ({ id, monthlyPrice, yearlyPrice }) => {
      if (!actor) throw new Error('Actor not available');
      const result = await actor.updateSubscriptionTierPrices(id, monthlyPrice, yearlyPrice);
      unwrapResult(result);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscriptionTiers'] });
    },
  });
}

interface SetFreeTrialVars {
  id: bigint;
  enabled: boolean;
}

export function useSetSubscriptionTierFreeTrial() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation<void, Error, SetFreeTrialVars>({
    mutationFn: async ({ id, enabled }) => {
      if (!actor) throw new Error('Actor not available');
      const result = await actor.setSubscriptionTierFreeTrial(id, enabled);
      unwrapResult(result);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscriptionTiers'] });
    },
  });
}

export function useInitializeDefaultTiers() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation<void, Error, void>({
    mutationFn: async () => {
      if (!actor) throw new Error('Actor not available');
      await actor.initializeDefaultTiers();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscriptionTiers'] });
    },
  });
}

// ── Store Settings ────────────────────────────────────────────────────────────

export function useStoreSettings() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<StoreSettings>({
    queryKey: ['storeSettings'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getStoreSettings();
    },
    enabled: !!actor && !actorFetching,
    staleTime: 60_000,
    retry: 1,
  });
}

export function useUpdatePaypalWalletAddress() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation<void, Error, string>({
    mutationFn: async (address: string) => {
      if (!actor) throw new Error('Actor not available');
      const result = await actor.updatePaypalWalletAddress(address);
      unwrapResult(result);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['storeSettings'] });
    },
  });
}

export function useUpdateBitcoinWalletAddress() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation<void, Error, string>({
    mutationFn: async (address: string) => {
      if (!actor) throw new Error('Actor not available');
      const result = await actor.updateBitcoinWalletAddress(address);
      unwrapResult(result);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['storeSettings'] });
    },
  });
}

export function useUpdateEthereumWalletAddress() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation<void, Error, string>({
    mutationFn: async (address: string) => {
      if (!actor) throw new Error('Actor not available');
      const result = await actor.updateEthereumWalletAddress(address);
      unwrapResult(result);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['storeSettings'] });
    },
  });
}
