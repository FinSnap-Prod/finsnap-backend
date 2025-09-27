export class GetCategoriesSummaryResponseDto {
  success: boolean;
  message: string;
  data: GetPortfolioData;
}

export class GetPortfolioData {
  portfolio: GetPortfolioInfo;
  fx: Record<string, number>;
  categories: CategoryItem[];
  assets: AssetItem[];
}

export class GetPortfolioInfo {
  portfolio_id: number;
  portfolio_name: string;
  portfolio_currency: string;
  display_currency: string;
  valuation_timestamp: string;
  sorted_by: string;
}

export class CategoryItem {
  category_id: number;
  category_name: string;
}

export class AssetItem {
  asset_id: number;
  category_id: number;
  category_name: string;
  asset_name: string;
  native: AssetNative;
  conversion: Record<string, ConvertedAmount>;
}

// 네이티브(원화/달러) 기준 값
export class AssetNative {
  currency: string; // 예: "KRW" | "USD"
  price: number;
  avg_price: number;
  quantity: number; // 입력의 quntity는 서버에서 quantity로 매핑 권장
  purchase_amount: number; // 매입 금액
  eval_amount: number; // 평가 금액
  profit_amount: number; // 손익액
  profit_rate: number; // 손익률(소수) 예: 0.1 => 10%
}

// 환산 값(표시 통화 기준)
export class ConvertedAmount {
  fx_pair?: string; // 예: "USD/KRW" (해외자산 환산 시 존재)
  fx_rate?: number; // 예: 1350.10
  price: number;
  avg_price: number;
  purchase_amount: number;
  eval_amount: number;
  profit_amount: number;
}
