export function formatBRLFromCents(cents?: number | null) {
  if (cents == null) return "Consulte";
  const value = cents / 100;
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}