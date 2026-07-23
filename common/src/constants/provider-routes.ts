export const PROVIDER_ROUTE_IDS = [
  'fireworks/deployment',
  'fireworks/serverless',
  'minimax/official',
  'xiaomi/official',
  'openrouter/novita/fp8',
] as const

export type ProviderRouteId = (typeof PROVIDER_ROUTE_IDS)[number]

export const MIMO_NOVITA_PROVIDER_ROUTE =
  'openrouter/novita/fp8' satisfies ProviderRouteId
