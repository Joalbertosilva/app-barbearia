import {
  createUserWithEmailAndPassword,
  deleteUser,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  increment,
  query,
  setDoc,
  updateDoc,
  where,
} from "firebase/firestore";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { auth, db } from "@/src/services/firebase/client";
import { ensureSeedData } from "@/src/services/firebase/seed";
import type {
  AppUser,
  Appointment,
  Order,
  OrderItem,
  Product,
  Professional,
  Service,
} from "@/src/services/firebase/schema";
import { useAuthStore } from "@/src/store/auth.store";

type ApiResponse<T> = Promise<{ data: T }>;
const FIREBASE_TIMEOUT_MS = 20000;
const READ_TIMEOUT_MS = 6000;
const WRITE_TIMEOUT_MS = 8000;
const CACHE_TTL_MS = 60000;
const cacheStore: Record<string, { expiresAt: number; data: unknown }> = {};
const APPOINTMENTS_KEY = "@barbermob:appointments:v1";
const DEFAULT_SERVICES: Service[] = [
  { id: 101, name: "Corte Degradê", description: "Corte moderno com acabamento premium.", price_cents: 4500, duration_minutes: 45, is_active: true },
  { id: 102, name: "Barba Premium", description: "Modelagem completa com toalha quente.", price_cents: 3500, duration_minutes: 35, is_active: true },
  { id: 103, name: "Combo Corte + Barba", description: "Experiencia completa com finalizacao.", price_cents: 7000, duration_minutes: 70, is_active: true },
  { id: 104, name: "Corte Tradicional", description: "Aparência clássica e acabamento preciso.", price_cents: 3800, duration_minutes: 40, is_active: true },
  { id: 105, name: "Corte Infantil", description: "Corte confortável pensado para crianças.", price_cents: 3200, duration_minutes: 35, is_active: true },
  { id: 106, name: "Sobrancelha Premium", description: "Modelagem elegante com toque profissional.", price_cents: 2800, duration_minutes: 25, is_active: true },
  { id: 107, name: "Hidratação Capilar", description: "Tratamento nutritivo para fios mais saudáveis.", price_cents: 4200, duration_minutes: 50, is_active: true },
];
const DEFAULT_PROFESSIONALS: Professional[] = [
  { id: 301, user_id: 0, display_name: "Carlos Ferreira", bio: "Especialista em cortes modernos e degradê.", is_active: true },
  { id: 302, user_id: 0, display_name: "Rafael Souza", bio: "Barboterapia e acabamento premium.", is_active: true },
];

function apiError(status: number, message: string) {
  return Promise.reject({ response: { status, data: { message } } });
}

function withTimeout<T>(promise: Promise<T>, ms: number, message: string): Promise<T> {
  let t: ReturnType<typeof setTimeout> | undefined;
  const timeout = new Promise<T>((_, reject) => {
    t = setTimeout(() => reject(new Error(message)), ms);
  });
  return Promise.race([promise, timeout]).finally(() => {
    if (t) clearTimeout(t);
  });
}

function getCache<T>(key: string): T | null {
  const item = cacheStore[key];
  if (!item) return null;
  if (Date.now() > item.expiresAt) {
    delete cacheStore[key];
    return null;
  }
  return item.data as T;
}

function setCache<T>(key: string, data: T) {
  cacheStore[key] = { data, expiresAt: Date.now() + CACHE_TTL_MS };
}

async function loadLocalAppointments(): Promise<Appointment[]> {
  try {
    const raw = await AsyncStorage.getItem(APPOINTMENTS_KEY);
    const list = raw ? (JSON.parse(raw) as Appointment[]) : [];
    return Array.isArray(list) ? list : [];
  } catch {
    return [];
  }
}

async function saveLocalAppointments(list: Appointment[]) {
  await AsyncStorage.setItem(APPOINTMENTS_KEY, JSON.stringify(list));
}

async function withRetry<T>(operation: () => Promise<T>, retries = 1): Promise<T> {
  let lastError: unknown;
  for (let i = 0; i <= retries; i += 1) {
    try {
      return await operation();
    } catch (err) {
      lastError = err;
    }
  }
  throw lastError;
}

