// data-model.md 엔티티 정의 — Supabase 스키마(contracts/database.md)와 1:1 대응한다.

export type Role = "member" | "admin";

export interface Profile {
  id: string;
  email: string;
  displayName: string;
  role: Role;
}

export type QuestionStatus = "pending" | "answered";

export interface Question {
  id: string;
  userId: string;
  title: string;
  content: string;
  status: QuestionStatus;
  createdAt: string;
  updatedAt: string;
  /** 관리자 목록 전용 — 작성자 닉네임(FR-007) */
  nickname?: string;
}

export interface Answer {
  id: string;
  questionId: string;
  adminId: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

export type AuthRole = "guest" | Role;
