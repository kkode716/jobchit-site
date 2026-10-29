// Claims the site must never make (PRODUCT.md Brand Commitments, DECISION.md R3): legal status,
// compliance, guarantees, e-signature validity and penalties. Matched case-insensitively on raw HTML.
export const BANNED = [
  'legally binding',
  'compliant',
  'compliance',
  'guarantee',
  'meets california law',
  'legally valid',
  'enforceable',
  'holds up in court',
  'admissible',
  'esign act',
  'ueta',
  'penalt',
];

export function findBanned(text) {
  const flat = text.toLowerCase().replace(/\s+/g, ' ');
  return BANNED.filter((phrase) => flat.includes(phrase));
}
