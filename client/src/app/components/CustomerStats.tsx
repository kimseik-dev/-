import React from "react";
import styles from "./CustomerStats.module.css";

interface CustomerStatsProps {
  stats: {
    totalCustomers: number;
    activeCustomers: number;
    newCustomersThisMonth: number;
  } | null;
}

const CustomerStats: React.FC<CustomerStatsProps> = ({ stats }) => {
  if (!stats) return null;

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.header}>
          <span className={styles.label}>총 고객 수</span>
          <div className={styles.icon}>👥</div>
        </div>
        <span className={styles.value}>{stats.totalCustomers}명</span>
        <div className={styles.trend}>
          <span>ℹ️</span> <span>전체 등록 고객</span>
        </div>
      </div>
      <div className={styles.card}>
        <div className={styles.header}>
          <span className={styles.label}>활성 이용자</span>
          <div className={styles.icon}>⚡</div>
        </div>
        <span className={styles.value}>{stats.activeCustomers}명</span>
        <div className={styles.trend} style={{ color: "#2563eb" }}>
          <span>ℹ️</span> <span>현재 이용 중인 고객</span>
        </div>
      </div>
      <div className={styles.card}>
        <div className={styles.header}>
          <span className={styles.label}>이번 달 신규</span>
          <div className={styles.icon}>🎉</div>
        </div>
        <span className={styles.value}>{stats.newCustomersThisMonth}명</span>
        <div className={styles.trend}>
          <span>↗</span> <span>이번 달 가입 고객</span>
        </div>
      </div>
    </div>
  );
};

export default CustomerStats;
