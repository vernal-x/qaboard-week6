import { Header } from "../../components/Header/Header";
import { Button } from "../../components/Button/Button";
import { Badge } from "../../components/Badge/Badge";
import { FloatingCard } from "../../components/FloatingCard/FloatingCard";
import { useAuth } from "../../auth/useAuth";
import styles from "./MainPage.module.css";

const FLOW_STEPS = [
  { n: "01", title: "질문 작성", desc: "회원이 궁금한 내용을 제목과 내용으로 남깁니다." },
  { n: "02", title: "관리자 확인", desc: "관리자가 전체 질문에서 답변 대기 항목을 확인합니다." },
  { n: "03", title: "답변 확인", desc: "회원이 질문 상세에서 답변을 확인합니다." },
];

/** design.md §9/§10 메인 Hero. FR-019, SC-001. */
export function MainPage() {
  const { role, profile, logout } = useAuth();
  const isGuest = role === "guest";

  return (
    <div data-theme="dark" className={styles.page}>
      <Header
        activeNav="main"
        right={isGuest ? { kind: "login" } : { kind: "user", name: profile!.displayName, onLogout: logout }}
      />

      <section className={styles.hero}>
        <div className={`content-max ${styles.heroRow}`}>
          <div className={styles.heroCopy}>
            <p className={`${styles.eyebrow} type-eyebrow`}>회원 질문 · 관리자 답변 게시판</p>
            <h1 className={`${styles.h1} type-hero-h1`}>
              질문은 빠르게,
              <br />
              답변은 명확하게.
            </h1>
            <p className={styles.sub}>궁금한 점을 남기면 관리자가 확인하고 답변해드립니다.</p>
            <div className={styles.ctaRow}>
              <Button as="link" variant="primary" to={isGuest ? "/login" : "/questions/new"}>
                질문 작성하기
              </Button>
              <Button as="link" variant="secondary" to={isGuest ? "/login" : "/questions"}>
                내 질문 확인하기
              </Button>
            </div>
            <p className={styles.miniFlow}>
              <span>질문 작성</span>
              <span className={styles.arrow}>→</span>
              <span>관리자 확인</span>
              <span className={styles.arrow}>→</span>
              <span>답변 확인</span>
            </p>
          </div>

          <FloatingCard
            question="환불 절차가 어떻게 되나요?"
            answer="영업일 기준 3일 이내 환불됩니다."
          />
        </div>
      </section>

      <section className={styles.flow}>
        <div className="content-max">
          <p className={styles.sectionLabel}>이용 흐름</p>
          <div className={styles.flowSteps}>
            {FLOW_STEPS.map((step, i) => (
              <div className={styles.flowItem} key={step.n}>
                <div>
                  <span className={styles.flowNum}>{step.n}</span>
                  <div className={styles.flowTitle}>{step.title}</div>
                  <div className={styles.flowDesc}>{step.desc}</div>
                </div>
                {i < FLOW_STEPS.length - 1 && <span className={styles.flowArrow}>→</span>}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className={styles.badgesSection}>
        <div className="content-max">
          <p className={styles.sectionLabel}>상태 배지</p>
          <div className={styles.badgesRow}>
            <Badge tone="pending" />
            <Badge tone="answered" />
          </div>
          <p className={styles.badgesCaption}>상태는 색상과 텍스트를 함께 사용합니다.</p>
        </div>
      </section>

      <div className={styles.stickyCta}>
        <Button as="link" variant="primary" fullWidth to={isGuest ? "/login" : "/questions/new"}>
          질문 작성하기
        </Button>
        <p className={styles.stickyCaption}>스크롤 중에도 화면 하단에 고정</p>
      </div>
    </div>
  );
}
