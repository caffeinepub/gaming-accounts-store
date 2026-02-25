import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import { PaymentMethod, type Order, type Product, type ProductCategory, type UserProfile } from '../backend';
import { Principal } from '@dfinity/principal';
import { useInternetIdentity } from './useInternetIdentity';

// ─── Categories ──────────────────────────────────────────────────────────────

export function useGetAllCategories() {
  const { actor, isFetching } = useActor();
  return useQuery<ProductCategory[]>({
    queryKey: ['categories'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllCategories();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAddCategory() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ name, description }: { name: string; description: string }) => {
      if (!actor) throw new Error('Actor not available');
      const result = await actor.addCategory(name, description);
      if (result.__kind__ === 'err') throw new Error(result.err);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['categories'] }),
  });
}

export function useUpdateCategory() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, name, description }: { id: bigint; name: string; description: string }) => {
      if (!actor) throw new Error('Actor not available');
      const result = await actor.updateCategory(id, name, description);
      if (result.__kind__ === 'err') throw new Error(result.err);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['categories'] }),
  });
}

export function useDeleteCategory() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error('Actor not available');
      const result = await actor.deleteCategory(id);
      if (result.__kind__ === 'err') throw new Error(result.err);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['categories'] }),
  });
}

// ─── Products ─────────────────────────────────────────────────────────────────

export function useGetAvailableProducts() {
  const { actor, isFetching } = useActor();
  return useQuery<Product[]>({
    queryKey: ['products'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAvailableProducts();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetProductById(productId: bigint | null) {
  const { actor, isFetching } = useActor();
  return useQuery<Product | null>({
    queryKey: ['product', productId?.toString()],
    queryFn: async () => {
      if (!actor || productId === null) return null;
      try {
        return await actor.getProductById(productId);
      } catch {
        return null;
      }
    },
    enabled: !!actor && !isFetching && productId !== null,
  });
}

export function useAddProduct() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (product: {
      gameName: string;
      categoryId: bigint;
      title: string;
      description: string;
      accountDetails: string;
      price: bigint;
      available: boolean;
    }) => {
      if (!actor) throw new Error('Actor not available');
      const result = await actor.addProduct(
        product.gameName,
        product.categoryId,
        product.title,
        product.description,
        product.accountDetails,
        product.price,
        product.available,
      );
      if (result.__kind__ === 'err') throw new Error(result.err);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['products'] }),
  });
}

export function useUpdateProduct() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (product: {
      id: bigint;
      gameName: string;
      categoryId: bigint;
      title: string;
      description: string;
      accountDetails: string;
      price: bigint;
      available: boolean;
    }) => {
      if (!actor) throw new Error('Actor not available');
      const result = await actor.updateProduct(
        product.id,
        product.gameName,
        product.categoryId,
        product.title,
        product.description,
        product.accountDetails,
        product.price,
        product.available,
      );
      if (result.__kind__ === 'err') throw new Error(result.err);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['products'] }),
  });
}

export function useDeleteProduct() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error('Actor not available');
      const result = await actor.deleteProduct(id);
      if (result.__kind__ === 'err') throw new Error(result.err);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['products'] }),
  });
}

// ─── Orders ───────────────────────────────────────────────────────────────────

export interface PlaceOrderVars {
  buyerPrincipal: Principal;
  username: string;
  email: string;
  contactInfo: string;
  productId: bigint;
  paymentMethod: PaymentMethod;
  giftCardNumber: string;
  giftCardBalance: string;
}

export function useGetAllOrders() {
  const { actor, isFetching } = useActor();
  return useQuery<Order[]>({
    queryKey: ['orders'],
    queryFn: async () => {
      if (!actor) return [];
      // Try getAllOrders first, fall back to getOrders — both require admin role
      try {
        return await actor.getAllOrders();
      } catch (err: unknown) {
        // Try the alternate endpoint
        try {
          return await actor.getOrders();
        } catch {
          // Re-throw the original error so the UI can display it
          throw err;
        }
      }
    },
    enabled: !!actor && !isFetching,
    // Poll every 15 seconds so new orders appear without manual refresh
    refetchInterval: 15000,
    retry: 1,
  });
}

export function useGetOrderById(id: bigint | null | undefined) {
  const { actor, isFetching } = useActor();
  const resolvedId = id ?? null;
  return useQuery<Order | null>({
    queryKey: ['order', resolvedId?.toString()],
    queryFn: async () => {
      if (!actor || resolvedId === null) return null;
      try {
        return await actor.getOrderById(resolvedId);
      } catch {
        return null;
      }
    },
    enabled: !!actor && !isFetching && resolvedId !== null,
    refetchInterval: 10_000,
  });
}

export function useGetOrdersByBuyer(principal: Principal | null) {
  const { actor, isFetching } = useActor();
  return useQuery<Order[]>({
    queryKey: ['ordersByBuyer', principal?.toString()],
    queryFn: async () => {
      if (!actor || !principal) return [];
      try {
        return await actor.getOrdersByBuyer(principal);
      } catch {
        return [];
      }
    },
    enabled: !!actor && !isFetching && !!principal,
  });
}

export function usePlaceOrder() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (vars: PlaceOrderVars): Promise<void> => {
      if (!actor) throw new Error('Actor not available');
      const result = await actor.placeOrder(
        vars.buyerPrincipal,
        vars.username,
        vars.email,
        vars.contactInfo,
        vars.productId,
        vars.paymentMethod,
        vars.giftCardNumber,
        vars.giftCardBalance,
      );
      if (result.__kind__ === 'err') {
        throw new Error(result.err);
      }
    },
    onSuccess: () => {
      // Invalidate orders so admin panel auto-refreshes
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['ordersByBuyer'] });
    },
    onError: (error: Error) => {
      console.error('Order placement failed:', error.message);
    },
  });
}

