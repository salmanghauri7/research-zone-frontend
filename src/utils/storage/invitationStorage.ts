/**
 * Invitation Storage Utility
 * Manages localStorage for invitation acceptance flow
 *
 * Stores only 3 items:
 * - invitationToken: The token from the email link
 * - invitationFlag: Boolean flag indicating user is in invitation flow
 * - pendingWorkspaceId: The workspace ID to redirect to after acceptance
 */

const INVITATION_TOKEN_KEY = "invitationToken";
const INVITATION_FLAG_KEY = "invitationFlag";
const PENDING_WORKSPACE_ID_KEY = "pendingWorkspaceId";
const CURRENT_WORKSPACE_ID_KEY = "currentWorkspaceId";

/**
 * Save invitation token from URL
 */
export const saveInvitationToken = (token: string): void => {
  localStorage.setItem(INVITATION_TOKEN_KEY, token);
};

/**
 * Get stored invitation token
 */
export const getInvitationToken = (): string | null => {
  return localStorage.getItem(INVITATION_TOKEN_KEY);
};

/**
 * Set invitation flag to indicate user is in invitation flow
 */
export const setInvitationFlag = (value: boolean): void => {
  localStorage.setItem(INVITATION_FLAG_KEY, value.toString());
};

/**
 * Check if invitation flag is set
 */
export const hasInvitationFlag = (): boolean => {
  return localStorage.getItem(INVITATION_FLAG_KEY) === "true";
};

/**
 * Save workspace ID after token verification
 */
export const savePendingWorkspaceId = (workspaceId: string): void => {
  localStorage.setItem(PENDING_WORKSPACE_ID_KEY, workspaceId);
};

/**
 * Get pending workspace ID
 */
export const getPendingWorkspaceId = (): string | null => {
  return localStorage.getItem(PENDING_WORKSPACE_ID_KEY);
};

/**
 * Clear all invitation-related data from localStorage
 * Call this after successful workspace redirect
 */
export const clearInvitationData = (): void => {
  localStorage.removeItem(INVITATION_TOKEN_KEY);
  localStorage.removeItem(INVITATION_FLAG_KEY);
  localStorage.removeItem(PENDING_WORKSPACE_ID_KEY);
};

/**
 * Check if user is currently in invitation flow
 */
export const isInInvitationFlow = (): boolean => {
  return hasInvitationFlag() && getInvitationToken() !== null;
};

/**
 * Save current workspace ID when user enters a workspace
 */
export const saveCurrentWorkspaceId = (workspaceId: string): void => {
  localStorage.setItem(CURRENT_WORKSPACE_ID_KEY, workspaceId);
};

/**
 * Get the last visited workspace ID
 */
export const getCurrentWorkspaceId = (): string | null => {
  return localStorage.getItem(CURRENT_WORKSPACE_ID_KEY);
};
