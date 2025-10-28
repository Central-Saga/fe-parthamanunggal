export function formatRupiah(n: number): string {
  if (Number.isNaN(n) || n === null || n === undefined) return '0,00';
  try {
    return n.toLocaleString('id-ID', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  } catch {
    const f = Math.round((n + Number.EPSILON) * 100) / 100;
    return String(f);
  }
}