export function useApproveOrder() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (orderId: bigint) => {
      if (!actor) throw new Error('Actor not available');
      const result = await actor.approveOrder(orderId);
      if (result.__kind__ === 'err') throw new Error(result.err);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['orders'] }),
  });
}

export function useDeclineOrder() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (orderId: bigint) => {
      if (!actor) throw new Error('Actor not available');
      const result = await actor.declineOrder(orderId);
      if (result.__kind__ === 'err') throw new Error(result.err);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['orders'] }),
  });
}

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
  return useMutation({
    mutationFn: async (profile: UserProfile) => {
      if (!actor) throw new Error('Actor not available');
      await actor.saveCallerUserProfile(profile);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] }),
  });
}

export function useCreateUsername() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (username: string) => {
      if (!actor) throw new Error('Actor not available');
      await actor.createUsername(username);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
      queryClient.invalidateQueries({ queryKey: ['usernameAvailable'] });
    },
  });
}

export function useIsUsernameAvailable(username: string) {
  const { actor, isFetching } = useActor();
  return useQuery<boolean>({
    queryKey: ['usernameAvailable', username],
    queryFn: async () => {
      if (!actor || !username) return true;
      return actor.isUsernameAvailable(username);
    },
    enabled: !!actor && !isFetching && username.length > 0,
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

// ─── Admin Whitelist ──────────────────────────────────────────────────────────

export function useIsCallerAdmin() {
  const { actor, isFetching } = useActor();
  return useQuery<boolean>({
    queryKey: ['isCallerAdmin'],
    queryFn: async () => {
      if (!actor) return false;
      try {
        return await actor.isCallerAdmin();
      } catch {
        return false;
      }
    },
    enabled: !!actor && !isFetching,
  });
}

export function useIsAdminUsername(username: string | undefined) {
  const { actor, isFetching } = useActor();
  return useQuery<boolean>({
    queryKey: ['isAdminUsername', username],
    queryFn: async () => {
      if (!actor || !username) return false;
      return actor.isAdminUsername(username);
    },
    enabled: !!actor && !isFetching && !!username && username.length > 0,
    staleTime: 60_000,
    retry: 1,
  });
}

export function useAddAdminUser() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (username: string) => {
      if (!actor) throw new Error('Actor not available');
      await actor.addAdminUser(username);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminUsers'] });
      queryClient.invalidateQueries({ queryKey: ['isAdminUsername'] });
    },
  });
}

export function useRemoveAdminUser() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (username: string) => {
      if (!actor) throw new Error('Actor not available');
      await actor.removeAdminUser(username);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminUsers'] });
      queryClient.invalidateQueries({ queryKey: ['isAdminUsername'] });
    },
  });
}

// ─── Store Settings ───────────────────────────────────────────────────────────

export function useStoreSettings() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ['storeSettings'],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getStoreSettings();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useUpdatePaypalWallet() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (address: string) => {
      if (!actor) throw new Error('Actor not available');
      const result = await actor.updatePaypalWalletAddress(address);
      if (result.__kind__ === 'err') throw new Error(result.err);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['storeSettings'] }),
  });
}

export function useUpdateBitcoinWallet() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (address: string) => {
      if (!actor) throw new Error('Actor not available');
      const result = await actor.updateBitcoinWalletAddress(address);
      if (result.__kind__ === 'err') throw new Error(result.err);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['storeSettings'] }),
  });
}

export function useUpdateEthereumWallet() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (address: string) => {
      if (!actor) throw new Error('Actor not available');
      const result = await actor.updateEthereumWalletAddress(address);
      if (result.__kind__ === 'err') throw new Error(result.err);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['storeSettings'] }),
  });
}

// ─── Subscription Tiers ───────────────────────────────────────────────────────

export function useGetSubscriptionTiers() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ['subscriptionTiers'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getSubscriptionTiers();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useUpdateSubscriptionTierPrices() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, monthlyPrice, yearlyPrice }: { id: bigint; monthlyPrice: number; yearlyPrice: number }) => {
      if (!actor) throw new Error('Actor not available');
      const result = await actor.updateSubscriptionTierPrices(id, monthlyPrice, yearlyPrice);
      if (result.__kind__ === 'err') throw new Error(result.err);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['subscriptionTiers'] }),
  });
}

export function useSetSubscriptionTierFreeTrial() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, enabled }: { id: bigint; enabled: boolean }) => {
      if (!actor) throw new Error('Actor not available');
      const result = await actor.setSubscriptionTierFreeTrial(id, enabled);
      if (result.__kind__ === 'err') throw new Error(result.err);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['subscriptionTiers'] }),
  });
}

// ─── Admin PIN ────────────────────────────────────────────────────────────────

export function useVerifyAdminPin() {
  const { actor } = useActor();
  return useMutation({
    mutationFn: async (pin: string) => {
      if (!actor) throw new Error('Actor not available');
      const result = await actor.verifyAdminPin(pin);
      if (result.__kind__ === 'err') throw new Error(result.err);
      return result.ok;
    },
  });
}

export function useAdminPinLockoutStatus(principal: Principal | undefined) {
  const { actor, isFetching } = useActor();
  const { identity } = useInternetIdentity();

  return useQuery({
    queryKey: ['adminPinLockout', principal?.toString()],
    queryFn: async () => {
      if (!actor || !principal) return { isLockedOut: false, remainingSeconds: BigInt(0) };
      return actor.getAdminPinLockoutStatus(principal);
    },
    enabled: !!actor && !isFetching && !!principal && !!identity,
    refetchInterval: (query) => {
      const data = query.state.data;
      return data?.isLockedOut ? 5000 : false;
    },
  });
}
