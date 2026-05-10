import { useCallback } from "react";
import { useModal } from "@/contexts/ModalContext";

export default function useWelcomeCard() {
  const { openModal } = useModal();

  const handleCreateWorkspace = useCallback(() => {
    openModal();
  }, [openModal]);

  return {
    handleCreateWorkspace,
  };
}
