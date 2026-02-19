import React, { useState, useEffect } from "react";
import axios from "axios";
import styles from "./Modal.module.css";

interface EditSubscriptionModalProps {
  isOpen: boolean;
  invoice: any;
  onClose: () => void;
  onSubmit: (data: any) => void;
}

const EditSubscriptionModal: React.FC<EditSubscriptionModalProps> = ({
  isOpen,
  invoice,
  onClose,
  onSubmit,
}) => {
  const [formData, setFormData] = useState({
    subscription_id: "",
    plan_id: "",
    status: "",
    payment_type: "RECURRING",
  });
  const [plans, setPlans] = useState<any[]>([]);

  useEffect(() => {
    if (isOpen) {
      axios
        .get(`${process.env.NEXT_PUBLIC_API_URL}/plans?limit=100`)
        .then((res) => {
          if (Array.isArray(res.data)) {
            setPlans(res.data);
          } else {
            setPlans(res.data.plans);
          }
        })
        .catch((err) => console.error("Failed to fetch plans", err));
    }
  }, [isOpen]);

  useEffect(() => {
    if (invoice) {
      setFormData({
        subscription_id: invoice.subscription_id,
        plan_id: invoice.plan_id,
        status: invoice.status,
        payment_type: invoice.payment_type || "RECURRING",
      });
    }
  }, [invoice]);

  if (!isOpen || !invoice) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <h2 className={styles.title}>구독 수정</h2>
        <form onSubmit={handleSubmit}>
          <div className={styles.formGroup}>
            <label className={styles.label} htmlFor="plan_id">
              플랜
            </label>
            <select
              id="plan_id"
              className={styles.select}
              value={formData.plan_id}
              onChange={(e) =>
                setFormData({ ...formData, plan_id: e.target.value })
              }
              required
            >
              <option value="" disabled>
                플랜 선택
              </option>
              {plans.map((plan) => (
                <option key={plan.plan_id} value={plan.plan_id}>
                  {plan.plan_name} ({plan.currency === "KRW" ? "₩" : "$"}
                  {Number(plan.monthly_price).toLocaleString("ko-KR")})
                </option>
              ))}
            </select>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>결제 방식</label>
            <div className={styles.radioGroup}>
              <label className={styles.radioLabel}>
                <input
                  type="radio"
                  name="paymentType"
                  value="RECURRING"
                  checked={formData.payment_type === "RECURRING"}
                  onChange={() =>
                    setFormData({ ...formData, payment_type: "RECURRING" })
                  }
                  className={styles.radioInput}
                />
                정기 결제 (매월 자동)
              </label>
              <label className={styles.radioLabel}>
                <input
                  type="radio"
                  name="paymentType"
                  value="ONE_TIME"
                  checked={formData.payment_type === "ONE_TIME"}
                  onChange={() =>
                    setFormData({ ...formData, payment_type: "ONE_TIME" })
                  }
                  className={styles.radioInput}
                />
                단기 결제 (1회성)
              </label>
            </div>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label} htmlFor="status">
              상태
            </label>
            <select
              id="status"
              className={styles.select}
              value={formData.status}
              onChange={(e) =>
                setFormData({ ...formData, status: e.target.value })
              }
            >
              <option value="ACTIVE">활성 (ACTIVE)</option>
              <option value="INACTIVE">비활성 (INACTIVE)</option>
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
              변경 사항 저장
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditSubscriptionModal;
