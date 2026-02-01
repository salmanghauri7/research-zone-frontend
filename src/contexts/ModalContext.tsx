import {
  createContext,
  useContext,
  useState,
  ReactNode,
  useMemo,
  useCallback,
} from "react";

interface ModalContextType {
  isCreateWorkspaceOpen: boolean;
  openModal: () => void;
  closeModal: () => void;
}

const ModalContext = createContext<ModalContextType | undefined>(undefined);

export const ModalProvider = ({ children }: { children: ReactNode }) => {
  const [isCreateWorkspaceOpen, setIsCreateWorkspaceOpen] =
    useState<boolean>(false);

  const openModal = useCallback(() => setIsCreateWorkspaceOpen(true), []);
  const closeModal = useCallback(() => setIsCreateWorkspaceOpen(false), []);

  // Memoize context value to prevent unnecessary re-renders
  const value = useMemo(
    () => ({ isCreateWorkspaceOpen, openModal, closeModal }),
    [isCreateWorkspaceOpen, openModal, closeModal],
  );

  return <ModalContext value={value}>{children}</ModalContext>;
};

export const useModal = () => {
  const context = useContext(ModalContext);
  if (!context) {
    throw new Error("useModal must be used within a ModalProvider");
  }
  return context;
};
