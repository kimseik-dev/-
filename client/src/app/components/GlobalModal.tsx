"use client";
import React from "react";
import { useModal } from "../context/ModalContext";
import styles from "./Modal.module.css";

const GlobalModal = () => {
  const { modalState, closeModal } = useModal();
  const { isOpen, type, message, title } = modalState;

  if (!isOpen) return null;

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <h2 className={styles.title}>{title}</h2>
        <div className={styles.formGroup}>
          <p
            className={styles.label}
            style={{ fontSize: "1rem", fontWeight: 400 }}
          >
            {message}
          </p>
        </div>
        <div className={styles.actions}>
          {type === "confirm" && (
            <button
              onClick={() => closeModal(false)}
              className={styles.cancelButton}
            >
              취소
            </button>
          )}
          <button
            onClick={() => closeModal(true)}
            className={styles.submitButton}
          >
            확인
          </button>
        </div>
      </div>
    </div>
  );
};

export default GlobalModal;
