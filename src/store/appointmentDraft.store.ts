import { create } from "zustand";

type Draft = {
  serviceId: number | null;
  serviceName: string | null;
  serviceDurationMinutes: number | null;
  servicePriceCents: number | null;
  professionalId: number | null;
  professionalName: string | null;
  date: string | null; 
  time: string | null; 
  notes: string | null;

  setService: (payload: {
    id: number;
    name: string;
    durationMinutes?: number | null;
    priceCents?: number | null;
  }) => void;
  setServiceId: (id: number) => void;
  setProfessional: (payload: { id: number; name: string }) => void;
  setProfessionalId: (id: number) => void;
  setDate: (date: string) => void;
  setTime: (time: string) => void;
  setNotes: (notes: string | null) => void;
  startNewFlow: (serviceId?: number | null) => void;
  reset: () => void;
};

export const useAppointmentDraftStore = create<Draft>((set) => ({
  serviceId: null,
  serviceName: null,
  serviceDurationMinutes: null,
  servicePriceCents: null,
  professionalId: null,
  professionalName: null,
  date: null,
  time: null,
  notes: null,

  setService: ({ id, name, durationMinutes = null, priceCents = null }) =>
    set({
      serviceId: id,
      serviceName: name,
      serviceDurationMinutes: durationMinutes,
      servicePriceCents: priceCents,
    }),
  setServiceId: (id) => set({ serviceId: id }),
  setProfessional: ({ id, name }) => set({ professionalId: id, professionalName: name }),
  setProfessionalId: (id) => set({ professionalId: id }),
  setDate: (date) => set({ date, time: null }),
  setTime: (time) => set({ time }),
  setNotes: (notes) => set({ notes }),
  startNewFlow: (serviceId) =>
    set((state) => {
      const keepServiceMeta = typeof serviceId === "number" && serviceId === state.serviceId;
      return {
        serviceId: typeof serviceId === "number" ? serviceId : state.serviceId,
        serviceName: keepServiceMeta ? state.serviceName : null,
        serviceDurationMinutes: keepServiceMeta ? state.serviceDurationMinutes : null,
        servicePriceCents: keepServiceMeta ? state.servicePriceCents : null,
        professionalId: null,
        professionalName: null,
        date: null,
        time: null,
        notes: null,
      };
    }),
  reset: () =>
    set({
      serviceId: null,
      serviceName: null,
      serviceDurationMinutes: null,
      servicePriceCents: null,
      professionalId: null,
      professionalName: null,
      date: null,
      time: null,
      notes: null,
    }),
}));