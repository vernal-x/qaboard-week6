import type { Answer } from "../types/database";
import { initialMockAnswers } from "./mock/mockAnswers";
import { markQuestionAnswered } from "./questionsRepository";
import { supabase } from "../lib/supabaseClient";

export interface AnswersRepository {
  getByQuestionId(questionId: string): Promise<Answer | null>;
  create(input: { questionId: string; adminId: string; content: string }): Promise<Answer>;
  update(id: string, content: string): Promise<Answer>;
}

function delay<T>(value: T, ms = 300): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms));
}

let store: Answer[] = [...initialMockAnswers];

export const mockAnswersRepository: AnswersRepository = {
  async getByQuestionId(questionId) {
    return delay(store.find((a) => a.questionId === questionId) ?? null);
  },
  async create(input) {
    const now = new Date().toISOString();
    const answer: Answer = {
      id: `a-${Date.now()}`,
      questionId: input.questionId,
      adminId: input.adminId,
      content: input.content.trim(),
      createdAt: now,
      updatedAt: now,
    };
    store = [...store, answer];
    markQuestionAnswered(input.questionId);
    return delay(answer);
  },
  async update(id, content) {
    const idx = store.findIndex((a) => a.id === id);
    if (idx === -1) throw new Error("Answer not found");
    const updated: Answer = { ...store[idx], content: content.trim(), updatedAt: new Date().toISOString() };
    store[idx] = updated;
    return delay(updated);
  },
};

// ---------- Supabase 구현체 (tasks.md T056) ----------

interface AnswerRow {
  id: string;
  question_id: string;
  admin_id: string;
  content: string;
  created_at: string;
  updated_at: string;
}

function toAnswer(row: AnswerRow): Answer {
  return {
    id: row.id,
    questionId: row.question_id,
    adminId: row.admin_id,
    content: row.content,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export const supabaseAnswersRepository: AnswersRepository = {
  async getByQuestionId(questionId) {
    const { data, error } = await supabase
      .from("answers")
      .select("*")
      .eq("question_id", questionId)
      .maybeSingle();
    if (error) throw error;
    return data ? toAnswer(data as AnswerRow) : null;
  },
  async create(input) {
    const { data, error } = await supabase
      .from("answers")
      .insert({ question_id: input.questionId, admin_id: input.adminId, content: input.content.trim() })
      .select()
      .single();
    if (error) throw error;
    // questions.status → 'answered' 전환은 DB 트리거(mark_question_answered)가 처리한다.
    // mock 구현과 달리 클라이언트가 questions를 직접 갱신하지 않는다.
    return toAnswer(data as AnswerRow);
  },
  async update(id, content) {
    const { data, error } = await supabase
      .from("answers")
      .update({ content: content.trim(), updated_at: new Date().toISOString() })
      .eq("id", id)
      .select()
      .single();
    if (error) throw error;
    return toAnswer(data as AnswerRow);
  },
};

export const answersRepository: AnswersRepository =
  import.meta.env.VITE_DATA_SOURCE === "supabase" ? supabaseAnswersRepository : mockAnswersRepository;
