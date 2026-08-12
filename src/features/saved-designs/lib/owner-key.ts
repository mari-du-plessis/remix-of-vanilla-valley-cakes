/**
 * Anonymous, device-based ownership.
 *
 * Customers save designs before they ever have an account, so ownership is an
 * opaque, unguessable key held in this browser's localStorage. It is passed to
 * the server on every saved-design call and is the only thing that authorises
 * access to a row — the table itself is closed to the public API, so a key
 * cannot be enumerated or guessed from the client.
 *
 * When customer accounts ship, the same key becomes the claim token: signing
 * in simply attaches the browser's designs to the new customer record.
 */

const STORAGE_KEY = "vv.design-owner-key";

const randomKey = () => {
  const uuid = () =>
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : Math.random().toString(36).slice(2) + Date.now().toString(36);
  /* Two UUIDs: long enough that the key doubles as a bearer secret. */
  return `${uuid()}${uuid()}`.replace(/-/g, "");
};

/** The browser's owner key, created on first use. Empty during SSR. */
export function getOwnerKey(): string {
  if (typeof window === "undefined") return "";
  try {
    const existing = window.localStorage.getItem(STORAGE_KEY);
    if (existing && existing.length >= 24) return existing;
    const created = randomKey();
    window.localStorage.setItem(STORAGE_KEY, created);
    return created;
  } catch {
    /* private mode: designs simply cannot be saved on this device */
    return "";
  }
}
