import type { Question } from "../../types/database";

// design.md §12/§13에 실제로 쓰인 예시 문구를 그대로 재사용한다.
const authorNicknames: Record<string, string> = {
  "u-member-1": "lemontea",
  "u-haneul": "haneul",
  "u-blue-moon": "blue_moon",
  "u-do-re-mi": "do_re_mi",
};

export function getNickname(userId: string): string {
  return authorNicknames[userId] ?? "탈퇴한 회원";
}

export const initialMockQuestions: Question[] = [
  {
    id: "q-1",
    userId: "u-member-1",
    title: "환불 절차가 어떻게 되나요?",
    content:
      "구매 후 단순 변심으로도 환불이 가능한지, 가능하다면 절차가 어떻게 되는지 궁금합니다.",
    status: "answered",
    createdAt: "2026-09-20T09:00:00.000Z",
    updatedAt: "2026-09-21T10:00:00.000Z",
  },
  {
    id: "q-2",
    userId: "u-member-1",
    title: "배송은 며칠 정도 걸리나요?",
    content: "주문 후 발송까지 며칠 정도 걸리는지 알고 싶어요.",
    status: "pending",
    createdAt: "2026-09-18T09:00:00.000Z",
    updatedAt: "2026-09-18T09:00:00.000Z",
  },
  {
    id: "q-3",
    userId: "u-member-1",
    title: "회원 등급은 어떻게 나뉘나요?",
    content:
      "브론즈/실버/골드 등급 기준이 궁금합니다. 어떤 조건으로 등급이 올라가는지 알려주세요.",
    status: "pending",
    createdAt: "2026-09-15T09:00:00.000Z",
    updatedAt: "2026-09-15T09:00:00.000Z",
  },
  {
    id: "q-4",
    userId: "u-member-1",
    title: "비밀번호를 변경하고 싶어요.",
    content: "계정 설정에서 비밀번호를 바꾸는 방법을 알려주세요.",
    status: "pending",
    createdAt: "2026-09-12T09:00:00.000Z",
    updatedAt: "2026-09-12T09:00:00.000Z",
  },
  {
    id: "q-5",
    userId: "u-haneul",
    title: "쿠폰은 중복 사용이 가능한가요?",
    content:
      "여러 장의 쿠폰을 한 번에 적용할 수 있는지 알고 싶어요. 중복 사용 조건이 있다면 함께 알려주세요.",
    status: "pending",
    createdAt: "2026-09-20T09:00:00.000Z",
    updatedAt: "2026-09-20T09:00:00.000Z",
  },
  {
    id: "q-6",
    userId: "u-blue-moon",
    title: "탈퇴는 어디서 하나요?",
    content: "계정을 탈퇴하고 싶은데 어느 메뉴에서 진행하는지 궁금합니다.",
    status: "pending",
    createdAt: "2026-09-17T09:00:00.000Z",
    updatedAt: "2026-09-17T09:00:00.000Z",
  },
  {
    id: "q-7",
    userId: "u-do-re-mi",
    title: "회원 등급은 어떻게 나뉘나요?",
    content: "다른 회원과 같은 질문이지만 제 계정 기준으로도 확인하고 싶어요.",
    status: "answered",
    createdAt: "2026-09-14T09:00:00.000Z",
    updatedAt: "2026-09-16T09:00:00.000Z",
  },
];
