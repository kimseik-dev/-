import React from "react";
import styles from "./InvoiceTable.module.css";

interface Invoice {
  subscription_id: string;
  customer_id: string;
  plan_id: string;
  start_date: string;
  end_date?: string;
  next_billing_date: string;
  status: string;
  payment_method_token?: string;
  customer: {
    name: string;
    email: string;
  };
  plan: {
    plan_name: string;
    monthly_price: number;
    billing_cycle: string;
    currency: string;
  };
}

interface InvoiceTableProps {
  invoices: Invoice[];
  startIndex: number;
  onEdit: (invoice: Invoice) => void;
  onDelete: (invoice: Invoice) => void;
}

const InvoiceTable: React.FC<InvoiceTableProps> = ({
  invoices,
  startIndex,
  onEdit,
  onDelete,
}) => {
  const [openDropdown, setOpenDropdown] = React.useState<string | null>(null);

  React.useEffect(() => {
    const handleClickOutside = () => setOpenDropdown(null);
    if (openDropdown) {
      document.addEventListener("click", handleClickOutside);
      return () => document.removeEventListener("click", handleClickOutside);
    }
  }, [openDropdown]);

  const toggleDropdown = (e: React.MouseEvent, subscriptionId: string) => {
    e.stopPropagation();
    setOpenDropdown(openDropdown === subscriptionId ? null : subscriptionId);
  };
  return (
    <div className={styles.tableContainer}>
      <table className={styles.table}>
        <thead className={styles.thead}>
          <tr>
            <th className={styles.th}>No.</th>
            <th className={styles.th}>고객</th>
            <th className={styles.th}>플랜</th>
            <th className={styles.th}>가격</th>
            <th className={styles.th}>다음 결제일</th>
            <th className={styles.th}>상태</th>
            <th className={styles.th}>동작</th>
          </tr>
        </thead>
        <tbody>
          {invoices.map((invoice, index) => (
            <tr key={invoice.subscription_id} className={styles.tr}>
              <td className={styles.td}>
                <div className={styles.cellText}>{startIndex + index + 1}</div>
              </td>
              <td className={styles.td}>
                <div className={styles.customerCell}>
                  <div className={styles.customerName}>
                    {invoice.customer.name}
                  </div>
                  <div className={styles.customerEmail}>
                    {invoice.customer.email}
                  </div>
                </div>
              </td>
              <td className={styles.td}>
                <div className={styles.planName}>{invoice.plan.plan_name}</div>
                <div className={styles.billingCycle}>
                  {invoice.plan.billing_cycle === "MONTHLY" ? "월간" : "연간"}
                </div>
              </td>
              <td className={styles.td}>
                <div className={styles.price}>
                  {invoice.plan.currency === "KRW" ? "₩" : "$"}
                  {Number(invoice.plan.monthly_price).toLocaleString("ko-KR")}
                </div>
              </td>
              <td className={styles.td}>
                <div className={styles.date}>
                  {invoice.status === "WAITING"
                    ? "결제 대기"
                    : new Date(invoice.next_billing_date).toLocaleDateString(
                        "ko-KR",
                      )}
                </div>
              </td>
              <td className={styles.td}>
                <span
                  className={
                    invoice.status === "ACTIVE"
                      ? styles.statusActive
                      : invoice.status === "WAITING"
                        ? styles.statusPending
                        : styles.statusInactive
                  }
                >
                  {invoice.status === "ACTIVE"
                    ? "활성"
                    : invoice.status === "WAITING"
                      ? "대기중"
                      : "비활성"}
                </span>
              </td>
              <td className={styles.td}>
                <div style={{ position: "relative" }}>
                  <button
                    className={styles.actionMenuButton}
                    onClick={(e) => toggleDropdown(e, invoice.subscription_id)}
                  >
                    ⋮
                  </button>
                  {openDropdown === invoice.subscription_id && (
                    <div className={styles.dropdown}>
                      <button
                        className={styles.dropdownItem}
                        onClick={() => {
                          setOpenDropdown(null);
                          onEdit(invoice);
                        }}
                      >
                        수정
                      </button>
                      <button
                        className={styles.dropdownItem}
                        onClick={() => {
                          setOpenDropdown(null);
                          onDelete(invoice);
                        }}
                      >
                        삭제
                      </button>
                    </div>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default InvoiceTable;
