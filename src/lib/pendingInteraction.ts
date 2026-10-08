import { PendingInteraction } from '../types';

export const PENDING_INTERACTION_EXPIRATION_MS = 60000;

let currentPendingInteraction: PendingInteraction | null = null;

export function getPendingInteraction<T = any>(): PendingInteraction<T> | null {
  if (!currentPendingInteraction) return null;
  if (
    currentPendingInteraction.expiresAt &&
    Date.now() > currentPendingInteraction.expiresAt
  ) {
    currentPendingInteraction = null;
    return null;
  }
  return currentPendingInteraction as PendingInteraction<T>;
}

export function setPendingInteraction<T = any>(
  interaction: PendingInteraction<T> | null
): void {
  currentPendingInteraction = interaction;
}

export function clearPendingInteraction(): void {
  currentPendingInteraction = null;
}

export function createAmbiguityResolutionInteraction<T = any>(
  command: string,
  candidates: T[],
  options?: Partial<PendingInteraction<T>>
): PendingInteraction<T> {
  const now = Date.now();
  return {
    id: `pending-${now}-${Math.random().toString(36).slice(2, 7)}`,
    type: 'disambiguation',
    command,
    promptType: 'select',
    candidates,
    timestamp: now,
    expiresAt: now + PENDING_INTERACTION_EXPIRATION_MS,
    ...options,
  };
}
