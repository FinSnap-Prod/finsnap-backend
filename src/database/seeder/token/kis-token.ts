// src/database/seeder/token/kis-token.ts
import axios from 'axios';
import Redis from 'ioredis';
import * as dotenv from 'dotenv';

dotenv.config();

const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');

export async function getKisAccessToken(): Promise<string> {
  // 1. Redis에서 토큰 조회
  const cached = await redis.get('kis:access_token');
  if (cached) {
    console.log('Redis에서 토큰 재사용');
    return cached;
  }

  // 2. 없으면 KIS API로 토큰 발급
  const res = await axios.post(
    'https://openapi.koreainvestment.com:9443/oauth2/tokenP',
    {
      grant_type: 'client_credentials',
      appkey: process.env.KIS_APP_KEY,
      appsecret: process.env.KIS_APP_SECRET,
    },
  );
  const token = res.data.access_token;
  const expiresIn = res.data.expires_in || 86340; // 만료시간(초), 24시간

  // 3. Redis에 저장 (만료시간 설정)
  await redis.set('kis:access_token', token, 'EX', expiresIn - 60); // 만료 1분 전 자동 삭제
  console.log('KIS 토큰 발급 및 Redis 저장');
  return token;
}

// 테스트 실행
// getKisAccessToken().then((token) => {
//   console.log('토큰:', token);
//   process.exit(0);
// });
