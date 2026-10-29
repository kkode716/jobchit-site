// Print buttons, the pricing toggle and the landing page motion. Everything works or shows finished without this file.
import { formatMoney, countUpValue } from './money.js';

for (const button of document.querySelectorAll('[data-print]')) {
  button.hidden = false;
  button.addEventListener('click', () => window.print());
}

const PERIODS = {
  month: { price: '$24', unit: ' a month', note: 'Or $240 a year, which is two months free.' },
  year: { price: '$240', unit: ' a year', note: 'Or $24 a month, billed monthly.' },
};
const billing = document.querySelector('[data-billing]');
if (billing) {
  billing.hidden = false;
  billing.addEventListener('click', (e) => {
    const button = e.target.closest('[data-period]');
    if (!button) return;
    for (const b of billing.querySelectorAll('[data-period]')) b.setAttribute('aria-pressed', String(b === button));
    const p = PERIODS[button.dataset.period];
    document.querySelector('[data-price]').textContent = p.price;
    document.querySelector('[data-unit]').textContent = p.unit;
    document.querySelector('[data-note]').textContent = p.note;
  });
}

const root = document.querySelector('.lp-home');
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
if (root && !reduce && 'IntersectionObserver' in window) startMotion(root);

// Sections rise in once when a fifth of them is on screen; the signature waits for the middle of the screen.
// Anything already on screen at load shows finished, so nothing is ever blank.
function startMotion(root) {
  const stroke = root.querySelector('[data-reveal="sign"] .jc-sig__stroke');
  if (stroke) stroke.style.setProperty('--len', String(Math.ceil(stroke.getTotalLength())));
  root.querySelectorAll('.lp-w').forEach((w, i) => w.style.setProperty('--i', String(i)));
  root.querySelectorAll('[data-reveal="stagger"] > li').forEach((li, i) => li.style.setProperty('--n', String(i)));

  const onIn = (entries, observer) => {
    for (const e of entries) {
      if (!e.isIntersecting) continue;
      observer.unobserve(e.target);
      enter(e.target);
    }
  };
  const reveal = new IntersectionObserver(onIn, { threshold: 0.2 });
  const center = new IntersectionObserver(onIn, { rootMargin: '-45% 0px -45% 0px' });
  for (const el of root.querySelectorAll('[data-reveal]')) {
    const r = el.getBoundingClientRect();
    if (r.top < innerHeight && r.bottom > 0) {
      el.setAttribute('data-in', '');
      if (el.dataset.reveal === 'total') el.setAttribute('data-step', 'sum');
      continue;
    }
    el.setAttribute('data-wait', '');
    (el.dataset.reveal === 'sign' ? center : reveal).observe(el);
  }
  root.classList.add('lp-motion');
}

function enter(el) {
  el.removeAttribute('data-wait');
  el.setAttribute('data-in', '');
  if (el.dataset.reveal !== 'total') return;
  // The estimate: the sentence types in, the lines rise, then the total counts up from $0.
  setTimeout(() => el.setAttribute('data-step', 'type'), 0);
  setTimeout(() => el.setAttribute('data-step', 'lines'), 1600);
  setTimeout(() => {
    el.setAttribute('data-step', 'sum');
    countUp(el.querySelector('dd.jc-total__sum'));
  }, 2500);
}

function countUp(dd) {
  const end = Number(dd.textContent.replace(/[^0-9.]/g, ''));
  const start = performance.now();
  const frame = (now) => {
    const t = (now - start) / 900;
    dd.textContent = formatMoney(countUpValue(end, t));
    if (t < 1) requestAnimationFrame(frame);
  };
  requestAnimationFrame(frame);
}
