/**
 * Template reference — the smallest possible link back to a Vanilla Valley
 * template.
 *
 * It lives in its own dependency-free module because the order form, saved
 * designs and the templates feature all carry it. Only identity travels with
 * the customer's design: the configuration itself is copied, so the original
 * template can never be modified by a customer, and a deleted template never
 * breaks an existing design or a historical order.
 */

export type TemplateReference = {
  id: string;
  slug: string;
  name: string;
};
