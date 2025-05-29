import dotenv from "dotenv";
import Redis from "ioredis";

class RedisService {
    private readonly redisClient: Redis;

    constructor() {
        this.redisClient = new Redis({
            host: dotenv.config().parsed?.REDIS_HOST || "localhost",
            port: parseInt(dotenv.config().parsed?.REDIS_PORT || "6379"),
            password: dotenv.config().parsed?.REDIS_PASSWORD,
        });

        this.redisClient.on("connect", () => {
            console.log("Connected to Redis.");
        });

        this.redisClient.on("error", (error) => {
            console.error("Redis error:", error);
        });
    }

    async setToken(
        token: string,
        userId: string,
        expiresIn: number,
    ): Promise<void> {
        await this.redisClient.set(token, userId, "EX", expiresIn);
    }

    async getUserIdByToken(token: string): Promise<string | null> {
        return this.redisClient.get(token);
    }

    async deleteToken(token: string): Promise<number> {
        return this.redisClient.del(token);
    }

    async tokenExists(token: string): Promise<boolean> {
        return (await this.redisClient.exists(token)) === 1;
    }

    async addAccessTokenToUser(
        userId: string,
        accessToken: string,
        expiresIn: number,
    ): Promise<void> {
        const key = `access_tokens:${userId}`;
        await this.redisClient.sadd(key, accessToken);
        await this.redisClient.expire(key, expiresIn);
    }

    async deleteAccessTokensByUserId(userId: string): Promise<number> {
        const key = `access_tokens:${userId}`;
        const tokens = await this.redisClient.smembers(key);
        if (tokens.length === 0) return 0;

        const deleteCount = await this.redisClient.del(...tokens);
        await this.redisClient.del(key);
        return deleteCount;
    }
}

export const redisService = new RedisService();
