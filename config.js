// Digital Rewards website settings. Fill these in before going live.
// Anything left empty is simply hidden on the site (no broken buttons).
window.DR_CONFIG = {
  // WhatsApp number in international format, digits only, e.g. "27821234567"
  whatsapp: "27732532235",
  // Phone number as people should see it, e.g. "082 123 4567"
  phone: "073 253 2235",
  email: "",
  hours: "",
  // Where the lead form posts (JSON, POST). Leave empty to send the lead by WhatsApp instead.
  leadEndpoint: "https://sentiv-proxy-production.up.railway.app/api/rewards/web-lead",
  // Google Analytics 4 measurement ID, e.g. "G-XXXXXXXXXX"
  ga4: "",
  // Meta Pixel ID, e.g. "123456789012345"
  metaPixel: "",
  // About page founder photo, e.g. "brand/founder.jpg" (portrait, about 4:5). Empty shows a "K" monogram.
  founderPhoto: "brand/founder.jpg"
};
