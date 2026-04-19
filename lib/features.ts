/**
 * Collections are omitted from GET /api/content unless ENABLE_COLLECTIONS=true
 * (e.g. in .env.local). Keeps DB rows intact for an easy revert.
 */
export const collectionsEnabled = process.env.ENABLE_COLLECTIONS === 'true'
