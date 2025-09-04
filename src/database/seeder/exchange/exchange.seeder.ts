import { Injectable } from '@nestjs/common';
import axios from 'axios';
import { DataSource } from 'typeorm';
import { CurrencyCode } from 'src/database/entities/code/currency-code.entity';
import { ExchangeRateDaily } from 'src/database/entities/exchange/exchange-rate-daily.entity';
import { getKisAccessToken } from '../token/kis-token';

type RateRow = {
  rate_date: string; // YYYY-MM-DD (Asia/Seoul)
  open: string | null;
  high: string | null;
  low: string | null;
  close: string; // required
  source: string; // 'BITHUMB' | 'KIS'
  payload?: any;
};

@Injectable()
export class ExchangeSeeder {
  constructor(private readonly dataSource: DataSource) {}

  // KST 기준 날짜 문자열(YYYY-MM-DD) 생성
  private toSeoulDate(d: Date): string {
    return new Date(d.toLocaleString('en-US', { timeZone: 'Asia/Seoul' }))
      .toISOString()
      .slice(0, 10);
  }

  // 타임스탬프(ms) → KST 날짜 문자열
  private seoulDateFromTs(tsMs: number): string {
    return this.toSeoulDate(new Date(tsMs));
  }

  // 통화 코드 → currency_code.id 조회 (없으면 에러)
  private async resolveCurrencyId(code: string): Promise<number> {
    const repo = this.dataSource.getRepository(CurrencyCode);
    const row = await repo.findOne({ where: { currency_code: code } });
    if (!row) throw new Error(`CurrencyCode not found for ${code}`);
    return row.id;
  }

  // 단순 TypeORM upsert 사용 (가독성 우선)
  private async upsertDaily(
    baseCurrencyId: number,
    quoteCurrencyId: number,
    row: RateRow,
  ) {
    const repo = this.dataSource.getRepository(ExchangeRateDaily);
    await repo.upsert(
      {
        base_currency_id: baseCurrencyId,
        quote_currency_id: quoteCurrencyId,
        rate_date: row.rate_date,
        open: row.open,
        high: row.high,
        low: row.low,
        close: row.close,
        source: row.source,
        fetched_at: new Date(),
        payload: row.payload ?? null,
      },
      ['base_currency_id', 'quote_currency_id', 'rate_date'],
    );
  }

  // Bithumb USDT/KRW - ticker 기반(현재 스냅샷)
  // 요구사항: 하루 1회 요청으로 day, day-1 모두 업데이트
  // 구현: ticker에서
  //  - day: trade_date_kst의 날짜에 opening/high/low/trade_price 매핑
  //  - day-1: prev_closing_price만 close로 기록 (open/high/low는 null)
  private async fetchBithumbUsdtKrwDays(): Promise<RateRow[]> {
    const url = 'https://api.bithumb.com/v1/ticker?markets=KRW-USDT';
    const res = await axios.get(url, { timeout: 10000 });
    const arr = res.data;
    if (!Array.isArray(arr) || arr.length === 0) {
      throw new Error('Unexpected Bithumb ticker response');
    }
    const d = arr[0];

    const tradeDateKst: string = d.trade_date_kst; // e.g., '20250904'
    const fmt = (yyyymmdd: string) =>
      `${yyyymmdd.slice(0, 4)}-${yyyymmdd.slice(4, 6)}-${yyyymmdd.slice(6, 8)}`;
    const todayStr = fmt(tradeDateKst);

    // prev day 계산(KST 기준)
    const y = Number(tradeDateKst.slice(0, 4));
    const m = Number(tradeDateKst.slice(4, 6)) - 1; // zero-based
    const day = Number(tradeDateKst.slice(6, 8));
    const prevDate = new Date(Date.UTC(y, m, day));
    // Asia/Seoul 기준에서 하루 빼기 → UTC 자정 기준 -1d 후 다시 포맷
    prevDate.setUTCDate(prevDate.getUTCDate() - 1);
    const prevStr = this.toSeoulDate(prevDate);

    const rows: RateRow[] = [];

    // 오늘 데이터
    rows.push({
      rate_date: todayStr,
      open: d.opening_price != null ? String(d.opening_price) : null,
      high: d.high_price != null ? String(d.high_price) : null,
      low: d.low_price != null ? String(d.low_price) : null,
      close: String(d.trade_price),
      source: 'BITHUMB',
      payload: d,
    });

    // 전일 종가만 반영 (open/high/low는 정보 없음)
    if (d.prev_closing_price != null) {
      rows.push({
        rate_date: prevStr,
        open: null,
        high: null,
        low: null,
        close: String(d.prev_closing_price),
        source: 'BITHUMB',
        payload: { prev_only: true, base: d },
      });
    }

    return rows;
  }

