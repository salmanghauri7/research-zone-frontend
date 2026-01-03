import { createContext, ReactNode, useContext, useState } from "react";

interface WorkspaceContextType {
  isWorkspace: boolean;
  openWorkspace: () => void;
  closeWorkspace: () => void;
  hasWorkspaces: boolean;
  setHasWorkspaces: (value: boolean) => void;
}

const WorkspaceContext = createContext<WorkspaceContextType | undefined>(
  undefined
);

export const WorkspaceProvider = ({ children }: { children: ReactNode }) => {
  const [isWorkspace, setIsWorkspace] = useState<boolean>(false);
  const [hasWorkspaces, setHasWorkspaces] = useState<boolean>(false);
  const openWorkspace = () => setIsWorkspace(true);
  const closeWorkspace = () => setIsWorkspace(false);

  return (
    <WorkspaceContext value={{ isWorkspace, openWorkspace, closeWorkspace, hasWorkspaces, setHasWorkspaces }}>
      {children}
    </WorkspaceContext>
  );
};

export const useSideBar = () => {
  const context = useContext(WorkspaceContext);
  if (!context) {
    throw new Error("useSidebar must be used within a WorkspaceProvider");
  }
  return context;
};
