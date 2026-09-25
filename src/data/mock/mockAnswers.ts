import type { Answer } from "../../types/database";

export const initialMockAnswers: Answer[] = [
  {
    id: "a-1",
    questionId: "q-1",
    adminId: "u-admin-1",
    content:
      "영업일 기준 3일 이내 환불됩니다. 결제하신 수단으로 그대로 환불되며, 진행 상황은 마이페이지에서 확인하실 수 있어요.",
    createdAt: "2026-09-21T10:00:00.000Z",
    updatedAt: "2026-09-21T10:00:00.000Z",
  },
  {
    id: "a-7",
    questionId: "q-7",
    adminId: "u-admin-1",
    content: "브론즈/실버/골드 3단계이며, 최근 3개월 누적 구매 금액 기준으로 매월 1일 갱신됩니다.",
    createdAt: "2026-09-16T09:00:00.000Z",
    updatedAt: "2026-09-16T09:00:00.000Z",
  },
];
