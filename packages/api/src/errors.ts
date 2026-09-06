import type { CopyId } from '@critter-crumbs/shared';
export class HttpError extends Error {
  constructor(readonly status: number, readonly copyId: CopyId, readonly detail?: Record<string, unknown>, readonly headers?: Record<string, string>) { super(copyId); }
}
