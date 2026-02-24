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

// ─── Admin Check (NOT used as control-flow in AdminAccessControl) ─────────────
// These hooks are available for other consumers but must NOT be used to gate
// admin access — AdminAccessControl uses imperative actor calls instead.

export function useIsAdminUsername(username: string | undefined) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<boolean>({
    queryKey: ['isAdminUsername', username],
    queryFn: async () => {
      if (!actor || !username) return false;
      return actor.isAdminUsername(username);
    },
    enabled: !!actor && !actorFetching && !!username && username.length > 0,
    staleTime: 60_000,
    retry: 1,
  });
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

export function useGetOrdersByBuyer(principalStr: string | undefined) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<Order[]>({
    queryKey: ['ordersByBuyer', principalStr],
    queryFn: async () => {
      if (!actor || !principalStr) return [];
      const principal = Principal.fromText(principalStr);
      return actor.getOrdersByBuyer(principal);
    },
    enabled: !!actor && !actorFetching && !!principalStr,
    staleTime: 30_000,
    retry: 1,
  });
}

export function useGetOrderById(id: bigint | undefined | null) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<Order | null>({
    queryKey: ['order', id?.toString()],
    queryFn: async () => {
      if (!actor || id === undefined || id === null) return null;
      return actor.getOrderById(id);
    },
    enabled: !!actor && !actorFetching && id !== undefined && id !== null,
    staleTime: 30_000,
    retry: 1,
    refetchInterval: 30_000,
  });
}

export function usePlaceOrder() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation<
    bigint,
    Error,
    {
      productId: bigint;
      paymentMethod: PaymentMethod;
      status: string;
      approvalStatus: ApprovalStatus;
      giftCardNumber: string;
      giftCardBalance: string;
    }
  >({
    mutationFn: async ({ productId, paymentMethod, status, approvalStatus, giftCardNumber, giftCardBalance }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.addOrder(productId, paymentMethod, status, approvalStatus, giftCardNumber, giftCardBalance);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ordersByBuyer'] });
      queryClient.invalidateQueries({ queryKey: ['allOrders'] });
    },
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

export function useUpdatePaypalWallet() {
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

export function useUpdateBitcoinWallet() {
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

export function useUpdateEthereumWallet() {
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

// ─── Admin Whitelist ──────────────────────────────────────────────────────────

export function useAddAdminUser() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation<void, Error, string>({
    mutationFn: async (username: string) => {
      if (!actor) throw new Error('Actor not available');
      await actor.addAdminUser(username);
    },
    onSuccess: () => {
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
      queryClient.invalidateQueries({ queryKey: ['isAdminUsername'] });
    },
  });
}

// ─── Subscription Tiers ───────────────────────────────────────────────────────

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
