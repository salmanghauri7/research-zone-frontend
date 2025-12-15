import { createContext, useContext, useState, ReactNode } from "react";

interface ModalContextType {
  isCreateWorkspaceOpen: boolean;
  openModal: () => void;
  closeModal: () => void;
}

const ModalContext = createContext<ModalContextType | undefined>(undefined);

export const ModalProvider = ({ children }: { children: ReactNode }) => {
  const [isCreateWorkspaceOpen, setIsCreateWorkspaceOpen] =
    useState<boolean>(false);
  const openModal = () => setIsCreateWorkspaceOpen(true);
  const closeModal = () => setIsCreateWorkspaceOpen(false);

  return (
    <ModalContext value={{ isCreateWorkspaceOpen, openModal, closeModal }}>
      {children}
    </ModalContext>
  );
};

export const useModal = () => {
  const context = useContext(ModalContext);
  if (!context) {
    throw new Error("useModal must be used within a ModalProvider");
  }
  return context;
};
