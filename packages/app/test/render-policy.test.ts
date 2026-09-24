import { expect, test } from 'vitest';
import { createRenderPolicy } from '../src/sim/render-policy.js';

test('sustained slow rendering steps down at 2, then 3, then 5 seconds without loosening the scene budget', () => {
  const policy = createRenderPolicy(1.5);
  policy.ready();
  policy.sample(0, 34); policy.sample(1999, 34);
  expect(policy.snapshot().dpr).toBe(1.5);
  policy.sample(2000, 34);
  expect(policy.snapshot()).toMatchObject({ dpr: 1, idle: false, antialias: true, crumbLimit: 64, phase: 'active' });
  policy.sample(2001, 51); policy.sample(5000, 51);
  expect(policy.snapshot().antialias).toBe(true);
  policy.sample(5001, 51);
  expect(policy.snapshot()).toMatchObject({ antialias: false, crumbLimit: 8, phase: 'active' });
  policy.sample(5002, 51); policy.sample(10001, 51);
  expect(policy.snapshot().phase).toBe('active');
  policy.sample(10002, 51);
  expect(policy.snapshot()).toMatchObject({ phase: 'fallback', notice: 'fallback.midSession' });
  expect(policy.takeAnnouncement()).toBe('fallback.midSession');
  expect(policy.takeAnnouncement()).toBeNull();
});

test('good frames and a paused interval reset only the current sustained window', () => {
  const policy = createRenderPolicy(2); policy.ready();
  policy.sample(0, 34); policy.sample(1900, 33); policy.sample(2000, 34); policy.sample(3900, 34);
  expect(policy.snapshot().tier).toBe(0);
  policy.pause(); policy.sample(100000, 34); policy.sample(101999, 34);
  expect(policy.snapshot().tier).toBe(0);
  policy.sample(102000, 34); expect(policy.snapshot().tier).toBe(1);
  policy.sample(102001, 51); policy.sample(104900, 50); policy.sample(105000, 51); policy.sample(107999, 51);
  expect(policy.snapshot().tier).toBe(1);
  policy.sample(108000, 51); expect(policy.snapshot().tier).toBe(2);
});

test('context restore has a two-second deadline and a failed retry is offered only once in the session', () => {
  const policy = createRenderPolicy(2); policy.ready();
  policy.lost(100); expect(policy.snapshot().phase).toBe('lost');
  policy.check(2099); expect(policy.snapshot().phase).toBe('lost');
  policy.restored(2099); expect(policy.snapshot().phase).toBe('active');
  policy.lost(3000); policy.check(4999); expect(policy.snapshot().phase).toBe('lost');
  policy.check(5000); expect(policy.snapshot().phase).toBe('fallback');
  policy.restored(5001); expect(policy.snapshot().phase).toBe('fallback');
  expect(policy.takeAnnouncement()).toBe('fallback.midSession');
  expect(policy.retry()).toBe(true); expect(policy.snapshot()).toMatchObject({ phase: 'loading', retryAvailable: false });
  policy.failed(); expect(policy.snapshot()).toMatchObject({ phase: 'fallback', retryAvailable: false });
  expect(policy.retry()).toBe(false); expect(policy.takeAnnouncement()).toBeNull();
});

test('initial load failure retains portraits and does not announce a mid-session loss', () => {
  const policy = createRenderPolicy(2); policy.failed();
  expect(policy.snapshot()).toMatchObject({ phase: 'fallback', notice: 'fallback.initial', retryAvailable: true });
  expect(policy.takeAnnouncement()).toBeNull();
  policy.ready(); expect(policy.snapshot().phase).toBe('fallback');
  expect(policy.retry()).toBe(true); policy.ready();
  expect(policy.snapshot()).toMatchObject({ phase: 'active', notice: null, retryAvailable: false });
  policy.lost(0); policy.restored(2000);
  expect(policy.snapshot().phase).toBe('fallback');
  expect(policy.takeAnnouncement()).toBe('fallback.midSession');
  expect(policy.retry()).toBe(false);
});
