"use client";
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useSearchParams } from "next/navigation";
import styles from "./page.module.css";
import PlanModal from "../components/PlanModal";
import PlanTable from "../components/PlanTable";
import Pagination from "../components/Pagination";
import { useModal } from "../context/ModalContext";

export interface Plan {
  plan_id: string;
  plan_name: string;
  monthly_price: number;
  billing_cycle: "MONTHLY" | "ANNUAL";
  currency: string;
  is_active: boolean;
}

export default function SubscriptionsContent() {
  const searchParams = useSearchParams();
  const search = searchParams.get("search") || "";
  const [plans, setPlans] = useState<Plan[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<Plan | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const { showAlert, showConfirm } = useModal();

  const fetchPlans = async (page = 1) => {
    try {
      setLoading(true);
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/plans?mode=management&search=${search}&page=${page}&limit=10`,
      );
      if (Array.isArray(res.data)) {
        setPlans(res.data);
        setTotalPages(1);
      } else {
        setPlans(res.data.plans);
        setTotalPages(res.data.pagination.totalPages);
      }
    } catch (error) {
      console.error("Failed to fetch plans", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [search]);

  useEffect(() => {
    fetchPlans(currentPage);
  }, [currentPage, search]);

  const handleCreate = async (data: any) => {
    try {
      await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/plans/add`, data);
      await showAlert("플랜이 추가되었습니다.");
      setIsModalOpen(false);
      fetchPlans();
    } catch (error) {
      console.error("Failed to create plan", error);
      await showAlert("플랜 추가에 실패했습니다.");
    }
  };

  const handleUpdate = async (data: any) => {
    if (!editingPlan) return;
    try {
      await axios.put(
        `${process.env.NEXT_PUBLIC_API_URL}/plans/modify/${editingPlan.plan_id}`,
        data,
      );
      await showAlert("플랜이 수정되었습니다.");
      setIsModalOpen(false);
      setEditingPlan(null);
      fetchPlans();
    } catch (error) {
      console.error("Failed to update plan", error);
      await showAlert("플랜 수정에 실패했습니다.");
    }
  };

  const handleDelete = async (plan: Plan) => {
    if (
      !(await showConfirm(
        `'${plan.plan_name}' 플랜을 정말 삭제하시겠습니까?\n삭제된 플랜은 복구할 수 없습니다.`,
      ))
    )
      return;
    try {
      await axios.delete(
        `${process.env.NEXT_PUBLIC_API_URL}/plans/delete/${plan.plan_id}`,
      );
      await showAlert("플랜이 삭제되었습니다.");
      fetchPlans();
    } catch (error: any) {
      console.error("Failed to delete plan", error);
      if (
        error.response &&
        error.response.status === 400 &&
        error.response.data &&
        error.response.data.error &&
        (error.response.data.error.includes(
          "being used by active subscriptions",
        ) ||
          error.response.data.error.includes("Cannot delete plan"))
      ) {
        await showAlert(
          "해당 플랜은 구독중인 사용자가 있어 삭제할 수 없습니다.",
        );
      } else if (
        error.response &&
        error.response.data &&
        error.response.data.error
      ) {
        await showAlert(`삭제 실패: ${error.response.data.error}`);
      } else {
        await showAlert("플랜 삭제에 실패했습니다.");
      }
    }
  };

  const handleToggleStatus = async (plan: Plan) => {
    const action = plan.is_active ? "비활성화" : "활성화";
    if (
      !(await showConfirm(`'${plan.plan_name}' 플랜을 ${action} 하시겠습니까?`))
    )
      return;
    try {
      await axios.patch(
        `${process.env.NEXT_PUBLIC_API_URL}/plans/modify/${plan.plan_id}/status`,
      );
      fetchPlans();
    } catch (error) {
      console.error("Failed to toggle plan status", error);
      await showAlert("상태 변경에 실패했습니다.");
    }
  };

  const openAddModal = () => {
    setEditingPlan(null);
    setIsModalOpen(true);
  };

  const openEditModal = (plan: Plan) => {
    setEditingPlan(plan);
    setIsModalOpen(true);
  };

  return (
    <div className={styles.container}>
      <div className={styles.contentWrapper}>
        <div className={styles.banner}>
          <div className={styles.bannerContent}>
            <h2>플랜 관리</h2>
            <div
              style={{ marginTop: "10px", fontSize: "0.95rem", opacity: 0.9 }}
            >
              <p style={{ marginBottom: "4px" }}>
                <strong>역할:</strong> 고객에게 제공할 구독 상품(Plan)을
                정의하고 관리하는 페이지입니다.
              </p>
              <p>
                <strong>사용방법:</strong> '새 플랜 추가'로 상품 생성,
                리스트에서 플랜 정보 수정/삭제, '활성화/비활성화'로 판매 상태
                관리.
              </p>
            </div>
          </div>
          <div style={{ fontSize: "4rem" }}>💳</div>
        </div>

        <div className={styles.listSection}>
          <div className={styles.listHeader}>
            <h2 className={styles.listTitle}>구독 플랜 목록</h2>
            <button className={styles.addButton} onClick={openAddModal}>
              <span>+</span> 새 플랜 추가
            </button>
          </div>

          {loading ? (
            <div className={styles.loaderContainer}>
              <div className={styles.loader}></div>
            </div>
          ) : (
            <>
              <PlanTable
                plans={plans}
                onEdit={openEditModal}
                onDelete={handleDelete}
                onToggleStatus={handleToggleStatus}
              />
              <div
                style={{
                  marginTop: "20px",
                  display: "flex",
                  justifyContent: "center",
                }}
              >
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={setCurrentPage}
                />
              </div>
            </>
          )}
        </div>
      </div>

      <PlanModal
        isOpen={isModalOpen}
        plan={editingPlan}
        onClose={() => setIsModalOpen(false)}
        onSubmit={editingPlan ? handleUpdate : handleCreate}
      />
    </div>
  );
}
