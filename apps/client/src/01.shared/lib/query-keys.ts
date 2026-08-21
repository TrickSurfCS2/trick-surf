export const queryKeys = {
  maps: ['maps'] as const,
  tricks: (mapId?: number) => ['tricks', mapId] as const,
  triggers: (mapId?: number) => ['triggers', mapId] as const,
}
