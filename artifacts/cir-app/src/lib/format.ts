export function formatCurrency(amount: number, currency: "USD" | "INR" = "INR") {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function truncateWallet(address: string) {
  if (!address || address.length < 15) return address;
  return `${address.slice(0, 8)}...${address.slice(-6)}`;
}

export function formatDate(dateStr: string) {
  if (!dateStr) return "N/A";
  return new Date(dateStr).toLocaleDateString("en-IN", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}