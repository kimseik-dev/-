import React, { useState, useEffect } from "react";
import styles from "./Modal.module.css";

interface PlanModalProps {
  isOpen: boolean;
  plan?: any; // If provided, it's edit mode
  onClose: () => void;
  onSubmit: (data: any) => void;
}

const PlanModal: React.FC<PlanModalProps> = ({
  isOpen,
  plan,
  onClose,
  onSubmit,
}) => {
  const [formData, setFormData] = useState({
    plan_name: "",
    monthly_price: "",
    billing_cycle: "MONTHLY",
    currency: "KRW",
  });

  useEffect(() => {
    if (plan) {
      setFormData({
        plan_name: plan.plan_name,
        monthly_price: plan.monthly_price,
        billing_cycle: plan.billing_cycle,
        currency: plan.currency || "KRW",
      });
    } else {
      setFormData({
        plan_name: "",
        monthly_price: "",
        billing_cycle: "MONTHLY",
        currency: "KRW",
      });
    }
  }, [plan, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      monthly_price: parseFloat(formData.monthly_price),
    });
  };

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <h2 className={styles.title}>{plan ? "플랜 수정" : "새 플랜 추가"}</h2>
        <form onSubmit={handleSubmit}>
          <div className={styles.formGroup}>
            <label className={styles.label} htmlFor="plan_name">
              플랜명
            </label>
            <input
              id="plan_name"
              type="text"
              className={styles.input}
              value={formData.plan_name}
              onChange={(e) =>
                setFormData({ ...formData, plan_name: e.target.value })
              }
              placeholder="예: 프로, 베이직"
              required
            />
          </div>
          <div className={styles.formGroup}>
            <label className={styles.label} htmlFor="monthly_price">
              월 가격 (₩)
            </label>
            <input
              id="monthly_price"
              type="number"
              step="100"
              className={styles.input}
              value={formData.monthly_price}
              onChange={(e) =>
                setFormData({ ...formData, monthly_price: e.target.value })
              }
              placeholder="9900"
              required
            />
          </div>
          <div className={styles.formGroup}>
            <label className={styles.label} htmlFor="billing_cycle">
              결제 주기
            </label>
            <select
              id="billing_cycle"
              className={styles.select}
              value={formData.billing_cycle}
              onChange={(e) =>
                setFormData({ ...formData, billing_cycle: e.target.value })
              }
            >
              <option value="MONTHLY">월간 (MONTHLY)</option>
              <option value="ANNUAL">연간 (ANNUAL)</option>
            </select>
          </div>
          <div className={styles.actions}>
            <button
              type="button"
              onClick={onClose}
              className={styles.cancelButton}
            >
              취소
            </button>
            <button type="submit" className={styles.submitButton}>
              {plan ? "수정 완료" : "플랜 추가"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PlanModal;
