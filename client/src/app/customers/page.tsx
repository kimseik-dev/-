"use client";
import React, { useEffect, useState, Suspense } from "react";
import axios from "axios";
import { useSearchParams } from "next/navigation";
import { useModal } from "../context/ModalContext";
import styles from "./page.module.css";
import paginationStyles from "../components/Pagination.module.css";
import CustomerTable from "../components/CustomerTable";
import AddCustomerModal from "../components/AddCustomerModal";
import EditCustomerModal from "../components/EditCustomerModal";
import Pagination from "../components/Pagination";
import CustomerStats from "../components/CustomerStats";

function CustomersContent() {
  const searchParams = useSearchParams();
  const search = searchParams.get("search") || "";
  const { showAlert, showConfirm } = useModal();

  const [customers, setCustomers] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);

  const fetchCustomers = async (page = 1) => {
    try {
      setLoading(true);
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/customers?page=${page}&limit=10&search=${search}`,
      );

      setCustomers(res.data.customers);
      setTotalPages(res.data.pagination.totalPages);
      setStats(res.data.stats);
    } catch (error) {
      console.error("Failed to fetch customers", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [search]);

  useEffect(() => {
    fetchCustomers(currentPage);
  }, [currentPage, search]);

  const handleAddCustomer = async (data: any) => {
    try {
      await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/customers/add`,
        data,
      );
      await showAlert("고객이 추가되었습니다!");
      setIsAddModalOpen(false);
      fetchCustomers(currentPage);
    } catch (error: any) {
      console.error(error);
      if (error.response && error.response.status === 400) {
        await showAlert(
          error.response.data.error || "고객 추가에 실패했습니다.",
        );
      } else {
        await showAlert("고객 추가에 실패했습니다.");
      }
    }
  };

  const handleEditCustomer = async (data: any) => {
    try {
      await axios.put(
        `${process.env.NEXT_PUBLIC_API_URL}/customers/modify/${data.customer_id}`,
        data,
      );

      await showAlert("고객 정보가 수정되었습니다!");
      setIsEditModalOpen(false);
      fetchCustomers(currentPage);
    } catch (error) {
      console.error(error);
      await showAlert("고객 수정에 실패했습니다.");
    }
  };

  const handleDeleteCustomer = async (customer: any) => {
    if (
      !(await showConfirm(
        `'${customer.name}' 고객을 삭제하시겠습니까?\n삭제시 되돌릴 수 없습니다.`,
      ))
    )
      return;
    try {
      await axios.delete(
        `${process.env.NEXT_PUBLIC_API_URL}/customers/delete/${customer.customer_id}`,
      );
      await showAlert("고객이 삭제되었습니다.");
      fetchCustomers(currentPage);
    } catch (error: any) {
      console.error(error);
      if (error.response && error.response.status === 400) {
        await showAlert(
          error.response.data.error || "고객 삭제에 실패했습니다.",
        );
      } else {
        await showAlert("고객 삭제에 실패했습니다.");
      }
    }
  };

  const openEditModal = (customer: any) => {
    setSelectedCustomer(customer);
    setIsEditModalOpen(true);
  };

  return (
    <div className={styles.container}>
      <div className={styles.contentWrapper}>
        <div className={styles.banner}>
          <div className={styles.bannerContent}>
            <h2>고객 관리</h2>
            <div
              style={{ marginTop: "10px", fontSize: "0.95rem", opacity: 0.9 }}
            >
              <p style={{ marginBottom: "4px" }}>
                <strong>역할:</strong> 서비스를 이용하는 고객 정보를 등록하고
                관리하는 페이지입니다.
              </p>
              <p>
                <strong>사용방법:</strong> '새 고객 추가'로 고객 등록, 고객 목록
                확인, 정보 수정 및 삭제.
              </p>
            </div>
          </div>
          <div className={styles.icon} style={{ fontSize: "4rem" }}>
            👥
          </div>
        </div>

        <CustomerStats stats={stats} />

        <div className={styles.listSection}>
          <div className={styles.listHeader}>
            <h2 className={styles.listTitle}>고객 목록</h2>
            <button
              className={styles.addButton}
              onClick={() => setIsAddModalOpen(true)}
            >
              <span>+</span> 새 고객 추가
            </button>
          </div>

          {loading && customers.length === 0 ? (
            <div className={styles.loaderContainer}>
              <div className={styles.loader}></div>
            </div>
          ) : customers.length > 0 ? (
            <div
              style={{
                opacity: loading ? 0.5 : 1,
                transition: "opacity 0.2s",
                pointerEvents: loading ? "none" : "auto",
              }}
            >
              <CustomerTable
                customers={customers}
                onEdit={openEditModal}
                onDelete={handleDeleteCustomer}
              />

              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={(page) => setCurrentPage(page)}
              />
            </div>
          ) : (
            <div className={styles.emptyState}>
              <span className={styles.emptyStateIcon}>🔍</span>
              <p className={styles.emptyStateText}>No customers found.</p>
              <p style={{ fontSize: "0.9rem", marginTop: "8px" }}>
                Add a new customer to get started.
              </p>
            </div>
          )}
        </div>
      </div>

      <AddCustomerModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSubmit={handleAddCustomer}
      />

      <EditCustomerModal
        isOpen={isEditModalOpen}
        customer={selectedCustomer}
        onClose={() => setIsEditModalOpen(false)}
        onSubmit={handleEditCustomer}
      />
    </div>
  );
}

export default function CustomersPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <CustomersContent />
    </Suspense>
  );
}
