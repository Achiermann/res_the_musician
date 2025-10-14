import { create } from 'zustand';

export const useGigsStore = create((set, get) => ({
  /*** STATE ***/
  gigs: [],
  loading: false,
  error: null,

  /*** ACTIONS ***/
  setGigs: (gigs) => set({ gigs }),

  setLoading: (loading) => set({ loading }),

  setError: (error) => set({ error }),

  fetchGigs: async () => {
    set({ loading: true, error: null });
    try {
      const res = await fetch('/api/gigs?pageSize=1000');
      if (!res.ok) {
        throw new Error('Failed to fetch gigs');
      }
      const data = await res.json();
      set({ gigs: data.items || [], loading: false });
    } catch (error) {
      set({ error: error.message, loading: false });
      console.error(error);
    }
  },

  addGig: (gig) => {
    const { gigs } = get();
    set({ gigs: [...gigs, gig] });
  },

  updateGig: (id, updatedGig) => {
    const { gigs } = get();
    set({
      gigs: gigs.map((gig) => (gig.id === id ? { ...gig, ...updatedGig } : gig)),
    });
  },

  deleteGig: (id) => {
    const { gigs } = get();
    set({ gigs: gigs.filter((gig) => gig.id !== id) });
  },

  reset: () => set({ gigs: [], loading: false, error: null }),
}));
