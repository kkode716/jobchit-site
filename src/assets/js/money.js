// Money formatting and the count-up curve for the estimate demo on the landing page.
export const formatMoney = (n) => '$' + n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

// Cubic ease-out from 0 to `end` as t runs from 0 to 1.
export const countUpValue = (end, t) => end * (1 - (1 - Math.min(1, Math.max(0, t))) ** 3);
