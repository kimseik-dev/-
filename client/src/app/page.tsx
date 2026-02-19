"use client";
import React, { useEffect, useState, Suspense } from "react";
import axios from "axios";
import { useSearchParams } from "next/navigation";
import { useModal } from "./context/ModalContext";
import styles from "./page.module.css";
import paginationStyles from "./components/Pagination.module.css";
import Pagination from "./components/Pagination";
import InvoiceTable from "./components/InvoiceTable";
import AddSubscriptionModal from "./components/AddSubscriptionModal";
import EditSubscriptionModal from "./components/EditSubscriptionModal";
import DashboardStats from "./components/DashboardStats";

function HomeContent() {
  const searchParams = useSearchParams();
  const search = searchParams.get("search") || "";
  const { showAlert, showConfirm } = useModal();

  const [invoices, setInvoices] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);

  const fetchInvoices = async (page = 1) => {
    try {
      setLoading(true);
      const [invoicesRes, statsRes] = await Promise.all([
        axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/invoices?page=${page}&limit=10&search=${search}`,
        ),
        axios.get(`${process.env.NEXT_PUBLIC_API_URL}/dashboard-stats`),
      ]);

      setInvoices(invoicesRes.data.invoices);
      setTotalPages(invoicesRes.data.pagination.totalPages);
      setStats(statsRes.data);
    } catch (error) {
      console.error("Failed to fetch data", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [search]);

  useEffect(() => {
    fetchInvoices(currentPage);
  }, [currentPage, search]);

  const handleAddSubscription = async (data: any) => {
    try {
      await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/subscription/add`,
        data,
      );
      await showAlert("구독이 추가되었습니다!");
      setIsAddModalOpen(false);
      fetchInvoices();
    } catch (error) {
      console.error(error);
      await showAlert("구독 추가에 실패했습니다.");
    }
  };

  const handleEditSubscription = async (data: any) => {
    try {
      await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/subscription/modify`,
        data,
      );

      await showAlert("구독이 수정되었습니다!");
      setIsEditModalOpen(false);
      fetchInvoices();
    } catch (error) {
      console.error(error);
      await showAlert("구독 수정에 실패했습니다.");
    }
  };

  const handleDeleteSubscription = async (invoice: any) => {
    if (
      !(await showConfirm(
        `'${invoice.customer.name}' 고객의 구독을 정말 삭제하시겠습니까?\n삭제된 데이터는 복구할 수 없습니다.`,
      ))
    )
      return;
    try {
      await axios.delete(
        `${process.env.NEXT_PUBLIC_API_URL}/subscription/delete/${invoice.subscription_id}`,
      );
      await showAlert("구독이 삭제되었습니다.");
      fetchInvoices();
    } catch (error) {
      console.error(error);
      await showAlert("구독 삭제에 실패했습니다.");
    }
  };

  const openEditModal = (invoice: any) => {
    setSelectedInvoice(invoice);
    setIsEditModalOpen(true);
  };

  return (
    <div className={styles.container}>
      <div className={styles.contentWrapper}>
        <div style={{ marginBottom: "30px" }}>
          <h1
            style={{
              fontSize: "2rem",
              fontWeight: "bold",
              marginBottom: "12px",
              color: "#1f2937",
            }}
          >
            대시보드
          </h1>
          <div
            style={{
              background: "#f9fafb",
              padding: "20px",
              borderRadius: "12px",
              border: "1px solid #e5e7eb",
            }}
          >
            <p
              style={{
                color: "#4b5563",
                marginBottom: "8px",
                lineHeight: "1.6",
              }}
            >
              <span
                style={{
                  fontWeight: "700",
                  color: "#111827",
                  marginRight: "8px",
                }}
              >
                역할:
              </span>
              메인 대시보드로, 핵심 비즈니스 지표(수익, 구독 수 등)를 확인하고
              구독자들의 실제 구독 현황을 관리하는 페이지입니다.
            </p>
            <p style={{ color: "#4b5563", lineHeight: "1.6" }}>
              <span
                style={{
                  fontWeight: "700",
                  color: "#111827",
                  marginRight: "8px",
                }}
              >
                사용방법:
              </span>
              상단 통계 카드로 현황 파악, 검색창으로 구독자 검색, '새 구독 추가'
              버튼으로 신규 구독 등록, 리스트에서 수정/삭제 작업 수행.
            </p>
          </div>
        </div>

        <DashboardStats stats={stats} />

        <div className={styles.listSection}>
          <div className={styles.listHeader}>
            <h2 className={styles.listTitle}>구독 목록</h2>
            <button
              className={styles.addButton}
              onClick={() => setIsAddModalOpen(true)}
            >
              <span>+</span> 새 구독 추가
            </button>
          </div>

          {loading && invoices.length === 0 ? (
            <div className={styles.loaderContainer}>
              <div className={styles.loader}></div>
            </div>
          ) : invoices.length > 0 ? (
            <div
              style={{
                opacity: loading ? 0.5 : 1,
                transition: "opacity 0.2s",
                pointerEvents: loading ? "none" : "auto",
              }}
            >
              <InvoiceTable
                invoices={invoices}
                startIndex={(currentPage - 1) * 10}
                onEdit={openEditModal}
                onDelete={handleDeleteSubscription}
              />

              <div className={paginationStyles.container}>
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={(page) => setCurrentPage(page)}
                />
              </div>
            </div>
          ) : (
            <div className={styles.emptyState}>
              <span className={styles.emptyStateIcon}>🔍</span>
              <p className={styles.emptyStateText}>No subscriptions found.</p>
              <p style={{ fontSize: "0.9rem", marginTop: "8px" }}>
                Try adjusting your search or add a new one.
              </p>
            </div>
          )}
        </div>
      </div>

      <AddSubscriptionModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSubmit={handleAddSubscription}
      />

      <EditSubscriptionModal
        isOpen={isEditModalOpen}
        invoice={selectedInvoice}
        onClose={() => setIsEditModalOpen(false)}
        onSubmit={handleEditSubscription}
      />
    </div>
  );
}

export default function Home() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <HomeContent />
    </Suspense>
  );
}
