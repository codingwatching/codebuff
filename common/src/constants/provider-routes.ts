export const PROVIDER_ROUTE_IDS = [
  'fireworks/deployment',
  'fireworks/serverless',
  'minimax/official',
  'xiaomi/official',
  'openrouter/novita/fp8',
  'mimo/openrouter',
  'infron/makora',
] as const

export type ProviderRouteId = (typeof PROVIDER_ROUTE_IDS)[number]

export const FIREWORKS_DEPLOYMENT_PROVIDER_ROUTE =
  'fireworks/deployment' satisfies ProviderRouteId
export const FIREWORKS_SERVERLESS_PROVIDER_ROUTE =
  'fireworks/serverless' satisfies ProviderRouteId
export const MINIMAX_OFFICIAL_PROVIDER_ROUTE =
  'minimax/official' satisfies ProviderRouteId
/**
 * Marks a MiMo session as diverted off Xiaomi's direct API to the OpenRouter
 * lane. Like {@link DEEPSEEK_INFRON_MAKORA_PROVIDER_ROUTE} it says *that* the
 * session is on the fallback, NOT which upstream serves it — that is
 * {@link MIMO_OPENROUTER_UPSTREAM} below, so repointing it also moves every
 * session already pinned here, with no migration.
 *
 * Named generically on purpose. Its predecessor
 * {@link MIMO_NOVITA_PROVIDER_ROUTE} baked the upstream into a value that gets
 * persisted in `free_session.provider_route` and read back unvalidated, so
 * changing upstreams meant either a migration or a name that lies.
 */
export const MIMO_OPENROUTER_PROVIDER_ROUTE =
  'mimo/openrouter' satisfies ProviderRouteId
/**
 * The upstreams that serve {@link MIMO_OPENROUTER_PROVIDER_ROUTE}, preferred
 * first: Xiaomi's OWN endpoint, reached through OpenRouter's account rather
 * than our direct API key, with Novita behind it purely as depth.
 *
 * It lives next to the route id because the two are meant to be read together —
 * the id says which lane a session is pinned to, this says who serves it — and
 * in `common/` rather than in mimo-router.ts so `scripts/mimo-smoke.ts` can
 * assert against the REAL value without importing the billing chain. A smoke
 * test that restates this config would keep passing after the upstream moved,
 * reporting a lane it no longer covers.
 *
 * Novita served the lane until 2026-08-01, which was most of what made the
 * fallback expensive. Measured over 6h of prod that day, attributing rows by
 * whether their cost reproduces our Xiaomi formula:
 *
 *   openrouter/novita   18,268 reqs (42.6%)  19.2% cache  $364.11  $0.138/M in
 *   xiaomi direct       24,631 reqs (57.4%)  90.5% cache   $63.76  $0.018/M in
 *
 * Novita is also 20% dearer per token before caching ($0.168/$0.336 against
 * Xiaomi's $0.14/$0.28) and prices cache reads at $0.0034/M against $0.0028/M.
 * Xiaomi's OpenRouter endpoint is priced identically to our direct rate, so the
 * lane costs the same as the primary and differs only in whose rate limit and
 * prompt cache it draws on — which is the entire point of having it.
 */
export const MIMO_OPENROUTER_UPSTREAM_ORDER = [
  'xiaomi/fp8',
  'novita/fp8',
] as const

/**
 * Fresh OpenRouter `provider` block for the MiMo lane.
 *
 * TWO ENTRIES DELIBERATELY, and it must never go back to one. A pinned session
 * has no health check and no un-pin path — `routeWithStickyFallback` short
 * -circuits straight to the fallback — so if the lane's only upstream is down,
 * one transient Xiaomi blip wedges every remaining request in that session
 * rather than degrading a single one. That is not hypothetical: a one-deep pin
 * on DeepSeek's Infron lane took out 1,160 requests across 191 users for ~32h
 * when `makora` went offline (2026-07-26/27, fixed in #1045).
 *
 * Verified live on this lane 2026-08-01: within an `allow_fallbacks:false`
 * order list, an unroutable first entry is SKIPPED rather than failing the
 * request — `order:['nosuchprovider','xiaomi/fp8']` returned 200 from Xiaomi —
 * while `order:['xiaomi/fp8','novita/fp8']` still serves from Xiaomi when it is
 * healthy. So the depth costs nothing in the normal case and is the difference
 * between a degraded session and a wedged one in the bad case. Novita is second
 * because it is the best-understood host for this model: it served ~43% of MiMo
 * traffic through late July, so its compatibility with our request shape is
 * proven, and it only ever serves when Xiaomi cannot.
 *
 * Returns a NEW object with a NEW array every call. These arrays get aliased
 * into an outgoing request body, and this file's peer
 * `INFRON_PROVIDER_ORDER` was made copy-on-assignment in #1045 for exactly that
 * reason — one downstream mutation would corrupt routing process-wide.
 */
export function mimoOpenRouterProvider(): Record<string, unknown> {
  return {
    order: [...MIMO_OPENROUTER_UPSTREAM_ORDER],
    allow_fallbacks: false,
  }
}
/**
 * LEGACY MiMo fallback pin, written while the OpenRouter lane was hardcoded to
 * Novita FP8. Still recognized on READ so sessions pinned before
 * {@link MIMO_OPENROUTER_PROVIDER_ROUTE} shipped keep serving from the fallback
 * instead of silently reverting to a Xiaomi-direct attempt they already failed.
 * Never written anymore; expires with its session.
 */
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
