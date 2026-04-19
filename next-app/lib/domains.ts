// Work-email domain allow-list. Start narrow; expand via AllowedDomain table later.
// Rule of thumb: only corporate or .edu addresses for known photonics-adjacent employers.
// Personal providers (gmail, outlook, yahoo, proton, icloud, hotmail) are blocked.

const BLOCKED = new Set([
  "gmail.com", "googlemail.com",
  "outlook.com", "hotmail.com", "live.com", "msn.com",
  "yahoo.com", "ymail.com",
  "icloud.com", "me.com",
  "proton.me", "protonmail.com",
  "aol.com", "zoho.com", "mail.com", "gmx.com",
  "pm.me", "duck.com", "fastmail.com",
]);

// Seed list of photonics / optics / semi-adjacent domains we trust out of the gate.
// Keep intentionally boring — extend as real users ask.
export const SEED_ALLOWED = [
  // module / optics OEMs
  "coherent.com", "lumentum.com", "ciena.com", "infinera.com", "adtran.com",
  "iipd.com", "ams-osram.com", "ficontec.com", "marvell.com", "broadcom.com",
  "nvidia.com", "intel.com", "cisco.com", "nokia.com", "ericsson.com",
  // foundries / EDA
  "tsmc.com", "globalfoundries.com", "smart-photonics.com", "amf.com.sg",
  "synopsys.com", "cadence.com", "siemens.com",
  // national labs + common .edu stems (use table for specific universities)
  "llnl.gov", "lanl.gov", "ornl.gov", "sandia.gov", "lbl.gov", "nist.gov",
];

export function domainOf(email: string): string {
  const at = email.lastIndexOf("@");
  if (at < 0) return "";
  return email.slice(at + 1).trim().toLowerCase();
}

export function isBlockedDomain(domain: string): boolean {
  return BLOCKED.has(domain);
}

export function isEduDomain(domain: string): boolean {
  return /\.edu$/.test(domain) || /\.ac\.[a-z]{2,}$/.test(domain);
}
