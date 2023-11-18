import { RedisClientType } from "redis";

export interface Cursor {
    getLastCursor(): Promise<Date | undefined>;
}

export class RedisBackedCursor implements Cursor {
    constructor(
        private readonly redisClient: RedisClientType<any>,
        private readonly key: string
    ) {}

    async setCursor(date: Date): Promise<void> {
        this.redisClient.set(this.key, date.toISOString());
    }

    async getLastCursor(): Promise<Date | undefined> {
        const data = await this.redisClient.get(this.key);
        if (!data) {
            return undefined;
        }
        return new Date(data);
    }
}