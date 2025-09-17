# Cash Module Progress Snapshot — 2025-09-08

## Done
- T3: POST cash transactions (normal/exchange)
- T4: GET cash balances (filters/sort)
- T5: GET cash transactions (filters/sort/paging, type=exchange alias)
- T6: DELETE cash transactions (single and exchange group)
- T7: PUT cash transactions
  - Single: rollback old effect → apply new effect; supports type/amount/currency/recorded_at/memo; exchange legs blocked
  - Exchange group: rollback existing group → re-create with same exchange_group_id; avg_rate maintenance; guards added

## Endpoints
- GET `/portfolios/:portfolio_id/cash/balances`
- GET `/portfolios/:portfolio_id/institutions/:institution_id/cash/transactions`
- POST `/portfolios/:portfolio_id/institutions/:institution_id/cash/transactions`
- DELETE `/portfolios/:portfolio_id/institutions/:institution_id/cash/transactions/:id`
- DELETE `/portfolios/:portfolio_id/institutions/:institution_id/cash/transactions?exchange_group_id=EX-*`
- PUT `/portfolios/:portfolio_id/institutions/:institution_id/cash/transactions/:id`
- PUT `/portfolios/:portfolio_id/institutions/:institution_id/cash/transactions?exchange_group_id=EX-*`

## Key Guards
- Balance non-negative: conditional UPDATE with `balance >= amount` and RETURNING
- Exchange group integrity: must contain exactly exchange_out + exchange_in
- Ownership validation for all modifying routes
- ValidationPipe: whitelist/forbidNonWhitelisted

## Known Policies
- Base currency id: 1 (KRW)
- Exchange update implemented as delete+create (atomic)
- avg_rate maintained on base↔foreign exchanges

## Next
- T8: Integrate buy/sell with cash auto-adjust
- T9: Tests (unit/integration/e2e) for guards and edge cases
- T10: Swagger/Notion docs refresh (examples, error cases)

## Files touched
- codex/TodayTodo.mdc
- src/modules/portfolio/cash/cash.controller.ts
- src/modules/portfolio/cash/cash.service.ts
- src/modules/portfolio/cash/cash.repository.ts
- src/modules/portfolio/dto/requests/cash/update-cash-transaction.dto.ts
- src/modules/portfolio/dto/responses/cash/update-cash-transaction.dto.ts

