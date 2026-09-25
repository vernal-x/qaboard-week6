import type { Question, QuestionStatus } from "../types/database";
import { getNickname, initialMockQuestions } from "./mock/mockQuestions";
import { supabase } from "../lib/supabaseClient";

export interface QuestionsRepository {
  listMine(userId: string): Promise<Question[]>;
  listAll(filter?: "all" | QuestionStatus): Promise<Question[]>;
  getById(id: string): Promise<Question | null>;
  create(input: { userId: string; title: string; content: string }): Promise<Question>;
  update(id: string, input: { title: string; content: string }): Promise<Question>;
  remove(id: string): Promise<void>;
}

function delay<T>(value: T, ms = 300): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms));
}

function byNewest(a: Question, b: Question) {
  return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
}

// 모듈 스코프의 인메모리 저장소 — Mock 단계 전용(새로고침 시 초기화됨).
let store: Question[] = [...initialMockQuestions];

export const mockQuestionsRepository: QuestionsRepository = {
  async listMine(userId) {
    return delay(store.filter((q) => q.userId === userId).sort(byNewest));
  },
  async listAll(filter = "all") {
    const rows = store
      .filter((q) => (filter === "all" ? true : q.status === filter))
      .map((q) => ({ ...q, nickname: getNickname(q.userId) }))
      .sort(byNewest);
    return delay(rows);
  },
  async getById(id) {
    const found = store.find((q) => q.id === id) ?? null;
    return delay(found ? { ...found, nickname: getNickname(found.userId) } : null);
  },
  async create(input) {
    const now = new Date().toISOString();
    const question: Question = {
      id: `q-${Date.now()}`,
      userId: input.userId,
      title: input.title.trim(),
      content: input.content.trim(),
      status: "pending",
      createdAt: now,
      updatedAt: now,
    };
    store = [question, ...store];
    return delay(question);
  },
  async update(id, input) {
    const idx = store.findIndex((q) => q.id === id);
    if (idx === -1) throw new Error("Question not found");
    const updated: Question = {
      ...store[idx],
      title: input.title.trim(),
      content: input.content.trim(),
      updatedAt: new Date().toISOString(),
    };
    store[idx] = updated;
    return delay(updated);
  },
  async remove(id) {
    store = store.filter((q) => q.id !== id);
    return delay(undefined);
  },
};

/** answersRepository가 답변 생성 시 호출 — Supabase 트리거(set_question_answered)를 Mock에서 재현(FR-012). */
export function markQuestionAnswered(id: string) {
  const idx = store.findIndex((q) => q.id === id);
  if (idx !== -1) {
    store[idx] = { ...store[idx], status: "answered", updatedAt: new Date().toISOString() };
  }
}

// ---------- Supabase 구현체 (tasks.md T056) ----------

interface QuestionRow {
  id: string;
  user_id: string;
  title: string;
  content: string;
  status: QuestionStatus;
  created_at: string;
  updated_at: string;
}

function toQuestion(row: QuestionRow, nickname?: string): Question {
  return {
    id: row.id,
    userId: row.user_id,
    title: row.title,
    content: row.content,
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    nickname,
  };
}

/**
 * 작성자 닉네임을 PostgREST embed(`select("*, profiles(display_name)")`)가 아니라
 * 별도 쿼리로 가져온다. `questions.user_id`와 `profiles.id`가 둘 다 `auth.users(id)`를
 * 참조할 뿐 서로 직접 FK가 없는 실제 적용 스키마에서는 embed가
 * "Could not find a relationship..." 오류로 실패하고, 그 오류가 getById()에서
 * `error`로 throw되어 "질문을 찾을 수 없어요"로 잘못 표시되는 문제가 있었다.
 * profiles RLS(본인 행 또는 관리자)가 이 별도 쿼리도 그대로 적용하므로 권한은 동일하게 지켜진다.
 */
async function fetchNicknames(userIds: string[]): Promise<Record<string, string>> {
  const uniqueIds = Array.from(new Set(userIds));
  if (uniqueIds.length === 0) return {};
  const { data, error } = await supabase.from("profiles").select("id, display_name").in("id", uniqueIds);
  if (error) throw error;
  const map: Record<string, string> = {};
  for (const row of data as { id: string; display_name: string }[]) {
    map[row.id] = row.display_name;
  }
  return map;
}

export const supabaseQuestionsRepository: QuestionsRepository = {
  async listMine(userId) {
    const { data, error } = await supabase
      .from("questions")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });
    if (error) throw error;
    return (data as QuestionRow[]).map((row) => toQuestion(row));
  },
  async listAll(filter = "all") {
    let query = supabase.from("questions").select("*").order("created_at", { ascending: false });
    if (filter !== "all") query = query.eq("status", filter);
    const { data, error } = await query;
    if (error) throw error;
    const rows = data as QuestionRow[];
    const nicknames = await fetchNicknames(rows.map((row) => row.user_id));
    return rows.map((row) => toQuestion(row, nicknames[row.user_id]));
  },
  async getById(id) {
    const { data, error } = await supabase.from("questions").select("*").eq("id", id).maybeSingle();
    if (error) throw error;
    if (!data) return null;
    const row = data as QuestionRow;
    const nicknames = await fetchNicknames([row.user_id]);
    return toQuestion(row, nicknames[row.user_id]);
  },
  async create(input) {
    const { data, error } = await supabase
      .from("questions")
      .insert({ user_id: input.userId, title: input.title.trim(), content: input.content.trim() })
      .select()
      .single();
    if (error) throw error;
    return toQuestion(data as QuestionRow);
  },
  async update(id, input) {
    // contracts/database.md에는 질문 수정 시 updated_at을 건드리는 별도 트리거가 없어 클라이언트가
    // 직접 채운다(mock 구현과 동일한 방식).
    const { data, error } = await supabase
      .from("questions")
      .update({
        title: input.title.trim(),
        content: input.content.trim(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single();
    if (error) throw error;
    return toQuestion(data as QuestionRow);
  },
  async remove(id) {
    const { error } = await supabase.from("questions").delete().eq("id", id);
    if (error) throw error;
  },
};

export const questionsRepository: QuestionsRepository =
  import.meta.env.VITE_DATA_SOURCE === "supabase" ? supabaseQuestionsRepository : mockQuestionsRepository;
