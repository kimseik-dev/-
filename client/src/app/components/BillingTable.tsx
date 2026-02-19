import React from "react";
import styles from "./BillingTable.module.css";

interface Invoice {
  invoice_id: string;
  subscription_id: string;
  amount_paid: number;
  billing_date: string;
  payment_status: string;
  customer_name: string;
  customer_email: string;
  plan_name: string;
  next_billing_date: string;
}

interface BillingTableProps {
  invoices: Invoice[];
}

const BillingTable: React.FC<BillingTableProps> = ({ invoices }) => {
  return (
    <div className={styles.tableContainer}>
      <table className={styles.table}>
        <thead className={styles.thead}>
          <tr>
            <th className={styles.th} style={{ width: "10%" }}>
              ID
            </th>
            <th className={styles.th} style={{ width: "20%" }}>
              고객
            </th>
            <th className={styles.th} style={{ width: "15%" }}>
              플랜
            </th>
            <th className={styles.th} style={{ width: "15%" }}>
              결제일
            </th>
            <th className={styles.th} style={{ width: "15%" }}>
              다음 결제일
            </th>
            <th className={styles.th} style={{ width: "15%" }}>
              금액
            </th>
            <th className={styles.th} style={{ width: "10%" }}>
              상태
            </th>
          </tr>
        </thead>
        <tbody>
          {invoices.map((invoice) => (
            <tr key={invoice.invoice_id} className={styles.tr}>
              <td className={styles.td}>#{invoice.invoice_id}</td>
              <td className={styles.td}>
                <div style={{ fontWeight: 600 }}>{invoice.customer_name}</div>
                <div style={{ fontSize: "0.85rem", color: "#6b7280" }}>
                  {invoice.customer_email}
                </div>
              </td>
              <td className={styles.td}>{invoice.plan_name}</td>
              <td className={styles.td}>
                {new Date(invoice.billing_date).toLocaleDateString()}
              </td>
              <td className={styles.td}>
                {new Date(invoice.next_billing_date).toLocaleDateString()}
              </td>
              <td className={styles.td}>
                {invoice.amount_paid.toLocaleString()}원
              </td>
              <td className={styles.td}>
                <span
                  className={
                    invoice.payment_status === "PAID"
                      ? styles.statusPaid
                      : invoice.payment_status === "PENDING"
                        ? styles.statusPending
                        : styles.statusFailed
                  }
                >
                  {invoice.payment_status === "PAID"
                    ? "결제 완료"
                    : invoice.payment_status === "PENDING"
                      ? "대기 중"
                      : "실패"}
                </span>
              </td>
            </tr>
          ))}
          {invoices.length === 0 && (
            <tr>
              <td
                colSpan={6}
                style={{
                  textAlign: "center",
                  padding: "40px",
                  color: "#6b7280",
                }}
              >
                청구 내역이 없습니다.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default BillingTable;
