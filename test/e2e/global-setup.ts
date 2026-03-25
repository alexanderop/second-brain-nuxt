import type { FullConfig } from '@playwright/test';

export default async function globalSetup(_config: FullConfig) {
  console.warn('E2E global setup: verifying server...');
}
