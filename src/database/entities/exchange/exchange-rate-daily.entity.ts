import { Entity, PrimaryGeneratedColumn, Column, Unique } from 'typeorm';

// 환율 일별 스냅샷 엔티티
// - 목적: USD/KRW, USDT/KRW 등 KRW 기준 일일 환율 저장
// - 키: (base_currency_id, quote_currency_id, rate_date) 유니크로 멱등 업서트
// - 주의: numeric은 정밀도 보존을 위해 string으로 다룸
@Entity('exchange_rate_daily')
@Unique(['base_currency_id', 'quote_currency_id', 'rate_date'])
export class ExchangeRateDaily {
  @PrimaryGeneratedColumn()
  id: number;

  // 기준통화(USD, USDT) -> currency_code.id
  @Column({ type: 'int' })
  base_currency_id: number;

  // 상대통화(KRW) -> currency_code.id
  @Column({ type: 'int' })
  quote_currency_id: number;

  // 스냅샷 일자 (Asia/Seoul 기준 YYYY-MM-DD)
  @Column({ type: 'date' })
  rate_date: string;

  @Column({ type: 'numeric', precision: 20, scale: 10, nullable: true })
  open: string | null;

  @Column({ type: 'numeric', precision: 20, scale: 10, nullable: true })
  high: string | null;

  @Column({ type: 'numeric', precision: 20, scale: 10, nullable: true })
  low: string | null;

  @Column({ type: 'numeric', precision: 20, scale: 10 })
  close: string;

  // 데이터 출처(KIS, BITHUMB 등)
  @Column({ type: 'varchar', length: 20, nullable: true })
  source: string | null;

  // 수집 시각
  @Column({ type: 'timestamptz', nullable: true })
  fetched_at: Date | null;

  // 원본 API 응답 저장
  @Column({ type: 'jsonb', nullable: true })
  payload: Record<string, any> | null;
}

