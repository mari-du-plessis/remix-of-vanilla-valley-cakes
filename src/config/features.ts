/**
 * Feature flags for behaviour that is built but not yet switched on for
 * customers. Flipping one of these should never require code changes.
 */
export const FEATURE_FLAGS = {
  /**
   * When true, the customer order wizard refuses event dates that are blocked,
   * fully booked, or inside the configured lead time. The availability lookup
   * runs either way, so turning this on is a one-line change.
   */
  enforceOrderAvailability: false,
} as const;
