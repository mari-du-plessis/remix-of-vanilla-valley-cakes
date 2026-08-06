/**
 * Slug / key generation for catalog records.
 *
 * Slugs are an implementation detail the bakery owner should never have to
 * think about: every admin form derives one from the name and guarantees it is
 * unique within its table, appending `-2`, `-3`… when needed.
 */

export const slugify = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "") || `item-${Date.now()}`;

/**
 * A slug derived from `name` that does not collide with `taken`.
 * `currentSlug` (the record being edited) is always allowed.
 */
export function uniqueSlug(
  name: string,
  taken: string[],
  currentSlug?: string | null,
): string {
  const base = slugify(name);
  const used = new Set(taken.filter((slug) => slug && slug !== currentSlug));
  if (!used.has(base)) return base;
  let n = 2;
  while (used.has(`${base}-${n}`)) n += 1;
  return `${base}-${n}`;
}
