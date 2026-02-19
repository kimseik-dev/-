import React, { useState, useEffect } from "react";
import styles from "./Modal.module.css";

interface EditCustomerModalProps {
  isOpen: boolean;
  customer: any;
  onClose: () => void;
  onSubmit: (data: any) => void;
}

const EditCustomerModal: React.FC<EditCustomerModalProps> = ({
  isOpen,
  customer,
  onClose,
  onSubmit,
}) => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    status: "ACTIVE",
  });

  useEffect(() => {
    if (customer) {
      setFormData({
        name: customer.name,
        email: customer.email,
        status: customer.status,
      });
    }
  }, [customer]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ ...formData, customer_id: customer.customer_id });
  };

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <h2 className={styles.title}>고객 정보 수정</h2>
        <form onSubmit={handleSubmit}>
          <div className={styles.formGroup}>
            <label className={styles.label}>이름</label>
            <input
              type="text"
              className={styles.input}
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              placeholder="고객 이름 입력"
              required
            />
          </div>
          <div className={styles.formGroup}>
            <label className={styles.label}>이메일</label>
            <input
              type="email"
              className={styles.input}
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              placeholder="이메일 입력"
              required
            />
          </div>
          <div className={styles.formGroup}>
            <label className={styles.label}>상태</label>
            <select
              title="상태"
              className={styles.select}
              value={formData.status}
              onChange={(e) =>
                setFormData({ ...formData, status: e.target.value })
              }
            >
              <option value="ACTIVE">활성</option>
              <option value="INACTIVE">비활성</option>
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
              수정
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditCustomerModal;
