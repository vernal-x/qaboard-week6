import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "../../components/Header/Header";
import { PageHeader } from "../../components/PageHeader/PageHeader";
import { Button } from "../../components/Button/Button";
import { QuestionCard } from "../../components/QuestionCard/QuestionCard";
import { StatusFilter, type StatusFilterValue } from "../../components/StatusFilter/StatusFilter";
import { LoadingState } from "../../components/StateViews/LoadingState";
import { EmptyState } from "../../components/StateViews/EmptyState";
import { ErrorState } from "../../components/StateViews/ErrorState";
import { useAuth } from "../../auth/useAuth";
import { questionsRepository } from "../../data/questionsRepository";
import type { Question } from "../../types/database";
import styles from "./QuestionListPage.module.css";

type LoadState = "loading" | "error" | "ready";

/** design.md §6/§11/§14 — 회원 "내 질문" / 관리자 "문의 관리". FR-006, FR-007, FR-022. */
export function QuestionListPage() {
  const { role, profile, logout } = useAuth();
  const isAdmin = role === "admin";
  const navigate = useNavigate();

  const [filter, setFilter] = useState<StatusFilterValue>(isAdmin ? "pending" : "all");
  const [loadState, setLoadState] = useState<LoadState>("loading");
  const [questions, setQuestions] = useState<Question[]>([]);

  const load = useCallback(async () => {
    setLoadState("loading");
    try {
      const rows = isAdmin
        ? await questionsRepository.listAll("all")
        : await questionsRepository.listMine(profile!.id);
      setQuestions(rows);
      setLoadState("ready");
    } catch {
      setLoadState("error");
    }
  }, [isAdmin, profile]);

  useEffect(() => {
    load();
  }, [load]);

  const visibleQuestions =
    filter === "all" ? questions : questions.filter((q) => q.status === filter);

  return (
    <div data-theme="light" className={styles.page}>
      <Header
        activeNav="questions"
        right={{ kind: "user", name: profile!.displayName, onLogout: logout }}
      />

      <div className={`content-max ${styles.body}`}>
        <div className={styles.titleRow}>
          <PageHeader
            title={isAdmin ? "문의 관리" : "내 질문"}
            subtitle={
              isAdmin
                ? "전체 회원의 질문과 답변 대기 상태를 확인하세요."
                : "내가 작성한 질문과 답변 상태를 확인하세요."
            }
          />
          {!isAdmin && (
            <Button as="link" variant="primary" to="/questions/new">
              질문 작성하기
            </Button>
          )}
        </div>

        <div className={styles.filterRow}>
          <StatusFilter value={filter} onChange={setFilter} />
        </div>

        {loadState === "loading" && <LoadingState rows={4} />}
        {loadState === "error" && <ErrorState onRetry={load} />}
        {loadState === "ready" && visibleQuestions.length === 0 && (
          <EmptyState
            role={isAdmin ? "admin" : "member"}
            onCreate={isAdmin ? undefined : () => navigate("/questions/new")}
          />
        )}
        {loadState === "ready" && visibleQuestions.length > 0 && (
          <div className={styles.list}>
            {visibleQuestions.map((q) => (
              <QuestionCard
                key={q.id}
                title={q.title}
                status={q.status}
                date={q.createdAt.slice(0, 10).replaceAll("-", ".")}
                nickname={isAdmin ? q.nickname : undefined}
                href={`/questions/${q.id}`}
              />
            ))}
          </div>
        )}
      </div>

      {!isAdmin && (
        <div className={styles.stickyCta}>
          <Button as="link" variant="primary" fullWidth to="/questions/new">
            질문 작성하기
          </Button>
        </div>
      )}
    </div>
  );
}
