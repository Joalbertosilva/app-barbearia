import {
  collection,
  doc,
  getDocs,
  query,
  setDoc,
  where,
  writeBatch,
} from "firebase/firestore";
import { db } from "./client";
import type { Product, Professional, Service } from "./schema";

const defaultServices: Service[] = [
  {
    id: 101,
    name: "Corte Degradê",
    description: "Corte moderno com acabamento premium.",
    price_cents: 4500,
    duration_minutes: 45,
    is_active: true,
  },
  {
    id: 102,
    name: "Barba Premium",
    description: "Modelagem completa com toalha quente.",
    price_cents: 3500,
    duration_minutes: 35,
    is_active: true,
  },
  {
    id: 103,
    name: "Combo Corte + Barba",
    description: "Experiencia completa com finalizacao.",
    price_cents: 7000,
    duration_minutes: 70,
    is_active: true,
  },
];

const defaultProducts: Product[] = [
  {
    id: 201,
    name: "Pomada Modeladora Fosca",
    description: "Fixacao forte e efeito natural.",
    price_cents: 3990,
    stock_qty: 30,
    sku: "POM-FOSCA-01",
    is_active: true,
  },
  {
    id: 202,
    name: "Oleo Para Barba",
    description: "Hidratacao e brilho sem pesar.",
    price_cents: 2990,
    stock_qty: 25,
    sku: "OLE-BARBA-01",
    is_active: true,
  },
  {
    id: 203,
    name: "Shampoo Antirresiduos",
    description: "Limpeza profunda para uso semanal.",
    price_cents: 2490,
    stock_qty: 18,
    sku: "SHA-ANTI-01",
    is_active: true,
  },
];

const defaultProfessionals: Professional[] = [
  {
    id: 301,
    user_id: 0,
    display_name: "Carlos Ferreira",
    bio: "Especialista em cortes modernos e degradê.",
    is_active: true,
  },
  {
    id: 302,
    user_id: 0,
    display_name: "Rafael Souza",
    bio: "Barboterapia e acabamento premium.",
    is_active: true,
  },
];

export async function ensureSeedData() {
  const marker = await getDocs(query(collection(db, "meta"), where("id", "==", "seed-v1")));
  if (!marker.empty) return;

  const batch = writeBatch(db);

  defaultServices.forEach((item) => {
    batch.set(doc(db, "services", String(item.id)), item);
  });
  defaultProducts.forEach((item) => {
    batch.set(doc(db, "products", String(item.id)), item);
  });
  defaultProfessionals.forEach((item) => {
    batch.set(doc(db, "professionals", String(item.id)), item);
  });

  batch.set(doc(db, "meta", "seed-v1"), {
    id: "seed-v1",
    created_at: new Date().toISOString(),
  });

  await batch.commit();
}

export async function ensureCounterDoc(counterName: string, startAt = 1000) {
  const ref = doc(db, "counters", counterName);
  await setDoc(ref, { value: startAt }, { merge: true });
}
