export const PROVIDER_ROUTE_IDS = [
  'fireworks/deployment',
  'fireworks/serverless',
  'minimax/official',
  'xiaomi/official',
  'openrouter/novita/fp8',
  'infron/makora',
] as const

export type ProviderRouteId = (typeof PROVIDER_ROUTE_IDS)[number]

export const FIREWORKS_DEPLOYMENT_PROVIDER_ROUTE =
  'fireworks/deployment' satisfies ProviderRouteId
export const FIREWORKS_SERVERLESS_PROVIDER_ROUTE =
  'fireworks/serverless' satisfies ProviderRouteId
export const MINIMAX_OFFICIAL_PROVIDER_ROUTE =
  'minimax/official' satisfies ProviderRouteId
export const MIMO_NOVITA_PROVIDER_ROUTE =
  'openrouter/novita/fp8' satisfies ProviderRouteId
/**
 * Marks a session as diverted to the Infron fallback for DeepSeek V4 Flash. It
 * says *that* the session is on Infron, not which upstream serves it — routers
 * only compare it for equality, and the upstream list is looked up by model id
 * in `INFRON_PROVIDER_ORDER`. So repointing that list also fixes sessions
 * already pinned here. The `makora` in the name is historical (that upstream
 * went offline in 2026-07); renaming the value needs a migration, since it is
 * persisted in `free_session.provider_route` and read back unvalidated.
 */
export const DEEPSEEK_INFRON_MAKORA_PROVIDER_ROUTE =
  'infron/makora' satisfies ProviderRouteId
