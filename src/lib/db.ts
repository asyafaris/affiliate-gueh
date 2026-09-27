import type { PrismaClient as PrismaClientType } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { getCloudflareContext } from "@opennextjs/cloudflare";

type PrismaModule = { PrismaClient: new (options: { adapter: PrismaPg }) => PrismaClientType };

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClientType };

function getWorkersEnv() {
  try {
    return getCloudflareContext().env as { HYPERDRIVE?: { connectionString: string } };
  } catch {
    return undefined; // not running on Cloudflare Workers
  }
}

function loadPrisma(onWorkers: boolean): PrismaModule {
  // Workers need the wasm build (no filesystem); Node uses the default build.
  /* eslint-disable @typescript-eslint/no-require-imports */
  return onWorkers ? require("@prisma/client/wasm") : require("@prisma/client");
  /* eslint-enable @typescript-eslint/no-require-imports */
}

export function getDb(): PrismaClientType {
  const workersEnv = getWorkersEnv();

  if (workersEnv) {
    // Workers cannot share I/O objects across requests, so build a client per call.
    const { PrismaClient } = loadPrisma(true);
    const connectionString = workersEnv.HYPERDRIVE?.connectionString ?? process.env.DATABASE_URL;
    return new PrismaClient({ adapter: new PrismaPg({ connectionString }) });
  }

  if (!globalForPrisma.prisma) {
    // Node's default 250ms per-address attempt timeout makes parallel connects to
    // multi-address hosts (e.g. Neon) fail with ETIMEDOUT on slower networks.
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    require("net").setDefaultAutoSelectFamilyAttemptTimeout?.(3000);
    const { PrismaClient } = loadPrisma(false);
    globalForPrisma.prisma = new PrismaClient({
      adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL })
    });
  }
  return globalForPrisma.prisma;
}
