import React, { useState, useEffect } from "react";
import axios from "axios";
import styles from "./Modal.module.css";

interface AddSubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
}

const AddSubscriptionModal: React.FC<AddSubscriptionModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
}) => {
  const [formData, setFormData] = useState({
    customer_id: "",
    plan_id: "",
    payment_method_token: "",
  });
  const [paymentType, setPaymentType] = useState<"RECURRING" | "ONE_TIME">(
    "RECURRING",
  );

  const [plans, setPlans] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedCustomerName, setSelectedCustomerName] = useState("");

  useEffect(() => {
    if (isOpen) {
      axios
        .get(`${process.env.NEXT_PUBLIC_API_URL}/plans?limit=100`)
        .then((res) => {
          const fetchedPlans = Array.isArray(res.data)
            ? res.data
            : res.data.plans;
          setPlans(fetchedPlans);
          // Set default plan if available and not selected
          if (fetchedPlans.length > 0 && !formData.plan_id) {
            setFormData((prev) => ({
              ...prev,
              plan_id: fetchedPlans[0].plan_id,
            }));
          }
        })
        .catch((err) => console.error("Failed to fetch plans", err));
    } else {
      // Reset state when modal closes
      setSearchTerm("");
      setSearchResults([]);
      setSelectedCustomerName("");
      setFormData({
        customer_id: "",
        plan_id: "",
        payment_method_token: "",
      });
      setPaymentType("RECURRING");
    }
  }, [isOpen]);

  // Debounced search for customers
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (searchTerm) {
        setIsSearching(true);
        axios
          .get(
            `${process.env.NEXT_PUBLIC_API_URL}/customers?search=${searchTerm}&limit=5`,
          )
          .then((res) => {
            setSearchResults(res.data.customers);
            setIsSearching(false);
          })
          .catch((err) => {
            console.error("Failed to search customers", err);
            setIsSearching(false);
          });
      } else {
        setSearchResults([]);
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.customer_id) {
      alert("고객을 선택해주세요.");
      return;
    }

    // Assign tokens based on payment type
    const finalData = {
      ...formData,
      payment_type: paymentType,
      payment_method_token:
        paymentType === "RECURRING" ? "tok_recurring_visa" : "tok_onetime_card",
    };

    onSubmit(finalData);
  };

  const selectCustomer = (customer: any) => {
    setFormData({ ...formData, customer_id: customer.customer_id });
    setSelectedCustomerName(`${customer.name} (${customer.email})`);
    setSearchTerm("");
    setSearchResults([]);
  };

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <h2 className={styles.title}>구독 추가</h2>
        <form onSubmit={handleSubmit}>
          <div className={styles.formGroup}>
            <label className={styles.label}>고객 검색</label>
            {selectedCustomerName ? (
              <div
                className={styles.input}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  backgroundColor: "#f3f4f6",
                }}
              >
                <span>{selectedCustomerName}</span>
                <button
                  type="button"
                  onClick={() => {
                    setFormData({ ...formData, customer_id: "" });
                    setSelectedCustomerName("");
                  }}
                  style={{
                    border: "none",
                    background: "none",
                    cursor: "pointer",
                    fontSize: "1.2rem",
                    color: "#6b7280",
                  }}
                >
                  ×
                </button>
              </div>
            ) : (
              <div style={{ position: "relative" }}>
                <input
                  type="text"
                  className={styles.input}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="고객 이름 또는 이메일 검색"
                />
                {isSearching && (
                  <div
                    style={{
                      position: "absolute",
                      right: "10px",
                      top: "50%",
                      transform: "translateY(-50%)",
                      fontSize: "0.8rem",
                      color: "#9ca3af",
                    }}
                  >
                    검색 중...
                  </div>
                )}
                {searchResults.length > 0 && (
                  <div
                    style={{
                      position: "absolute",
                      top: "100%",
                      left: 0,
                      right: 0,
                      background: "white",
                      border: "1px solid #e5e7eb",
                      borderRadius: "6px",
                      marginTop: "4px",
                      zIndex: 10,
                      boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                      maxHeight: "200px",
                      overflowY: "auto",
                    }}
                  >
                    {searchResults.map((customer) => (
                      <div
                        key={customer.customer_id}
                        onClick={() => selectCustomer(customer)}
                        style={{
                          padding: "10px 12px",
                          cursor: "pointer",
                          borderBottom: "1px solid #f3f4f6",
                          fontSize: "0.9rem",
                        }}
                        onMouseEnter={(e) =>
                          (e.currentTarget.style.backgroundColor = "#f9fafb")
                        }
                        onMouseLeave={(e) =>
                          (e.currentTarget.style.backgroundColor = "white")
                        }
                      >
                        <div style={{ fontWeight: 600, color: "#111827" }}>
                          {customer.name}
                        </div>
                        <div style={{ fontSize: "0.8rem", color: "#6b7280" }}>
                          {customer.email}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                {searchTerm && !isSearching && searchResults.length === 0 && (
                  <div
                    style={{ marginTop: 4, fontSize: "0.85rem", color: "#666" }}
                  >
                    검색 결과가 없습니다.
                  </div>
                )}
              </div>
            )}
          </div>
          <div className={styles.formGroup}>
            <label className={styles.label} htmlFor="plan_id">
              플랜
            </label>
            <select
              id="plan_id"
              title="플랜 선택"
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
                  checked={paymentType === "RECURRING"}
                  onChange={() => setPaymentType("RECURRING")}
                  className={styles.radioInput}
                />
                정기 결제 (매월 자동)
              </label>
              <label className={styles.radioLabel}>
                <input
                  type="radio"
                  name="paymentType"
                  value="ONE_TIME"
                  checked={paymentType === "ONE_TIME"}
                  onChange={() => setPaymentType("ONE_TIME")}
                  className={styles.radioInput}
                />
                단기 결제 (1회성)
              </label>
            </div>
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
              구독 추가
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddSubscriptionModal;
