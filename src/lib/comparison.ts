export type VerdictProduct = {
  id: string;
  name: string;
  priceEstimate: number;
  bestFor: string;
  editorialSummary: string;
  prosCons: { type: "PRO" | "CON"; content: string }[];
};

export type ComparisonVerdict = {
  worthIt?: VerdictProduct;
  budget?: VerdictProduct;
  seriousWork?: VerdictProduct;
  minimalSetup?: VerdictProduct;
  fewestCompromises?: VerdictProduct;
  summary: string;
  notes: string[];
};

function textScore(product: VerdictProduct, keywords: string[]) {
  const text = `${product.name} ${product.bestFor} ${product.editorialSummary}`.toLowerCase();
  return keywords.reduce((score, keyword) => score + (text.includes(keyword) ? 1 : 0), 0);
}

function valueScore(product: VerdictProduct) {
  const pros = product.prosCons.filter((item) => item.type === "PRO").length;
  const cons = product.prosCons.filter((item) => item.type === "CON").length;
  const pricePenalty = Math.max(product.priceEstimate, 1) / 1000000;
  return pros * 2 - cons - pricePenalty;
}

function compromiseScore(product: VerdictProduct) {
  const pros = product.prosCons.filter((item) => item.type === "PRO").length;
  const cons = product.prosCons.filter((item) => item.type === "CON").length;
  return pros * 2 - cons * 2;
}

function pickHighest(products: VerdictProduct[], score: (product: VerdictProduct) => number) {
  return [...products].sort((a, b) => score(b) - score(a))[0];
}

export function generateComparisonVerdict(products: VerdictProduct[]): ComparisonVerdict {
  if (products.length < 2) {
    return {
      summary: "Pilih minimal dua produk dari kategori yang sama untuk melihat verdict.",
      notes: ["Perbandingan lebih relevan ketika produk berasal dari kategori yang sama."]
    };
  }

  const budget = [...products].sort((a, b) => a.priceEstimate - b.priceEstimate)[0];
  const worthIt = pickHighest(products, valueScore);
  const seriousWork = pickHighest(products, (product) =>
    textScore(product, ["kerja", "wfh", "meeting", "produktif", "harian", "serius"]) * 3 + valueScore(product)
  );
  const minimalSetup = pickHighest(products, (product) =>
    textScore(product, ["minimalis", "ringkas", "kecil", "portable", "rapi", "kos"]) * 3 + valueScore(product)
  );
  const fewestCompromises = pickHighest(products, compromiseScore);

  return {
    worthIt,
    budget,
    seriousWork,
    minimalSetup,
    fewestCompromises,
    summary: `Jika ingin pilihan paling seimbang, mulai dari ${worthIt.name}. Kalau prioritas utama adalah menekan budget, ${budget.name} lebih masuk akal untuk dicek dulu.`,
    notes: [
      `${worthIt.name} terlihat paling worth it dari kombinasi harga, jumlah kelebihan, dan kompromi yang tercatat.`,
      `${budget.name} punya estimasi harga paling rendah di daftar pilihan ini.`,
      `${fewestCompromises.name} memiliki kompromi paling sedikit berdasarkan data pros dan cons yang tersedia.`
    ]
  };
}
