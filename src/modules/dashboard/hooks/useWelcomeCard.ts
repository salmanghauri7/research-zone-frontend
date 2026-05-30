import { useCallback, useEffect, useState, useRef } from "react";
import { useModal } from "@/contexts/ModalContext";
import { graphqlRequest } from "@/lib/graphqlClient";
import { USER_DASHBOARD_STATS_QUERY } from "@/graphql/queries/dashboard";

export default function useWelcomeCard() {
  const { openModal } = useModal();
  const [stats, setStats] = useState({ totalWorkspaces: 0, totalPapers: 0 });
  const [isLoadingStats, setIsLoadingStats] = useState(true);
  const fetchInitiated = useRef(false);

  const handleCreateWorkspace = useCallback(() => {
    openModal();
  }, [openModal]);

  useEffect(() => {
    let isMounted = true;
    
    const fetchStats = async () => {
      if (fetchInitiated.current) return;
      fetchInitiated.current = true;
      
      try {
        const data = await graphqlRequest<{ userDashboardStats: { totalWorkspaces: number; totalPapers: number } }>(
          USER_DASHBOARD_STATS_QUERY
        );
        if (isMounted && data.userDashboardStats) {
          setStats(data.userDashboardStats);
        }
      } catch (error) {
        console.error("Failed to fetch user dashboard stats:", error);
      } finally {
        if (isMounted) {
          setIsLoadingStats(false);
        }
      }
    };

    fetchStats();

    return () => {
      isMounted = false;
    };
  }, []);

  return {
    handleCreateWorkspace,
    stats,
    isLoadingStats,
  };
}
