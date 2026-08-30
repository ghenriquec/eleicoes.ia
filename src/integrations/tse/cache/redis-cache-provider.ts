import type { CacheProvider } from "./cache-provider";

/**
 * Import dinâmico do ioredis — evita puxar o cliente Redis (e tentar
 * conectar) em ambientes sem REDIS_URL configurado (ex. dev local sem
 * Redis, build de produção sem a env ainda setada).
 */
export class RedisCacheProvider implements CacheProvider {
  private clientPromise: Promise<import("ioredis").Redis> | null = null;

  constructor(private readonly redisUrl: string) {}

  private async client() {
    if (!this.clientPromise) {
      this.clientPromise = import("ioredis").then((mod) => {
        const RedisCtor = mod.default;
        return new RedisCtor(this.redisUrl, { lazyConnect: false, maxRetriesPerRequest: 2 });
      });
    }
    return this.clientPromise;
  }

  async get<T>(key: string): Promise<T | null> {
    const client = await this.client();
    const raw = await client.get(key);
    return raw ? (JSON.parse(raw) as T) : null;
  }

  async set<T>(key: string, value: T, ttlSeconds: number): Promise<void> {
    const client = await this.client();
    await client.set(key, JSON.stringify(value), "EX", ttlSeconds);
  }

  async del(key: string): Promise<void> {
    const client = await this.client();
    await client.del(key);
  }
}
