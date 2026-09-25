import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Header } from "../../components/Header/Header";
import { PageHeader } from "../../components/PageHeader/PageHeader";
import { Button } from "../../components/Button/Button";
import { Badge } from "../../components/Badge/Badge";
import { Input } from "../../components/Input/Input";
import { Textarea } from "../../components/Textarea/Textarea";
import { LoadingState } from "../../components/StateViews/LoadingState";
import { ErrorState } from "../../components/StateViews/ErrorState";
import { useAuth } from "../../auth/useAuth";
import { questionsRepository } from "../../data/questionsRepository";
import { answersRepository } from "../../data/answersRepository";
import { validateAnswer, validateContent, validateTitle } from "../../lib/validation";
import type { Answer, Question } from "../../types/database";
import styles from "./QuestionDetailPage.module.css";

type LoadState = "loading" | "error" | "ready";

/**
 * design.md §3/§13 — 통합 레이아웃(FR-021). 작성/상세/수정/답변 작성/답변 수정을
 * 별도 화면 없이 이 한 컴포넌트의 조건부 렌더링으로 처리한다.
 */
export function QuestionDetailPage() {
  const { role, profile, logout } = useAuth();
  const isAdmin = role === "admin";
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isWriteMode = !id;

  const [loadState, setLoadState] = useState<LoadState>(isWriteMode ? "ready" : "loading");
  const [loadErrorMessage, setLoadErrorMessage] = useState<string | undefined>(undefined);
  const [question, setQuestion] = useState<Question | null>(null);
  const [answer, setAnswer] = useState<Answer | null>(null);

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [answerText, setAnswerText] = useState("");
  const [titleError, setTitleError] = useState<string | null>(null);
  const [contentError, setContentError] = useState<string | null>(null);
  const [answerError, setAnswerError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    if (!id) return;
    setLoadState("loading");
    setLoadErrorMessage(undefined);
    try {
      const q = await questionsRepository.getById(id);
      // FR-016 — 존재하지 않거나(spec.md Edge Case) 본인 소유가 아닌 질문은 "찾을 수 없음"으로
      // 안내한다. 쿼리 자체가 실패한 경우(네트워크·RLS 등)는 아래 catch에서 별도로 처리해
      // 서로 다른 상황이 같은 문구로 뭉뚱그려지지 않게 한다.
      if (!q || (!isAdmin && q.userId !== profile!.id)) {
        setLoadErrorMessage("질문을 찾을 수 없어요.");
        setLoadState("error");
        return;
      }
      setQuestion(q);
      setTitle(q.title);
      setContent(q.content);
      setTitleError(null);
      setContentError(null);
      if (q.status === "answered") {
        const a = await answersRepository.getByQuestionId(q.id);
        setAnswer(a);
        setAnswerText(a?.content ?? "");
      } else {
        setAnswer(null);
        setAnswerText("");
      }
      setLoadState("ready");
    } catch {
      // 조회 쿼리 자체의 오류 — ErrorState 기본 문구("문제가 발생했어요...")로 기술적 오류임을 안내
      setLoadState("error");
    }
  }, [id, isAdmin, profile]);

  useEffect(() => {
    load();
  }, [load]);

  async function handleSaveQuestion() {
    const tErr = validateTitle(title);
    const cErr = validateContent(content);
    setTitleError(tErr);
    setContentError(cErr);
    if (tErr || cErr) return;

    setSaving(true);
    try {
      if (isWriteMode) {
        const created = await questionsRepository.create({
          userId: profile!.id,
          title,
          content,
        });
        navigate(`/questions/${created.id}`, { replace: true });
      } else if (question) {
        await questionsRepository.update(question.id, { title, content });
        await load();
      }
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!question) return;
    await questionsRepository.remove(question.id);
    navigate("/questions");
  }

  async function handleSubmitAnswer() {
    if (!question) return;
    const aErr = validateAnswer(answerText);
    setAnswerError(aErr);
    if (aErr) return;

    setSaving(true);
    try {
      if (answer) {
        await answersRepository.update(answer.id, answerText);
      } else {
        await answersRepository.create({
          questionId: question.id,
          adminId: profile!.id,
          content: answerText,
        });
      }
      await load();
    } finally {
      setSaving(false);
    }
  }

  const backHref = "/questions";
  const backLabel = isAdmin ? "문의 관리" : "내 질문";

  return (
    <div data-theme="light" className={styles.page}>
      <Header
        activeNav="questions"
        right={{ kind: "user", name: profile!.displayName, onLogout: logout }}
      />

      <div className={`content-max ${styles.body}`}>
        <button type="button" className={styles.back} onClick={() => navigate(backHref)}>
          ‹ {backLabel}
        </button>

        {loadState === "loading" && <LoadingState rows={4} />}
        {loadState === "error" && (
          <ErrorState message={loadErrorMessage} onRetry={load} />
        )}

        {isWriteMode && loadState === "ready" && (
          <>
            <PageHeader title="질문 작성" className={styles.headerSpacing} />
            <Input
              label="제목"
              value={title}
              onChange={setTitle}
              placeholder="질문 제목을 입력하세요"
              maxLength={100}
              error={titleError ?? undefined}
              disabled={saving}
            />
            <Textarea
              label="내용"
              value={content}
              onChange={setContent}
              placeholder="궁금한 내용을 자세히 적어주세요"
              maxLength={5000}
              error={contentError ?? undefined}
              disabled={saving}
            />
            <div className={styles.actions}>
              <Button as="link" variant="secondary" to="/questions">
                취소
              </Button>
              <Button variant="primary" onClick={handleSaveQuestion} loading={saving}>
                {saving ? "저장 중..." : "등록하기"}
              </Button>
            </div>
          </>
        )}

        {!isWriteMode && loadState === "ready" && question && !isAdmin && question.status === "pending" && (
          <>
            <PageHeader title="질문 상세" badge={<Badge tone="pending" />} className={styles.headerSpacing} />
            <Input
              label="제목"
              value={title}
              onChange={setTitle}
              maxLength={100}
              error={titleError ?? undefined}
              disabled={saving}
            />
            <Textarea
              label="내용"
              value={content}
              onChange={setContent}
              maxLength={5000}
              error={contentError ?? undefined}
              disabled={saving}
            />
            <div className={styles.field}>
              <p className={`${styles.label} type-label`}>답변</p>
              <div className={styles.banner}>
                관리자가 아직 답변하지 않았어요. 확인 후 답변해드립니다.
              </div>
            </div>
            <div className={styles.actions}>
              <Button variant="danger" onClick={handleDelete} disabled={saving}>
                삭제하기
              </Button>
              <Button variant="primary" onClick={handleSaveQuestion} loading={saving}>
                {saving ? "저장 중..." : "저장하기"}
              </Button>
            </div>
          </>
        )}

        {!isWriteMode && loadState === "ready" && question && !isAdmin && question.status === "answered" && (
          <>
            <PageHeader title="질문 상세" badge={<Badge tone="answered" />} className={styles.headerSpacing} />
            <Input label="제목" value={title} maxLength={100} readOnly showCount={false} />
            <Textarea label="내용" value={content} maxLength={5000} readOnly showCount={false} />
            <div className={styles.field}>
              <p className={`${styles.label} type-label`}>답변</p>
              <div className={styles.answerBox}>{answer?.content}</div>
              <div className={styles.banner}>
                답변이 완료되어 더 이상 수정하거나 삭제할 수 없어요.
              </div>
            </div>
            <div className={styles.actions}>
              <Button as="link" variant="secondary" to="/questions">
                질문 목록으로
              </Button>
            </div>
          </>
        )}

        {!isWriteMode && loadState === "ready" && question && isAdmin && question.status === "pending" && (
          <>
            <PageHeader
              title="질문 상세"
              badge={<Badge tone="pending" />}
              subtitle={`질문자 · ${question.nickname}`}
            />
            <Input label="제목" value={title} maxLength={100} readOnly showCount={false} />
            <Textarea label="내용" value={content} maxLength={5000} readOnly showCount={false} />
            <Textarea
              label="답변 작성"
              value={answerText}
              onChange={setAnswerText}
              placeholder="답변을 입력하세요"
              maxLength={5000}
              error={answerError ?? undefined}
              disabled={saving}
            />
            <div className={styles.actions}>
              <Button variant="primary" onClick={handleSubmitAnswer} loading={saving}>
                {saving ? "저장 중..." : "답변 등록"}
              </Button>
            </div>
          </>
        )}

        {!isWriteMode && loadState === "ready" && question && isAdmin && question.status === "answered" && (
          <>
            <PageHeader
              title="질문 상세"
              badge={<Badge tone="answered" />}
              subtitle={`질문자 · ${question.nickname}`}
            />
            <Input label="제목" value={title} maxLength={100} readOnly showCount={false} />
            <Textarea label="내용" value={content} maxLength={5000} readOnly showCount={false} />
            <Textarea
              label="답변 수정"
              value={answerText}
              onChange={setAnswerText}
              maxLength={5000}
              error={answerError ?? undefined}
              disabled={saving}
            />
            <div className={styles.actions}>
              <Button variant="primary" onClick={handleSubmitAnswer} loading={saving}>
                {saving ? "저장 중..." : "답변 수정"}
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
