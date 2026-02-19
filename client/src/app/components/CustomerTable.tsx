import React from "react";
import styles from "./CustomerTable.module.css";

interface Customer {
  customer_id: string;
  name: string;
  email: string;
  status: string;
  subscription_count: number;
  created_at: string;
}

interface CustomerTableProps {
  customers: Customer[];
  onEdit: (customer: Customer) => void;
  onDelete: (customer: Customer) => void;
}

const CustomerTable: React.FC<CustomerTableProps> = ({
  customers,
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

  const toggleDropdown = (e: React.MouseEvent, customerId: string) => {
    e.stopPropagation();
    setOpenDropdown(openDropdown === customerId ? null : customerId);
  };

  return (
    <div className={styles.tableContainer}>
      <table className={styles.table}>
        <thead className={styles.thead}>
          <tr>
            <th className={styles.th}>고객</th>
            <th className={styles.th}>구독 수</th>
            <th className={styles.th}>가입일</th>
            <th className={styles.th}>상태</th>
            <th className={styles.th}>동작</th>
          </tr>
        </thead>
        <tbody>
          {customers.map((customer) => (
            <tr key={customer.customer_id} className={styles.tr}>
              <td className={styles.td}>
                <div className={styles.customerCell}>
                  <div className={styles.customerName}>{customer.name}</div>
                  <div className={styles.customerEmail}>{customer.email}</div>
                </div>
              </td>
              <td className={styles.td}>
                <div className={styles.subscriptionCount}>
                  {customer.subscription_count}개
                </div>
              </td>
              <td className={styles.td}>
                <div style={{ color: "#6b7280", fontSize: "0.875rem" }}>
                  {new Date(customer.created_at).toLocaleDateString("ko-KR", {
                    year: "numeric",
                    month: "2-digit",
                    day: "2-digit",
                  })}
                </div>
              </td>
              <td className={styles.td}>
                <span
                  className={
                    customer.status === "ACTIVE"
                      ? styles.statusActive
                      : customer.status === "WAITING"
                        ? styles.statusPending
                        : styles.statusInactive
                  }
                >
                  {customer.status === "ACTIVE"
                    ? "활성"
                    : customer.status === "WAITING"
                      ? "대기중"
                      : "비활성"}
                </span>
              </td>
              <td className={styles.td}>
                <div style={{ position: "relative" }}>
                  <button
                    className={styles.actionMenuButton}
                    onClick={(e) => toggleDropdown(e, customer.customer_id)}
                  >
                    ⋮
                  </button>
                  {openDropdown === customer.customer_id && (
                    <div className={styles.dropdown}>
                      <button
                        className={styles.dropdownItem}
                        onClick={() => {
                          setOpenDropdown(null);
                          onEdit(customer);
                        }}
                      >
                        수정
                      </button>
                      <button
                        className={styles.dropdownItem}
                        onClick={() => {
                          setOpenDropdown(null);
                          onDelete(customer);
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

export default CustomerTable;
