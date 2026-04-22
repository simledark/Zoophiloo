import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";
import type { Profile, SearchFilters, Listing, Notification } from "@/types";

// ============================================================
// AUTH SLICE
// ============================================================

interface AuthState {
  user: { id: string; email: string | null } | null;
  profile: Profile | null;
  isLoading: boolean;
  setUser: (user: { id: string; email: string | null } | null) => void;
  setProfile: (profile: Profile | null) => void;
  setLoading: (loading: boolean) => void;
  logout: () => void;
}

// ============================================================
// SEARCH SLICE
// ============================================================

interface SearchState {
  filters: SearchFilters;
  setFilters: (filters: Partial<SearchFilters>) => void;
  resetFilters: () => void;
}

const defaultFilters: SearchFilters = {
  category: undefined,
  type: undefined,
  sort_by: "created_at",
  page: 1,
  per_page: 24,
};

// ============================================================
// MAP SLICE
// ============================================================

interface MapState {
  mapCenter: [number, number];
  mapZoom: number;
  selectedListingId: string | null;
  setMapCenter: (center: [number, number]) => void;
  setMapZoom: (zoom: number) => void;
  setSelectedListing: (id: string | null) => void;
}

// ============================================================
// UI SLICE
// ============================================================

interface UIState {
  isMobileMenuOpen: boolean;
  isSearchOpen: boolean;
  viewMode: "grid" | "map";
  setMobileMenuOpen: (open: boolean) => void;
  setSearchOpen: (open: boolean) => void;
  setViewMode: (mode: "grid" | "map") => void;
  toggleMobileMenu: () => void;
}

// ============================================================
// FAVORITES SLICE
// ============================================================

interface FavoritesState {
  favoriteIds: Set<string>;
  addFavorite: (listingId: string) => void;
  removeFavorite: (listingId: string) => void;
  setFavorites: (ids: string[]) => void;
  isFavorite: (listingId: string) => boolean;
}

// ============================================================
// NOTIFICATIONS SLICE
// ============================================================

interface NotificationsState {
  notifications: Notification[];
  unreadCount: number;
  setNotifications: (notifications: Notification[]) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  addNotification: (notification: Notification) => void;
}

// ============================================================
// RECENT LISTINGS SLICE (cache local)
// ============================================================

interface RecentListingsState {
  recentlyViewed: string[]; // IDs
  addRecentlyViewed: (id: string) => void;
  clearRecentlyViewed: () => void;
}

// ============================================================
// STORE GLOBAL
// ============================================================

type Store = AuthState &
  SearchState &
  MapState &
  UIState &
  FavoritesState &
  NotificationsState &
  RecentListingsState;

export const useStore = create<Store>()(
  devtools(
    persist(
      (set, get) => ({
        // ---- AUTH ----
        user: null,
        profile: null,
        isLoading: true,
        setUser: (user) => set({ user }),
        setProfile: (profile) => set({ profile }),
        setLoading: (isLoading) => set({ isLoading }),
        logout: () =>
          set({
            user: null,
            profile: null,
            favoriteIds: new Set(),
            notifications: [],
            unreadCount: 0,
          }),

        // ---- SEARCH ----
        filters: defaultFilters,
        setFilters: (newFilters) =>
          set((state) => ({
            filters: { ...state.filters, ...newFilters, page: 1 },
          })),
        resetFilters: () => set({ filters: defaultFilters }),

        // ---- MAP ----
        mapCenter: [46.6034, 1.8883], // Centre France
        mapZoom: 6,
        selectedListingId: null,
        setMapCenter: (mapCenter) => set({ mapCenter }),
        setMapZoom: (mapZoom) => set({ mapZoom }),
        setSelectedListing: (selectedListingId) => set({ selectedListingId }),

        // ---- UI ----
        isMobileMenuOpen: false,
        isSearchOpen: false,
        viewMode: "grid",
        setMobileMenuOpen: (isMobileMenuOpen) => set({ isMobileMenuOpen }),
        setSearchOpen: (isSearchOpen) => set({ isSearchOpen }),
        setViewMode: (viewMode) => set({ viewMode }),
        toggleMobileMenu: () =>
          set((state) => ({ isMobileMenuOpen: !state.isMobileMenuOpen })),

        // ---- FAVORITES ----
        favoriteIds: new Set(),
        addFavorite: (id) =>
          set((state) => ({
            favoriteIds: new Set([...state.favoriteIds, id]),
          })),
        removeFavorite: (id) =>
          set((state) => {
            const next = new Set(state.favoriteIds);
            next.delete(id);
            return { favoriteIds: next };
          }),
        setFavorites: (ids) => set({ favoriteIds: new Set(ids) }),
        isFavorite: (id) => get().favoriteIds.has(id),

        // ---- NOTIFICATIONS ----
        notifications: [],
        unreadCount: 0,
        setNotifications: (notifications) =>
          set({
            notifications,
            unreadCount: notifications.filter((n) => !n.is_read).length,
          }),
        markAsRead: (id) =>
          set((state) => ({
            notifications: state.notifications.map((n) =>
              n.id === id ? { ...n, is_read: true } : n
            ),
            unreadCount: Math.max(state.unreadCount - 1, 0),
          })),
        markAllAsRead: () =>
          set((state) => ({
            notifications: state.notifications.map((n) => ({
              ...n,
              is_read: true,
            })),
            unreadCount: 0,
          })),
        addNotification: (notification) =>
          set((state) => ({
            notifications: [notification, ...state.notifications],
            unreadCount: state.unreadCount + (notification.is_read ? 0 : 1),
          })),

        // ---- RECENTLY VIEWED ----
        recentlyViewed: [],
        addRecentlyViewed: (id) =>
          set((state) => ({
            recentlyViewed: [
              id,
              ...state.recentlyViewed.filter((v) => v !== id),
            ].slice(0, 20),
          })),
        clearRecentlyViewed: () => set({ recentlyViewed: [] }),
      }),
      {
        name: "zoophiloo-store",
        // Ne persister que les éléments non-sensibles
        partialize: (state) => ({
          viewMode: state.viewMode,
          filters: state.filters,
          recentlyViewed: state.recentlyViewed,
          mapCenter: state.mapCenter,
          mapZoom: state.mapZoom,
        }),
      }
    ),
    { name: "ZoophilooStore" }
  )
);

// ============================================================
// SÉLECTEURS DÉRIVÉS
// ============================================================

export const selectUser = (s: Store) => s.user;
export const selectProfile = (s: Store) => s.profile;
export const selectIsAuth = (s: Store) => !!s.user;
export const selectFilters = (s: Store) => s.filters;
export const selectViewMode = (s: Store) => s.viewMode;
export const selectUnreadCount = (s: Store) => s.unreadCount;
export const selectMapState = (s: Store) => ({
  center: s.mapCenter,
  zoom: s.mapZoom,
  selectedId: s.selectedListingId,
});
