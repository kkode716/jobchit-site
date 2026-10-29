// SITE_URL is the origin only (https://jobchit.com or https://<user>.github.io); PATH_PREFIX adds any subpath.
export default {
  name: 'Jobchit',
  url: (process.env.SITE_URL || 'http://localhost:8080').replace(/\/$/, ''),
  // The business Gmail from TODO.md H5. Empty until it exists; the Pages workflow refuses to publish without it.
  contactEmail: process.env.CONTACT_EMAIL || '',
};
