import { gql } from "graphql-request";

/**
 * Fetches all workspaces the user belongs to (owned + member).
 * Used by the main dashboard's ActiveWorkspaces component.
 */
export const ALL_WORKSPACES_QUERY = gql`
  query AllWorkspaces {
    allWorkspaces {
      _id
      title
      isOwner
      color
    }
  }
`;

/**
 * Fetches the full dashboard payload for a specific workspace.
 * Used by the workspace dashboard page (WorkspaceDashboardPage).
 */
export const WORKSPACE_DASHBOARD_QUERY = gql`
  query WorkspaceDashboard($workspaceId: ID!) {
    workspaceDashboard(workspaceId: $workspaceId) {
      workspace {
        _id
        title
        description
        color
        createdAt
      }
      stats {
        totalMembers
        totalPapers
        activityChange
      }
      topContributors {
        _id
        name
        email
        avatar
        role
        papersCount
      }
      recentPapers {
        _id
        title
        author
        savedAt
        tag
      }
      activityData {
        day
        value
      }
    }
  }
`;
