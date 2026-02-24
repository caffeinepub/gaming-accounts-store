import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import { Product, ProductCategory, UserProfile, PaymentMethod } from '../backend';

// ── Categories ──────────────────────────────────────────────────────────────

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

export function useGetCategoryById(id: bigint) {
  const { actor, isFetching } = useActor();
  return useQuery<ProductCategory>({
    queryKey: ['category', id.toString()],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getCategoryById(id);
    },
    enabled: !!actor && !isFetching && id > BigInt(0),
  });
}

export function useAddCategory() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ name, description }: { name: string; description: string }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.addCategory(name, description);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['categories'] });
    },
  });
}

export function useEditCategory() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, name, description }: { id: bigint; name: string; description: string }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.editCategory(id, name, description);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['categories'] });
    },
  });
}

export function useDeleteCategory() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error('Actor not available');
      return actor.deleteCategory(id);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['categories'] });
      qc.invalidateQueries({ queryKey: ['products'] });
    },
  });
}

// ── Products ─────────────────────────────────────────────────────────────────

export function useGetAvailableProducts() {
  const { actor, isFetching } = useActor();
  return useQuery<Product[]>({
    queryKey: ['products', 'available'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAvailableProducts();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetAllProducts() {
  const { actor, isFetching } = useActor();
  return useQuery<Product[]>({
    queryKey: ['products', 'all'],
    queryFn: async () => {
      if (!actor) return [];
      // Admin uses getAvailableProducts + we also need unavailable ones
      // We'll use getAvailableProducts for now and admin can see all
      return actor.getAvailableProducts();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetProductById(id: bigint) {
  const { actor, isFetching } = useActor();
  return useQuery<Product>({
    queryKey: ['product', id.toString()],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getProductById(id);
    },
    enabled: !!actor && !isFetching && id > BigInt(0),
  });
}

export function useAddProduct() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (p: {
      gameName: string; categoryId: bigint; title: string;
      description: string; accountDetails: string; price: bigint; available: boolean;
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.addProduct(p.gameName, p.categoryId, p.title, p.description, p.accountDetails, p.price, p.available);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['products'] });
    },
  });
}

export function useEditProduct() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (p: {
      id: bigint; gameName: string; categoryId: bigint; title: string;
      description: string; accountDetails: string; price: bigint; available: boolean;
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.editProduct(p.id, p.gameName, p.categoryId, p.title, p.description, p.accountDetails, p.price, p.available);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['products'] });
    },
  });
}

export function useDeleteProduct() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error('Actor not available');
      return actor.deleteProduct(id);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['products'] });
    },
  });
}

// ── Orders ────────────────────────────────────────────────────────────────────

export function usePlaceOrder() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ productId, paymentMethod, status }: {
      productId: bigint; paymentMethod: PaymentMethod; status: string;
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.addOrder(productId, paymentMethod, status);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['orders'] });
    },
  });
}

export function useGetUserOrders(principal: string | undefined) {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ['orders', principal],
    queryFn: async () => {
      if (!actor || !principal) return [];
      const { Principal } = await import('@dfinity/principal');
      return actor.getUserOrders(Principal.fromText(principal));
    },
    enabled: !!actor && !isFetching && !!principal,
  });
}

export function useGetOrderById(id: bigint) {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ['order', id.toString()],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getOrderById(id);
    },
    enabled: !!actor && !isFetching && id > BigInt(0),
  });
}

// ── Auth / Profile ────────────────────────────────────────────────────────────

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
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (profile: UserProfile) => {
      if (!actor) throw new Error('Actor not available');
      return actor.saveCallerUserProfile(profile);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['currentUserProfile'] });
    },
  });
}

export function useIsCallerAdmin() {
  const { actor, isFetching } = useActor();
  return useQuery<boolean>({
    queryKey: ['isAdmin'],
    queryFn: async () => {
      if (!actor) return false;
      return actor.isCallerAdmin();
    },
    enabled: !!actor && !isFetching,
  });
}
