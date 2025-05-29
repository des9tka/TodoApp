import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import { redisService } from "./redisService";

const JWT_SECRET = dotenv.config().parsed?.JWT_SECRET || "your-secret-key";
const ACCESS_TOKEN_EXPIRES_IN = "12h";
const REFRESH_TOKEN_EXPIRES_IN = "24h";

class JwtService {
    async generateTokens(userId: string): Promise<{
        accessToken: string;
        refreshToken: string;
    }> {
        // Генерируем access-токен
        const accessToken = jwt.sign({ userId }, JWT_SECRET, {
            expiresIn: ACCESS_TOKEN_EXPIRES_IN,
        });

        // Генерируем refresh-токен
        const refreshToken = jwt.sign({ userId }, JWT_SECRET, {
            expiresIn: REFRESH_TOKEN_EXPIRES_IN,
        });

        // Сохраняем access-токен в Redis (в множестве для userId и как ключ)
        await redisService.setToken(
            accessToken,
            userId,
            12 * 60 * 60,
        );
        await redisService.addAccessTokenToUser(userId, accessToken, 12 * 60 * 60);

        // Сохраняем refresh-токен в Redis
        await redisService.setToken(
            refreshToken,
            userId,
            24 * 60 * 60,
        );

        return { accessToken, refreshToken };
    }

    async verifyToken(token: string): Promise<{ userId: string } | null> {
        try {
            const exists = await redisService.tokenExists(token);
            if (!exists) return null;

            const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
            return decoded;
        } catch (error) {
            return null;
        }
    }

    async invalidateToken(token: string): Promise<void> {
        await redisService.deleteToken(token);
    }

    async refreshTokens(refreshToken: string): Promise<{
        accessToken: string;
        refreshToken: string;
    } | null> {
        try {
            // Проверяем валидность refresh-токена
            const decoded = await this.verifyToken(refreshToken);
            if (!decoded) {
                return null; // Токен невалиден или отсутствует
            }

            const exists = await redisService.tokenExists(refreshToken);
            if (!exists) {
                return null; // Токен не найден в Redis
            }

            const userId = decoded.userId;
            await this.invalidateToken(refreshToken);

            await redisService.deleteAccessTokensByUserId(userId);

            const newTokens = await this.generateTokens(userId);
            return newTokens;
        } catch (error) {
            return null;
        }
    }
}

export const jwtService = new JwtService();