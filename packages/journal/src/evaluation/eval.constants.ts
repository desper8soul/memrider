/**
 * Baked-in user row from DB migration — all eval seed entries use this id.
 * Retrieval eval calls search(EVAL_SEED_USER_ID) (same path as production; no auth).
 */
export const EVAL_SEED_USER_ID = 'eval-system-user';
