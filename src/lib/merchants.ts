export const MERCHANT_STYLES: Record<string, { bg: string; mark: string }> = {
  Shopee: { bg: "#ee4d2d", mark: "S" },
  Tokopedia: { bg: "#03ac0e", mark: "T" },
  Lazada: { bg: "#0f146d", mark: "L" },
  Blibli: { bg: "#0095da", mark: "B" },
  "TikTok Shop": { bg: "#000000", mark: "T" }
};

export function merchantStyle(merchantName: string) {
  return MERCHANT_STYLES[merchantName] ?? { bg: "#10b981", mark: merchantName.charAt(0).toUpperCase() || "?" };
}
