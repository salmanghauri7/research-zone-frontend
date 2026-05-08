import { useEffect, useState, useCallback, useMemo } from "react";
import workspaceApi from "@/api/workspaceApi";
import { useModal } from "@/contexts/ModalContext";

interface Workspace {
  _id: string;
  title: string;
  isOwner: boolean;
  color: string;
}

export default function useActiveWorkspaces() {
  const [showAllOwned, setShowAllOwned] = useState(false);
  const [showAllMember, setShowAllMember] = useState(false);
  const [ownerWorkspaces, setOwnerWorkspaces] = useState<Workspace[]>([]);
  const [memberWorkspaces, setMemberWorkspaces] = useState<Workspace[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { openModal } = useModal();

  useEffect(() => {
    let isMounted = true;

    const fetchWorkspaces = async () => {
      try {
        const response = await workspaceApi.getWorkspaces();
        const workspaces = response.data.data || [];

        if (isMounted) {
          const owned = workspaces.filter((ws: Workspace) => ws.isOwner);
          const member = workspaces.filter((ws: Workspace) => !ws.isOwner);

          setOwnerWorkspaces(owned);
          setMemberWorkspaces(member);
        }
      } catch (error) {
        console.error("failed to fetch workspaces:", error);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchWorkspaces();

    return () => {
      isMounted = false;
    };
  }, []);

  const toggleShowAllOwned = useCallback(() => {
    setShowAllOwned((prev) => !prev);
  }, []);

  const toggleShowAllMember = useCallback(() => {
    setShowAllMember((prev) => !prev);
  }, []);

  const displayedOwnedWorkspaces = useMemo(
    () => (showAllOwned ? ownerWorkspaces : ownerWorkspaces.slice(0, 5)),
    [showAllOwned, ownerWorkspaces],
  );

  const displayedMemberWorkspaces = useMemo(
    () => (showAllMember ? memberWorkspaces : memberWorkspaces.slice(0, 5)),
    [showAllMember, memberWorkspaces],
  );

  return {
    ownerWorkspaces,
    memberWorkspaces,
    isLoading,
    showAllOwned,
    showAllMember,
    displayedOwnedWorkspaces,
    displayedMemberWorkspaces,
    toggleShowAllOwned,
    toggleShowAllMember,
    openModal,
  };
}
