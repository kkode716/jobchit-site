// Stands in for Tally so tests don't depend on its servers. The stub loadEmbeds does what the real one does.
export const stubTally = (target) => target.route('https://tally.so/**', (route) => {
  if (route.request().url().endsWith('/widgets/embed.js')) {
    return route.fulfill({
      contentType: 'text/javascript',
      body: "window.Tally = { loadEmbeds() { document.querySelectorAll('iframe[data-tally-src]').forEach((f) => { f.src = f.dataset.tallySrc; }); } };",
    });
  }
  return route.fulfill({ contentType: 'text/html', body: '<!doctype html><html lang="en"><title>Stub form</title><form aria-label="Stub form"><h1>Stub form</h1></form></html>' });
});
