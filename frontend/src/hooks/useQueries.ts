import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import { PaymentMethod, type UserProfile, type Product, type ProductCategory, type Order, type Result } from '../backend';

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

export function useAddCategory() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation<void, Error, { name: string; description: string }>({
    mutationFn: async ({ name, description }) => {
      if (!actor) throw new Error('Actor not available');
      const result = await actor.addCategory(name, description);
      unwrapResult(result);
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
      unwrapResult(result);
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
      unwrapResult(result);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
  });
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
      // Use getAvailableProducts for now; admin sees all via separate logic
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
  categoryId: bigint;
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
    mutationFn: async ({ gameName, categoryId, title, description, accountDetails, price, available }) => {
      if (!actor) throw new Error('Actor not available');
      const result = await actor.addProduct(gameName, categoryId, title, description, accountDetails, price, available);
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
  categoryId: bigint;
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
    mutationFn: async ({ id, gameName, categoryId, title, description, accountDetails, price, available }) => {
      if (!actor) throw new Error('Actor not available');
      const result = await actor.updateProduct(id, gameName, categoryId, title, description, accountDetails, price, available);
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
}

export function usePlaceOrder() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation<bigint, Error, PlaceOrderVars>({
    mutationFn: async ({ productId, paymentMethod, status }) => {
      if (!actor) throw new Error('Actor not available');
      const orderId = await actor.addOrder(productId, paymentMethod, status);
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

export function useGetOrderById(id: bigint | undefined) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<Order>({
    queryKey: ['order', id?.toString()],
    queryFn: async () => {
      if (!actor || id === undefined) throw new Error('Actor or ID not available');
      return actor.getOrderById(id);
    },
    enabled: !!actor && !actorFetching && id !== undefined,
  });
}

// ── Admin Whitelist ───────────────────────────────────────────────────────────

export function useIsAdminUsername(username: string) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<boolean>({
    queryKey: ['isAdminUsername', username],
    queryFn: async () => {
      if (!actor || !username) return false;
      return actor.isAdminUsername(username);
    },
    // Only run when actor is ready AND username is non-empty
    enabled: !!actor && !actorFetching && username.length > 0,
    // Don't cache stale admin status for too long
    staleTime: 30_000,
  });
}

export function useAddAdminUsername() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation<void, Error, string>({
    mutationFn: async (username: string) => {
      if (!actor) throw new Error('Actor not available');
      await actor.addAdminUser(username);
    },
    onSuccess: (_data, username) => {
      queryClient.invalidateQueries({ queryKey: ['isAdminUsername', username] });
      queryClient.invalidateQueries({ queryKey: ['adminUsernames'] });
    },
  });
}

export function useRemoveAdminUsername() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation<void, Error, string>({
    mutationFn: async (username: string) => {
      if (!actor) throw new Error('Actor not available');
      await actor.removeAdminUser(username);
    },
    onSuccess: (_data, username) => {
      queryClient.invalidateQueries({ queryKey: ['isAdminUsername', username] });
      queryClient.invalidateQueries({ queryKey: ['adminUsernames'] });
    },
  });
}

export function useIsCallerAdmin() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<boolean>({
    queryKey: ['isCallerAdmin'],
    queryFn: async () => {
      if (!actor) return false;
      return actor.isCallerAdmin();
    },
    enabled: !!actor && !actorFetching,
  });
}
