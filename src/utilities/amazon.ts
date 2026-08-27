/**
 * Builds an Amazon product URL with the affiliate tag applied.
 * Set AMAZON_TAG in .env (e.g. AMAZON_TAG=tecnofreak-02) to earn commissions;
 * without it links still work but are untagged.
 */
export function buildAmazonUrl(asin: string): string {
  const tag = process.env.AMAZON_TAG
  return `https://www.amazon.es/dp/${encodeURIComponent(asin)}${tag ? `?tag=${encodeURIComponent(tag)}` : ''}`
}
