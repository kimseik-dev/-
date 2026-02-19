"use client";
import React, { useEffect, useState, Suspense } from "react";
import axios from "axios";
import { useSearchParams } from "next/navigation";
import styles from "./page.module.css";
import BillingTable from "../components/BillingTable";
import { useModal } from "../context/ModalContext";

function InvoicesContent() {
  const searchParams = useSearchParams();
  const search = searchParams.get("search") || "";
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [resetting, setResetting] = useState(false);
  const { showAlert, showConfirm } = useModal();

  const fetchInvoices = async () => {
    try {
      setLoading(true);
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/billing/history?search=${search}`,
      );
      setInvoices(res.data);
    } catch (error) {
      console.error("Failed to fetch invoices", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, [search]);

  const handleGenerateInvoices = async () => {
    try {
      setGenerating(true);
      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/billing/generate`,
      );
      await showAlert(res.data.message);
      fetchInvoices();
    } catch (error) {
      console.error("Failed to generate invoices", error);
      await showAlert("청구서 생성 중 오류가 발생했습니다.");
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.contentWrapper}>
        <div className={styles.banner}>
          <div className={styles.bannerContent}>
            <h2>청구서 관리</h2>
            <div
              style={{ marginTop: "10px", fontSize: "0.95rem", opacity: 0.9 }}
            >
              <p style={{ marginBottom: "4px" }}>
                <strong>역할:</strong> 발생한 청구 내역(Invoice)을 조회하고,
                매일 발생하는 청구서를 생성/관리하는 페이지입니다.
              </p>
              <p>
                <strong>사용방법:</strong> 청구서 생성을 위해서는 오늘 날짜
                기준으로 결제해야 하는 고객 데이터(당일 및 이전 날짜)가
                필요합니다. '오늘의 청구서 생성'을 클릭하면 결제가 완료된 내역을
                확인할 수 있습니다.
              </p>
            </div>
          </div>
          <div style={{ fontSize: "4rem" }}>📄</div>
        </div>

        <div className={styles.listSection}>
          <div className={styles.listHeader}>
            <h2 className={styles.listTitle}>청구 내역</h2>
            <div style={{ display: "flex", gap: "8px" }}>
              <button
                className={styles.generateButton}
                onClick={handleGenerateInvoices}
                disabled={generating}
                style={{
                  opacity: generating ? 0.7 : 1,
                  cursor: generating ? "not-allowed" : "pointer",
                }}
              >
                <span>⚡</span>{" "}
                {generating
                  ? "생성 중..."
                  : "오늘의 청구서 생성 (스케줄러 실행)"}
              </button>{" "}
              <button
                onClick={async () => {
                  if (
                    !(await showConfirm(
                      "정말로 모든 청구 내역을 초기화하시겠습니까?\n이 작업은 되돌릴 수 없습니다.",
                    ))
                  )
                    return;
                  try {
                    setResetting(true);
                    const res = await axios.post(
                      `${process.env.NEXT_PUBLIC_API_URL}/debug/reset-invoices`,
                    );
                    await showAlert(`초기화 완료!\n${res.data.message}`);
                    fetchInvoices();
                  } catch (error) {
                    console.error(error);
                    await showAlert("청구 내역 초기화 실패");
                  } finally {
                    setResetting(false);
                  }
                }}
                disabled={resetting}
                style={{
                  padding: "12px 16px",
                  borderRadius: "10px",
                  border: "1px solid #d1d5db",
                  background: "white",
                  fontWeight: 600,
                  cursor: resetting ? "not-allowed" : "pointer",
                  color: "#dc2626", // Red color for warning
                  display: "flex",
                  alignItems: "center",
                  fontSize: "0.9rem",
                  marginLeft: "8px",
                  opacity: resetting ? 0.7 : 1,
                }}
              >
                {resetting ? "초기화 중..." : "🗑️ 청구 내역 초기화"}
              </button>
            </div>
          </div>

          {loading ? (
            <div className={styles.loaderContainer}>
              <div className={styles.loader}></div>
            </div>
          ) : (
            <>
              <BillingTable invoices={invoices} />
              {/* Pagination placeholder - to be implemented in backend */}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default function InvoicesPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <InvoicesContent />
    </Suspense>
  );
}