function firebaseAuthMessage(err: unknown, fallback: string) {
  const code = (err as { code?: string })?.code ?? "";
  const messages: Record<string, string> = {
    "auth/configuration-not-found":
      "Autenticacao por e-mail/senha nao esta ativa no Firebase. Ative em Authentication > Sign-in method > Email/Password.",
    "auth/email-already-in-use": "Este e-mail ja esta cadastrado.",
    "auth/invalid-email": "E-mail invalido.",
    "auth/weak-password": "Senha fraca. Use no minimo 6 caracteres.",
    "auth/invalid-credential": "Email ou senha invalidos.",
    "auth/user-not-found": "Email ou senha invalidos.",
    "auth/wrong-password": "Email ou senha invalidos.",
    "auth/too-many-requests": "Muitas tentativas. Aguarde alguns minutos.",
    "permission-denied":
      "Permissao negada no Firestore. Ajuste as regras (Firestore > Regras) para permitir escrita durante o desenvolvimento.",
  };
  return messages[code] ?? (err as { message?: string })?.message ?? fallback;
}

function asNumber(value: string) {
  const n = Number(value);
  return Number.isNaN(n) ? null : n;
}

function generateNumericId() {
  return Number(`${Date.now()}${Math.floor(Math.random() * 900 + 100)}`);
}

async function getCurrentUserOrThrow() {
  const user = useAuthStore.getState().user;
  if (!user) {
    throw { response: { status: 401, data: { message: "Nao autenticado." } } };
  }
  return user;
}

async function docByNumericId<T>(collectionName: string, id: number): Promise<T | null> {
  try {
    const snap = await withTimeout(
      getDoc(doc(db, collectionName, String(id))),
      FIREBASE_TIMEOUT_MS,
      `Timeout ao buscar ${collectionName}/${id}.`
    );
    if (snap.exists()) return snap.data() as T;

    const qs = await withTimeout(
      getDocs(query(collection(db, collectionName), where("id", "==", id))),
      FIREBASE_TIMEOUT_MS,
      `Timeout ao consultar ${collectionName}.`
    );
    return qs.empty ? null : (qs.docs[0].data() as T);
  } catch {
    return null;
  }
}

async function listAll<T>(collectionName: string): Promise<T[]> {
  const cached = getCache<T[]>(collectionName);
  if (cached) return cached;
  const qs = await withTimeout(
    getDocs(collection(db, collectionName)),
    READ_TIMEOUT_MS,
    `Timeout ao listar ${collectionName}.`
  );
  const data = qs.docs.map((x) => x.data() as T);
  setCache(collectionName, data);
  return data;
}

function buildSlotsForDay(dateISO: string, existing: Appointment[]) {
  void dateISO;
  const times: string[] = [];
  for (let h = 8; h < 12; h += 1) {
    times.push(`${String(h).padStart(2, "0")}:00`, `${String(h).padStart(2, "0")}:30`);
  }
  for (let h = 14; h < 18; h += 1) {
    times.push(`${String(h).padStart(2, "0")}:00`, `${String(h).padStart(2, "0")}:30`);
  }
  const busy = new Set(existing.map((a) => a.time));
  return times.map((time) => ({ time, available: !busy.has(time) }));
}

async function ensureReady() {
  // Seed em background apenas uma vez para não penalizar cada chamada.
  if ((globalThis as any).__barberSeedStarted) return;
  (globalThis as any).__barberSeedStarted = true;
  void withTimeout(ensureSeedData(), FIREBASE_TIMEOUT_MS, "Timeout no seed inicial.").catch(() => {});
}

