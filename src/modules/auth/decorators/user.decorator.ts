import { createParamDecorator, ExecutionContext } from '@nestjs/common';

// 커스텀 파라미터 데코레이터 생성
export const User = createParamDecorator(
  /**
   * @param data 데코레이터 파라미터 (unknown: 없음)
   * @param ctx ExecutionContext 객체
   * @returns 요청 객체의 user 속성 반환
   */
  (data: unknown, ctx: ExecutionContext) => {
    // Express의 Request 객체 가져오기
    const request = ctx.switchToHttp().getRequest();

    /**
     * Guard에서 설정한 user 객체 반환
     * 즉, refresh.strategy.ts에서 반환한 객체
     */
    return request.user;
  },
);
