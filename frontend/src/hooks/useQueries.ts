import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import { Principal } from '@dfinity/principal';
import {
  PaymentMethod,
  ApprovalStatus,
  type UserProfile,
  type Product,
  type ProductCategory,
  type Order,
  type SubscriptionTier,
  type StoreSettings,
} from '../backend';

// ─── User Profile ─────────────────────────────────────────────────────────────

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
    staleTime: 300_000,
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

// ─── Username ─────────────────────────────────────────────────────────────────

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
    staleTime: 10_000,
    retry: 1,
  });
}

export function useGetUsernameByPrincipal(principalStr: string | undefined) {
  const { actor, isFetching: actorFetching } = useActor();

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

  const isLoading = actorFetching || (isEnabled && query.isLoading);
  const isFetched = !actorFetching && isEnabled && query.isFetched;

  return { ...query, isLoading, isFetched };
}

// ─── Categories ───────────────────────────────────────────────────────────────

export function useGetAllCategories() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<ProductCategory[]>({
    queryKey: ['categories'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllCategories();
    },
    enabled: !!actor && !actorFetching,
    staleTime: 60_000,
    retry: 1,
  });
}

export function useAddCategory() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation<void, Error, { name: string; description: string }>({
    mutationFn: async ({ name, description }) => {
      if (!actor) throw new Error('Actor not available');
      const result = await actor.addCategory(name, description);
      if (result.__kind__ === 'err') throw new Error(result.err);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
  });
}

export function useUpdateCategory() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation<void, Error, { id: bigint; name: string; description: string }>({
    mutationFn: async ({ id, name, description }) => {
      if (!actor) throw new Error('Actor not available');
      const result = await actor.updateCategory(id, name, description);
      if (result.__kind__ === 'err') throw new Error(result.err);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
  });
}

export function useDeleteCategory() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation<void, Error, bigint>({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error('Actor not available');
      const result = await actor.deleteCategory(id);
      if (result.__kind__ === 'err') throw new Error(result.err);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
  });
}

// ─── Products ─────────────────────────────────────────────────────────────────

export function useGetAvailableProducts() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<Product[]>({
    queryKey: ['availableProducts'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAvailableProducts();
    },
    enabled: !!actor && !actorFetching,
    staleTime: 60_000,
    retry: 1,
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
    staleTime: 60_000,
    retry: 1,
  });
}

/**
 * Accepts bigint | undefined | null — returns null data when id is not provided.
 */
export function useGetProductById(id: bigint | undefined | null) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<Product | null>({
    queryKey: ['product', id?.toString()],
    queryFn: async () => {
      if (!actor || id === undefined || id === null) return null;
      return actor.getProductById(id);
    },
    enabled: !!actor && !actorFetching && id !== undefined && id !== null,
    staleTime: 60_000,
    retry: 1,
  });
}

interface AddProductVars {
  gameName: string;
  categoryId?: bigint;
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
    mutationFn: async ({ gameName, categoryId = 0n, title, description, accountDetails, price, available }) => {
      if (!actor) throw new Error('Actor not available');
      const result = await actor.addProduct(gameName, categoryId, title, description, accountDetails, price, available);
      if (result.__kind__ === 'err') throw new Error(result.err);
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
  categoryId?: bigint;
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
    mutationFn: async ({ id, gameName, categoryId = 0n, title, description, accountDetails, price, available }) => {
      if (!actor) throw new Error('Actor not available');
      const result = await actor.updateProduct(id, gameName, categoryId, title, description, accountDetails, price, available);
      if (result.__kind__ === 'err') throw new Error(result.err);
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
      if (result.__kind__ === 'err') throw new Error(result.err);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['availableProducts'] });
    },
  });
}

// ─── Orders ───────────────────────────────────────────────────────────────────

interface PlaceOrderVars {
  productId: bigint;
  paymentMethod: PaymentMethod;
  status: string;
  approvalStatus?: ApprovalStatus;
  giftCardNumber?: string;
  giftCardBalance?: string;
}

export function usePlaceOrder() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation<bigint, Error, PlaceOrderVars>({
    mutationFn: async ({
      productId,
      paymentMethod,
      status,
      approvalStatus = ApprovalStatus.pending,
      giftCardNumber = '',
      giftCardBalance = '',
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.addOrder(productId, paymentMethod, status, approvalStatus, giftCardNumber, giftCardBalance);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['allOrders'] });
    },
  });
}

export function useGetAllOrders() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<Order[]>({
    queryKey: ['allOrders'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllOrders();
    },
    enabled: !!actor && !actorFetching,
    staleTime: 30_000,
    retry: 1,
  });
}

/**
 * Accepts an optional refetchInterval as second argument for live polling.
 */
export function useGetOrderById(id: bigint | undefined, refetchInterval?: number) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<Order | null>({
    queryKey: ['order', id?.toString()],
    queryFn: async () => {
      if (!actor || id === undefined) return null;
      return actor.getOrderById(id);
    },
    enabled: !!actor && !actorFetching && id !== undefined,
    staleTime: 30_000,
    retry: 1,
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
      if (result.__kind__ === 'err') throw new Error(result.err);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allOrders'] });
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
      if (result.__kind__ === 'err') throw new Error(result.err);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allOrders'] });
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
    staleTime: 30_000,
    retry: 1,
  });
}

// ─── Admin Whitelist ──────────────────────────────────────────────────────────

export function useIsAdminUsername(username: string) {
  const { actor, isFetching: actorFetching } = useActor();

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

  const isLoading = actorFetching || (isEnabled && query.isLoading);
  const isFetched = !actorFetching && isEnabled && query.isFetched;

  return { ...query, isLoading, isFetched };
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
    staleTime: 60_000,
    retry: 1,
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

// ─── Subscription Tiers ───────────────────────────────────────────────────────

/** Primary export — used by SubscriptionsPage and SubscriptionManager */
export function useGetSubscriptionTiers() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<SubscriptionTier[]>({
    queryKey: ['subscriptionTiers'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getSubscriptionTiers();
    },
    enabled: !!actor && !actorFetching,
    staleTime: 60_000,
    retry: 1,
  });
}

/** Alias kept for backward compatibility */
export const useSubscriptionTiers = useGetSubscriptionTiers;

export function useUpdateSubscriptionTierPrices() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation<void, Error, { id: bigint; monthlyPrice: number; yearlyPrice: number }>({
    mutationFn: async ({ id, monthlyPrice, yearlyPrice }) => {
      if (!actor) throw new Error('Actor not available');
      const result = await actor.updateSubscriptionTierPrices(id, monthlyPrice, yearlyPrice);
      if (result.__kind__ === 'err') throw new Error(result.err);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscriptionTiers'] });
    },
  });
}

export function useSetSubscriptionTierFreeTrial() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation<void, Error, { id: bigint; enabled: boolean }>({
    mutationFn: async ({ id, enabled }) => {
      if (!actor) throw new Error('Actor not available');
      const result = await actor.setSubscriptionTierFreeTrial(id, enabled);
      if (result.__kind__ === 'err') throw new Error(result.err);
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

// ─── Store Settings ───────────────────────────────────────────────────────────

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
      if (result.__kind__ === 'err') throw new Error(result.err);
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
      if (result.__kind__ === 'err') throw new Error(result.err);
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
      if (result.__kind__ === 'err') throw new Error(result.err);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['storeSettings'] });
    },
  });
}
