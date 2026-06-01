export async function getCafePricesClient() {
  try {
    const res = await fetch("/api/cafes/precios", {
      cache: "no-store",
    });

    if (!res.ok) {
      return [];
    }

    return await res.json();
  } catch {
    return [];
  }
}