export const api = {
  async get(path: string, config?: { params?: Record<string, unknown> }): ApiResponse<any> {
    if (path === "/services") {
      return { data: DEFAULT_SERVICES };
    }

    if (/^\/services\/\d+$/.test(path)) {
      await ensureReady();
      const id = asNumber(path.split("/")[2]);
      if (!id) return apiError(400, "Servico invalido.");
      const item = DEFAULT_SERVICES.find((s) => s.id === id) ?? null;
      if (!item) return apiError(404, "Servico nao encontrado.");
      return { data: item };
    }

    if (path === "/professionals") {
      return { data: DEFAULT_PROFESSIONALS };
    }

    if (/^\/professionals\/\d+$/.test(path)) {
      await ensureReady();
      const id = asNumber(path.split("/")[2]);
      if (!id) return apiError(400, "Profissional invalido.");
      const item = DEFAULT_PROFESSIONALS.find((p) => p.id === id) ?? null;
      if (!item) return apiError(404, "Profissional nao encontrado.");
      return { data: item };
    }

    if (/^\/professionals\/\d+\/availability$/.test(path)) {
      await ensureReady();
      const professionalId = asNumber(path.split("/")[2]);
      const date = String(config?.params?.date ?? "");
      if (!professionalId || !date) return apiError(400, "Dados invalidos.");

      const appointments = (await loadLocalAppointments()).filter(
        (x) =>
          x.professional_id === professionalId &&
          x.date === date &&
          (x.status === "scheduled" || x.status === "confirmed")
      );
      return { data: { slots: buildSlotsForDay(date, appointments) } };
    }

    if (path === "/products") {
      await ensureReady();
      let items: Product[] = [];
      try {
        items = await listAll<Product>("products");
      } catch {
        items = [];
      }
      if (!items.length) {
        return {
          data: [
            {
              id: 201,
              name: "Pomada Modeladora Fosca",
              description: "Fixacao forte e efeito natural.",
              price_cents: 3990,
              stock_qty: 30,
              sku: "POM-FOSCA-01",
              is_active: true,
            },
          ] satisfies Product[],
        };
      }
      return { data: items.filter((x) => x.is_active !== false) };
    }

    if (/^\/products\/\d+$/.test(path)) {
      await ensureReady();
      const id = asNumber(path.split("/")[2]);
      if (!id) return apiError(400, "Produto invalido.");
      const item = await docByNumericId<Product>("products", id);
      if (!item) return apiError(404, "Produto nao encontrado.");
      return { data: item };
    }

    if (path === "/my/appointments") {
      const me = await getCurrentUserOrThrow();
      const appointments = (await loadLocalAppointments()).filter((a) => a.client_user_id === me.id);
      const serviceMap = new Map(DEFAULT_SERVICES.map((s) => [s.id, s]));
      const proMap = new Map(DEFAULT_PROFESSIONALS.map((p) => [p.id, p]));

      return {
        data: appointments
          .sort((a, b) => (a.starts_at < b.starts_at ? 1 : -1))
          .map((a) => ({
            ...a,
            service: serviceMap.get(a.service_id),
            professional: proMap.get(a.professional_id),
          })),
      };
    }

    if (path === "/my/orders") {
      await ensureReady();
      const me = await getCurrentUserOrThrow();
      const qs = await withTimeout(
        getDocs(query(collection(db, "orders"), where("client_user_id", "==", me.id))),
        READ_TIMEOUT_MS,
        "Timeout ao carregar pedidos."
      );
      const orders = qs.docs.map((x) => x.data() as Order);
      const orderItems = await listAll<OrderItem>("order_items");
      const products = await listAll<Product>("products");
      const productMap = new Map(products.map((p) => [p.id, p]));
      return {
        data: orders
          .sort((a, b) => (a.created_at < b.created_at ? 1 : -1))
          .map((order) => ({
            ...order,
            items: orderItems
              .filter((it) => it.order_id === order.id)
              .map((it) => ({ ...it, product: productMap.get(it.product_id) })),
          })),
      };
    }

    if (path === "/auth/me") {
      const me = await getCurrentUserOrThrow();
      return { data: me };
    }

    return apiError(404, `Rota GET nao suportada: ${path}`);
  },

  async post(path: string, payload?: any): ApiResponse<any> {
    if (path === "/auth/register") {
      const name = String(payload?.name ?? "").trim();
      const email = String(payload?.email ?? "").trim().toLowerCase();
      const password = String(payload?.password ?? "");
      if (!name || !email || password.length < 6) {
        return apiError(422, "Dados de cadastro invalidos.");
      }

      try {
        const cred = await createUserWithEmailAndPassword(auth, email, password);
        try {
          const id = generateNumericId();
          const now = new Date().toISOString();
          const role = email.includes("barber") ? "professional" : "client";
          const user: AppUser = {
            id,
            uid: cred.user.uid,
            name,
            email,
            role,
            created_at: now,
            updated_at: now,
          };
          await withRetry(
            () =>
              withTimeout(
                setDoc(doc(db, "users", cred.user.uid), user),
                FIREBASE_TIMEOUT_MS,
                "Timeout ao salvar perfil no Firestore."
              ),
            1
          );
          const token = await withTimeout(
            cred.user.getIdToken(),
            FIREBASE_TIMEOUT_MS,
            "Timeout ao gerar token de login."
          );
          return { data: { token, user } };
        } catch (err: unknown) {
          // Evita usuario "orfao" no Auth caso o Firestore esteja bloqueando.
          try {
            await deleteUser(cred.user);
          } catch {}
          if ((err as { code?: string })?.code === "permission-denied") {
            return apiError(
              403,
              "Permissao negada no Firestore. Va em Firestore > Regras e permita escrita para testes."
            );
          }
          return apiError(500, firebaseAuthMessage(err, "Falha ao gravar usuario no Firestore."));
        }
      } catch (err: unknown) {
        return apiError(422, firebaseAuthMessage(err, "Falha ao cadastrar."));
      }
    }

    if (path === "/auth/login") {
      const email = String(payload?.email ?? "").trim().toLowerCase();
      const password = String(payload?.password ?? "");
      try {
        // 1) Autentica no Firebase Auth (se falhar aqui, é realmente credencial)
        const cred = await withTimeout(
          signInWithEmailAndPassword(auth, email, password),
          FIREBASE_TIMEOUT_MS,
          "Timeout ao autenticar. Verifique a conexao."
        );
        const token = await withTimeout(
          cred.user.getIdToken(),
          FIREBASE_TIMEOUT_MS,
          "Timeout ao gerar token de login."
        );

        // 2) Perfil no Firestore é "best-effort" (nao deve bloquear o login)
        const userRef = doc(db, "users", cred.user.uid);
        let user: AppUser | null = null;
        try {
          const userSnap = await withTimeout(getDoc(userRef), 8000, "Timeout ao ler usuario no Firestore.");
          user = userSnap.exists() ? (userSnap.data() as AppUser) : null;

          if (!user) {
            const id = generateNumericId();
            const now = new Date().toISOString();
            const role = email.includes("barber") ? "professional" : "client";
            user = {
              id,
              uid: cred.user.uid,
              name: cred.user.displayName ?? "Usuario",
              email,
              role,
              created_at: now,
              updated_at: now,
            };
            await withRetry(
              () => withTimeout(setDoc(userRef, user), 8000, "Timeout ao gravar usuario no Firestore."),
              1
            );
          }
        } catch (err: unknown) {
          // Fallback: libera login mesmo que Firestore esteja lento/instavel.
          const now = new Date().toISOString();
          user = {
            id: 0,
            uid: cred.user.uid,
            name: cred.user.displayName ?? "Usuario",
            email,
            role: "client",
            created_at: now,
            updated_at: now,
          };
        }

        return { data: { token, user } };
      } catch (err: unknown) {
        // Apenas falha de Auth deve cair aqui
        return apiError(401, firebaseAuthMessage(err, "Email ou senha invalidos."));
      }
    }

    if (path === "/auth/logout") {
      await withTimeout(signOut(auth), FIREBASE_TIMEOUT_MS, "Timeout ao sair da conta.");
      return { data: { ok: true } };
    }

    if (path === "/auth/forgot-password") {
      const email = String(payload?.email ?? "").trim().toLowerCase();
      if (!email) return apiError(422, "Informe um email válido.");
      try {
        await withTimeout(
          sendPasswordResetEmail(auth, email),
          FIREBASE_TIMEOUT_MS,
          "Timeout ao enviar email de redefinição."
        );
        return { data: { ok: true } };
      } catch (err: unknown) {
        return apiError(422, firebaseAuthMessage(err, "Não foi possível enviar o email de redefinição."));
      }
    }

    if (path === "/appointments") {
      const me = await getCurrentUserOrThrow();
      const serviceId = Number(payload?.service_id);
      const professionalId = Number(payload?.professional_id);
      const date = String(payload?.date ?? "");
      const time = String(payload?.time ?? "");
      const startsAt = String(payload?.starts_at ?? "");
      if (!serviceId || !professionalId || !date || !time || !startsAt) {
        return apiError(422, "Dados de agendamento invalidos.");
      }

      const localAppointments = await loadLocalAppointments();
      const hasConflict = localAppointments
        .some(
          (a) =>
            a.professional_id === professionalId &&
            a.date === date &&
            a.time === time &&
            (a.status === "scheduled" || a.status === "confirmed")
        );
      if (hasConflict) return apiError(422, "Horario indisponivel.");

      const id = generateNumericId();
      const now = new Date().toISOString();
      const appt: Appointment = {
        id,
        client_user_id: me.id,
        service_id: serviceId,
        professional_id: professionalId,
        date,
        time,
        starts_at: startsAt,
        status: "scheduled",
        created_at: now,
        updated_at: now,
      };

      await saveLocalAppointments([...localAppointments, appt]);
      // Sync remoto em background; não bloqueia o usuário.
      void addDoc(collection(db, "appointments"), appt).catch(() => {});

      return { data: appt };
    }

    if (path === "/orders") {
      const me = await getCurrentUserOrThrow();
      const items = Array.isArray(payload?.items) ? payload.items : [];
      const fulfillmentType = payload?.fulfillment_type;
      const paymentMethod = payload?.payment_method;
      if (!items.length || !fulfillmentType || !paymentMethod) {
        return apiError(422, "Dados de pedido invalidos.");
      }

      const products = await listAll<Product>("products");
      const productMap = new Map(products.map((p) => [p.id, p]));
      let total = 0;
      for (const line of items) {
        const product = productMap.get(Number(line.product_id));
        const quantity = Number(line.quantity);
        if (!product || quantity <= 0) return apiError(422, "Item de pedido invalido.");
        if (product.stock_qty < quantity) {
          return apiError(422, `Estoque insuficiente para ${product.name}.`);
        }
        total += product.price_cents * quantity;
      }

      const orderId = generateNumericId();
      const now = new Date().toISOString();
      const order: Order = {
        id: orderId,
        client_user_id: me.id,
        status: "new",
        total_cents: total,
        fulfillment_type: fulfillmentType,
        payment_method: paymentMethod,
        notes: payload?.notes ?? null,
        created_at: now,
        updated_at: now,
      };
      await withRetry(
        () =>
          withTimeout(
            setDoc(doc(db, "orders", String(orderId)), order),
            FIREBASE_TIMEOUT_MS,
            "Timeout ao salvar pedido."
          ),
        1
      );

      for (const line of items) {
        const product = productMap.get(Number(line.product_id))!;
        const quantity = Number(line.quantity);
        const itemId = generateNumericId();
        const orderItem: OrderItem = {
          id: itemId,
          order_id: orderId,
          product_id: product.id,
          quantity,
          unit_price_cents: product.price_cents,
          subtotal_cents: product.price_cents * quantity,
        };
        await withRetry(
          () =>
            withTimeout(
              setDoc(doc(db, "order_items", String(itemId)), orderItem),
              FIREBASE_TIMEOUT_MS,
              "Timeout ao salvar itens do pedido."
            ),
          1
        );
        await withTimeout(
          updateDoc(doc(db, "products", String(product.id)), {
            stock_qty: increment(-quantity),
          }),
          FIREBASE_TIMEOUT_MS,
          "Timeout ao atualizar estoque."
        );
      }

      return { data: order };
    }

    return apiError(404, `Rota POST nao suportada: ${path}`);
  },

  async delete(path: string): ApiResponse<any> {
    if (/^\/appointments\/\d+$/.test(path)) {
      const me = await getCurrentUserOrThrow();
      const id = asNumber(path.split("/")[2]);
      if (!id) return apiError(400, "Agendamento invalido.");
      const localAppointments = await loadLocalAppointments();
      const appointment = localAppointments.find((a) => a.id === id);
      if (!appointment) return apiError(404, "Agendamento nao encontrado.");
      if (appointment.client_user_id !== me.id) return apiError(403, "Operacao proibida.");
      await saveLocalAppointments(localAppointments.filter((a) => a.id !== id));
      // Best effort para remover no remoto.
      void (async () => {
        const qs = await getDocs(query(collection(db, "appointments"), where("id", "==", id)));
        await Promise.all(qs.docs.map((d) => deleteDoc(d.ref)));
      })().catch(() => {});
      return { data: { ok: true } };
    }

    return apiError(404, `Rota DELETE nao suportada: ${path}`);
  },
};
