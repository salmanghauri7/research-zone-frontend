import { useEffect, useState, useCallback, useMemo, useRef } from "react";
import { graphqlRequest } from "@/lib/graphqlClient";
import { ALL_WORKSPACES_QUERY } from "@/graphql/queries/dashboard";
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
  const fetchInitiated = useRef(false);

  useEffect(() => {
    let isMounted = true;

    const fetchWorkspaces = async () => {
      if (fetchInitiated.current) return;
      fetchInitiated.current = true;

      try {
        const data = await graphqlRequest<{ allWorkspaces: Workspace[] }>(
          ALL_WORKSPACES_QUERY,
        );
        const workspaces = data.allWorkspaces || [];

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
