import React from "react";
import styles from "./DashboardStats.module.css";

interface DashboardStatsProps {
  stats: {
    totalSubscriptions: number;
    activeSubscriptions: number;
    waitingSubscriptions: number;
    monthlyRevenue: number;
  } | null;
}

const DashboardStats: React.FC<DashboardStatsProps> = ({ stats }) => {
  if (!stats) return null;

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.header}>
          <span className={styles.label}>총 구독 수</span>
          <div className={styles.icon}>👥</div>
        </div>
        <span className={styles.value}>{stats.totalSubscriptions}개</span>
        <div className={styles.trend}>
          <span>↗</span> <span>지난달 대비 +12%</span>
        </div>
      </div>
      <div className={styles.card}>
        <div className={styles.header}>
          <span className={styles.label}>활성 구독자</span>
          <div className={styles.icon}>✅</div>
        </div>
        <span className={styles.value}>{stats.activeSubscriptions}명</span>
        <div className={styles.trend}>
          <span>↗</span> <span>지난달 대비 +5%</span>
        </div>
      </div>
      <div className={styles.card}>
        <div className={styles.header}>
          <span className={styles.label}>대기중인 구독</span>
          <div className={styles.icon}>⏳</div>
        </div>
        <span className={styles.value}>{stats.waitingSubscriptions}명</span>
        <div className={styles.trend} style={{ color: "#f59e0b" }}>
          <span>-</span> <span>승인 대기 중</span>
        </div>
      </div>
      <div className={styles.card}>
        <div className={styles.header}>
          <span className={styles.label}>이번 달 결제 완료 (실매출)</span>
          <div className={styles.icon}>💸</div>
        </div>
        <span className={styles.value}>
          ₩{((stats as any).actualRevenue || 0).toLocaleString()}
        </span>
        <div className={styles.trend} style={{ color: "#2563eb" }}>
          <span>ℹ️</span> <span>실제 입금 된 금액</span>
        </div>
      </div>
      <div className={styles.card}>
        <div className={styles.header}>
          <span className={styles.label}>예상 월 수익 (MRR)</span>
          <div className={styles.icon}>💰</div>
        </div>
        <span className={styles.value}>
          ₩{stats.monthlyRevenue.toLocaleString()}
        </span>
        <div className={styles.trend}>
          <span>ℹ️</span> <span>활성 구독 기준 예상 수익</span>
        </div>
      </div>
    </div>
  );
};

export default DashboardStats;
