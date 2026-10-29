// The printable templates. Each slug has a page in src/templates/ and a PDF built from it by scripts/pdf.mjs.
export default [
  {
    slug: 'change-order-remodelers',
    name: 'Change order for remodelers',
    summary: 'For kitchens, baths and bigger jobs: the change, the price and schedule effect, the new contract total and both signatures.',
  },
  {
    slug: 'change-order-handymen',
    name: 'Change order for handymen',
    summary: 'A shorter form for small jobs: what changes, the price, the new total and both signatures.',
  },
  {
    slug: 'estimate',
    name: 'Estimate',
    summary: 'Line items, subtotal, tax and total, with a line for the customer to sign.',
  },
];
