import { create } from "zustand";

type Draft = {
  serviceId: number | null;
  professionalId: number | null;
  date: string | null; 
  time: string | null; 
  notes: string | null;

  setServiceId: (id: number) => void;
  setProfessionalId: (id: number) => void;
  setDate: (date: string) => void;
  setTime: (time: string) => void;
  setNotes: (notes: string | null) => void;
  reset: () => void;
};

export const useAppointmentDraftStore = create<Draft>((set) => ({
  serviceId: null,
  professionalId: null,
  date: null,
  time: null,
  notes: null,

  setServiceId: (id) => set({ serviceId: id }),
  setProfessionalId: (id) => set({ professionalId: id }),
  setDate: (date) => set({ date, time: null }),
  setTime: (time) => set({ time }),
  setNotes: (notes) => set({ notes }),
  reset: () =>
    set({
      serviceId: null,
      professionalId: null,
      date: null,
      time: null,
      notes: null,
    }),
}));