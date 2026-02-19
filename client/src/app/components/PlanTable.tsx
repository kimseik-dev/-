import React from "react";
import styles from "./PlanTable.module.css";

interface Plan {
  plan_id: string;
  plan_name: string;
  monthly_price: number;
  billing_cycle: "MONTHLY" | "ANNUAL";
  currency: string;
  is_active: boolean;
}

interface PlanTableProps {
  plans: Plan[];
  onEdit: (plan: Plan) => void;
  onDelete: (plan: Plan) => void;
  onToggleStatus: (plan: Plan) => void;
}

const PlanTable: React.FC<PlanTableProps> = ({
  plans,
  onEdit,
  onDelete,
  onToggleStatus,
}) => {
  const [openDropdown, setOpenDropdown] = React.useState<string | null>(null);

  React.useEffect(() => {
    const handleClickOutside = () => setOpenDropdown(null);
    if (openDropdown) {
      document.addEventListener("click", handleClickOutside);
      return () => document.removeEventListener("click", handleClickOutside);
    }
  }, [openDropdown]);

  const toggleDropdown = (e: React.MouseEvent, planId: string) => {
    e.stopPropagation();
    setOpenDropdown(openDropdown === planId ? null : planId);
  };

  return (
    <div className={styles.tableContainer}>
      <table className={styles.table}>
        <thead className={styles.thead}>
          <tr>
            <th className={styles.th}>플랜명</th>
            <th className={styles.th}>월 가격</th>
            <th className={styles.th}>결제 주기</th>
            <th className={styles.th}>상태</th>
            <th className={styles.th}>동작</th>
          </tr>
        </thead>
        <tbody>
          {plans.map((plan) => (
            <tr key={plan.plan_id} className={styles.tr}>
              <td className={styles.td}>
                <div className={styles.planName}>{plan.plan_name}</div>
              </td>
              <td className={styles.td}>
                <div className={styles.price}>
                  {plan.currency === "KRW" ? "₩" : "$"}
                  {plan.monthly_price.toLocaleString("ko-KR")}
                </div>
              </td>
              <td className={styles.td}>
                {plan.billing_cycle === "MONTHLY" ? "월간" : "연간"}
              </td>
              <td className={styles.td}>
                <span
                  className={
                    plan.is_active ? styles.statusActive : styles.statusInactive
                  }
                >
                  {plan.is_active ? "ACTIVE" : "INACTIVE"}
                </span>
              </td>
              <td className={styles.td}>
                <div style={{ position: "relative", display: "inline-block" }}>
                  <button
                    className={styles.actionMenuButton}
                    onClick={(e) => toggleDropdown(e, plan.plan_id)}
                  >
                    ⋮
                  </button>
                  {openDropdown === plan.plan_id && (
                    <div className={styles.dropdown}>
                      <button
                        className={styles.dropdownItem}
                        onClick={() => {
                          setOpenDropdown(null);
                          onEdit(plan);
                        }}
                      >
                        수정
                      </button>
                      <button
                        className={styles.dropdownItem}
                        onClick={() => {
                          setOpenDropdown(null);
                          onToggleStatus(plan);
                        }}
                      >
                        {plan.is_active ? "비활성화" : "활성화"}
                      </button>
                      <button
                        className={`${styles.dropdownItem} ${styles.dropdownItemRed}`}
                        onClick={() => {
                          setOpenDropdown(null);
                          onDelete(plan);
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
          {plans.length === 0 && (
            <tr>
              <td
                colSpan={5}
                style={{
                  textAlign: "center",
                  padding: "40px",
                  color: "#6b7280",
                }}
              >
                등록된 플랜이 없습니다.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default PlanTable;
