"use client";
import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  ReactNode,
} from "react";

type ModalType = "alert" | "confirm";

interface ModalState {
  isOpen: boolean;
  type: ModalType;
  message: string;
  title?: string;
}

interface ModalContextType {
  showAlert: (message: string, title?: string) => Promise<void>;
  showConfirm: (message: string, title?: string) => Promise<boolean>;
  closeModal: (result?: boolean) => void;
  modalState: ModalState;
}

const ModalContext = createContext<ModalContextType | undefined>(undefined);

export const ModalProvider = ({ children }: { children: ReactNode }) => {
  const [modalState, setModalState] = useState<ModalState>({
    isOpen: false,
    type: "alert",
    message: "",
    title: "",
  });

  const [resolveCallback, setResolveCallback] = useState<(value: any) => void>(
    () => {},
  );

  const showAlert = useCallback(
    (message: string, title?: string): Promise<void> => {
      return new Promise((resolve) => {
        setModalState({
          isOpen: true,
          type: "alert",
          message,
          title: title || "알림",
        });
        setResolveCallback(() => resolve);
      });
    },
    [],
  );

  const showConfirm = useCallback(
    (message: string, title?: string): Promise<boolean> => {
      return new Promise((resolve) => {
        setModalState({
          isOpen: true,
          type: "confirm",
          message,
          title: title || "확인",
        });
        setResolveCallback(() => resolve);
      });
    },
    [],
  );

  const closeModal = useCallback(
    (result?: boolean) => {
      setModalState((prev) => ({ ...prev, isOpen: false }));
      if (modalState.type === "confirm") {
        resolveCallback(result ?? false);
      } else {
        resolveCallback(undefined);
      }
    },
    [modalState.type, resolveCallback],
  );

  return (
    <ModalContext.Provider
      value={{ showAlert, showConfirm, closeModal, modalState }}
    >
      {children}
    </ModalContext.Provider>
  );
};

export const useModal = () => {
  const context = useContext(ModalContext);
  if (!context) {
    throw new Error("useModal must be used within a ModalProvider");
  }
  return context;
};
