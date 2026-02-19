"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import styles from "./Sidebar.module.css";

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className={styles.sidebar}>
      <div className={styles.logoArea}>
        <span>🟣 flow.payment</span>
      </div>

      <div className={styles.sectionTitle}>결제관리시스템</div>
      <Link
        href="/"
        className={`${styles.navItem} ${pathname === "/" ? styles.active : ""}`}
      >
        <span>🏠</span> 대시보드
      </Link>
      <Link
        href="/subscriptions"
        className={`${styles.navItem} ${pathname === "/subscriptions" ? styles.active : ""}`}
      >
        <span>💳</span> 구독 관리
      </Link>
      <Link
        href="/customers"
        className={`${styles.navItem} ${pathname === "/customers" ? styles.active : ""}`}
      >
        <span>👥</span> 고객 관리
      </Link>
      <Link
        href="/invoices"
        className={`${styles.navItem} ${pathname === "/invoices" ? styles.active : ""}`}
      >
        <span>📄</span> 청구서
      </Link>

      <div className={styles.bottomArea}>
        <div className={styles.navItem}>
          <span>⚙️</span> 설정
        </div>
      </div>
    </aside>
  );
}
