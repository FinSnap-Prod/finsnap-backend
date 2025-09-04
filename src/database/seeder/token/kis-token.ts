import axios from 'axios';
import Redis from 'ioredis';
import * as dotenv from 'dotenv';

dotenv.config();

// 주의: 기존 kis-token.ts는 임포트 시 즉시 실행 코드를 포함하므로, seeder에서는 이 유틸을 사용하세요.
// 사용처: getKisAccessToken() → Bearer 토큰 문자열 반환

let redis: Redis | null = null;
try {
  if (process.env.REDIS_URL) {
    redis = new Redis(process.env.REDIS_URL);
  }
} catch (e) {
  // Redis 연결 실패는 치명적이지 않으므로 무시(로그만)
  console.warn('WARN: Redis init failed for KIS token cache:', e);
}

export async function getKisAccessToken(): Promise<string> {
  const cacheKey = 'kis:access_token';

  // 1) Redis 캐시 조회
  if (redis) {
    try {
      const cached = await redis.get(cacheKey);
      if (cached) return cached;
    } catch (e) {
      console.warn('WARN: Redis get failed for KIS token:', e);
    }
  }

  // 2) 토큰 발급
  const appkey = process.env.KIS_APP_KEY;
  const appsecret = process.env.KIS_APP_SECRET;
  if (!appkey || !appsecret) {
    throw new Error('KIS_APP_KEY/KIS_APP_SECRET is not set');
  }

  const res = await axios.post(
    'https://openapi.koreainvestment.com:9443/oauth2/tokenP',
    {
      grant_type: 'client_credentials',
      appkey,
      appsecret,
    },
    { timeout: 10000 },
  );

  const token: string = res.data?.access_token;
  const expiresIn: number = res.data?.expires_in || 86340; // 초 단위
  if (!token) throw new Error('Failed to retrieve KIS access token');

  // 3) 캐시 저장
  if (redis) {
    try {
      await redis.set(cacheKey, token, 'EX', Math.max(60, expiresIn - 60));
    } catch (e) {
      console.warn('WARN: Redis set failed for KIS token:', e);
    }
  }

  return token;
}
