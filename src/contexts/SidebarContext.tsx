import {
  createContext,
  ReactNode,
  useContext,
  useState,
  useMemo,
  useCallback,
} from "react";

interface WorkspaceContextType {
  isWorkspace: boolean;
  openWorkspace: () => void;
  closeWorkspace: () => void;
}

const WorkspaceContext = createContext<WorkspaceContextType | undefined>(
  undefined,
);

export const WorkspaceProvider = ({ children }: { children: ReactNode }) => {
  const [isWorkspace, setIsWorkspace] = useState<boolean>(false);

  const openWorkspace = useCallback(() => setIsWorkspace(true), []);
  const closeWorkspace = useCallback(() => setIsWorkspace(false), []);

  // Memoize context value to prevent unnecessary re-renders
  const value = useMemo(
    () => ({ isWorkspace, openWorkspace, closeWorkspace }),
    [isWorkspace, openWorkspace, closeWorkspace],
  );

  return <WorkspaceContext value={value}>{children}</WorkspaceContext>;
};

export const useSideBar = () => {
  const context = useContext(WorkspaceContext);
  if (!context) {
    throw new Error("useSidebar must be used within a WorkspaceProvider");
  }
  return context;
};