  // KIS USD/KRW - 어제/오늘 데이터 수집
  // 요청 URL: https://openapi.koreainvestment.com:9443/uapi/overseas-price/v1/quotations/inquire-daily-chartprice
  // - 토큰: getKisAccessToken() 사용
  // - 헤더: Authorization: Bearer <token>, appkey, appsecret, tr_id(ENV로 주입 권장)
  // - 파라미터: 종목/통화코드 및 날짜(어제/오늘) — 구체 값은 ENV로 주입
  //   예) FID_INPUT_ISCD, FID_INPUT_DATE_1, FID_INPUT_DATE_2, FID_PERIOD_DIV_CODE='D' 등
  // - 응답 매핑: 일봉 배열에서 날짜/시가/고가/저가/종가 필드를 찾아 RateRow로 정규화
  private async fetchKisUsdKrwDays(): Promise<RateRow[]> {
    try {
      const token = await getKisAccessToken();
      const appkey = process.env.KIS_APP_KEY as string;
      const appsecret = process.env.KIS_APP_SECRET as string;
      if (!appkey || !appsecret) throw new Error('KIS keys missing');
      const trId = process.env.KIS_TR_ID_DAILY_CHART; // 예: FHKST03030100 (실전)
      const iscd = process.env.KIS_USD_KRW_ISCD; // KIS에서 요구하는 USD/KRW 코드
      if (!iscd) {
        throw new Error('KIS_USD_KRW_ISCD is not set (종목/통화 코드 필요)');
      }
      if (!trId) {
        throw new Error('KIS_TR_ID_DAILY_CHART is not set (헤더 tr_id 필수)');
      }

      const url =
        'https://openapi.koreainvestment.com:9443/uapi/overseas-price/v1/quotations/inquire-daily-chartprice';

      // 날짜 범위: 어제/오늘 (KST 기준)
      const today = this.toSeoulDate(new Date()); // YYYY-MM-DD
      const yesterday = this.toSeoulDate(new Date(Date.now() - 86400000));
      const ymd = (s: string) => s.replaceAll('-', ''); // YYYYMMDD

      // 기본 파라미터(단순 고정): 환율(X), 일봉(D), 어제~오늘
      const params: Record<string, any> = {
        FID_INPUT_ISCD: iscd,
        FID_INPUT_DATE_1: ymd(yesterday),
        FID_INPUT_DATE_2: ymd(today),
        FID_PERIOD_DIV_CODE: 'D',
        // 환율 조회 구분값: 'X' = 환율 (KIS 사양)
        FID_COND_MRKT_DIV_CODE: 'X',
      };

      const headers: Record<string, any> = {
        // 필수 헤더
        'content-type': 'application/json; charset=utf-8',
        authorization: `Bearer ${token}`,
        appkey,
        appsecret,
        tr_id: trId,
      };

      const resp = await axios.get(url, { params, headers, timeout: 10000 });
      const j = resp.data;
      if (j?.rt_cd && j.rt_cd !== '0') {
        throw new Error(
          `KIS error rt_cd=${j.rt_cd} msg=${j?.msg1 || j?.msg_cd}`,
        );
      }

      // 출력 배열: output2만 사용(단순화)
      const out = j?.output2;

      if (!out || !Array.isArray(out)) {
        throw new Error('KIS daily chart response not an array');
      }

      // 항목 -> RateRow 매핑 (KIS: ovrs_nmix_* 필드 사용)
      const fmtYmd = (yyyymmdd: string) =>
        `${yyyymmdd.slice(0, 4)}-${yyyymmdd.slice(4, 6)}-${yyyymmdd.slice(6, 8)}`;

      const rowsAll: RateRow[] = out.map((it: any) => {
        // 날짜: stck_bsop_date (YYYYMMDD)
        const rawDate: string = it.stck_bsop_date || '';
        const rateDate = rawDate.length === 8 ? fmtYmd(rawDate) : today;

        // 가격: ovrs_nmix_oprc/hgpr/lwpr/prpr
        const open = it.ovrs_nmix_oprc ?? null;
        const high = it.ovrs_nmix_hgpr ?? null;
        const low = it.ovrs_nmix_lwpr ?? null;
        const close = it.ovrs_nmix_prpr ?? null;

        if (close == null) {
          throw new Error('KIS chart item is missing close price');
        }
        return {
          rate_date: rateDate,
          open: open != null ? String(open) : null,
          high: high != null ? String(high) : null,
          low: low != null ? String(low) : null,
          close: String(close),
          source: 'KIS',
          payload: it,
        } as RateRow;
      });

      // 어제/오늘만 필터링 (없으면 있는 것만 사용)
      const set = new Set([yesterday, today]);
      const rows = rowsAll.filter((r) => set.has(r.rate_date));
      // 날짜가 명확치 않아 모두 today로 찍혔다면 중복 제거
      const map = new Map<string, RateRow>();
      for (const r of rows) map.set(r.rate_date, r);
      return Array.from(map.values());
    } catch (e) {
      console.warn('KIS fetch failed (stub in use):', e);
      return [];
    }
  }

  async run() {
    console.log('🚀 Exchange Seeder: start');

    // 통화 코드 ID 조회 (DB의 실제 ID 사용 보장)
    const baseUSD = await this.resolveCurrencyId('USD');
    const baseUSDT = await this.resolveCurrencyId('USDT');
    const quoteKRW = await this.resolveCurrencyId('KRW');

    // 1) Bithumb USDT/KRW (어제/오늘)
    try {
      const rows = await this.fetchBithumbUsdtKrwDays();
      for (const row of rows) {
        await this.upsertDaily(baseUSDT, quoteKRW, row);
        console.log(
          `✅ Upsert BITHUMB USDT/KRW ${row.rate_date} close=${row.close}`,
        );
      }
    } catch (e) {
      console.error('❌ Bithumb USDT/KRW failed:', e);
    }

    // 2) KIS USD/KRW (어제/오늘)
    try {
      const rows = await this.fetchKisUsdKrwDays();
      for (const row of rows) {
        await this.upsertDaily(baseUSD, quoteKRW, row);
        console.log(
          `✅ Upsert KIS USD/KRW ${row.rate_date} close=${row.close}`,
        );
      }
    } catch (e) {
      console.error('❌ KIS USD/KRW failed:', e);
    }

    console.log('✅ Exchange Seeder: done');
  }
}
