"use client";

import { memo } from "react";
import { ChevronRight, Folder, Plus } from "lucide-react";
import Link from "next/link";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  Button,
} from "@/shared/components/ui";
import useActiveWorkspaces from "@/modules/dashboard/hooks/useActiveWorkspaces";

interface Workspace {
  _id: string;
  title: string;
  isOwner: boolean;
  color: string;
}

const WorkspaceItem = memo(function WorkspaceItem({
  workspace,
}: {
  workspace: Workspace;
}) {
  return (
    <Link
      href={`/workspace/${workspace._id}`}
      prefetch={true}
      className="group flex items-center gap-3 px-4 py-3 rounded-lg bg-accent/50 hover:bg-accent border border-border hover:border-primary/50 transition-all duration-200"
    >
      <div
        style={{ backgroundColor: workspace.color }}
        className="w-1 h-8 rounded-full shrink-0"
      />

      <div
        style={{ backgroundColor: workspace.color }}
        className="p-2 rounded-lg text-white shrink-0"
      >
        <Folder size={16} />
      </div>

      <div className="flex-1 min-w-0">
        <h3 className="font-medium text-sm truncate group-hover:text-primary transition-colors">
          {workspace.title}
        </h3>
      </div>

      <ChevronRight
        size={16}
        className="text-muted-foreground group-hover:text-primary transition-colors shrink-0"
      />
    </Link>
  );
});

const ActiveWorkspaces = memo(function ActiveWorkspaces() {
  const {
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
  } = useActiveWorkspaces();

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {[1, 2].map((i) => (
          <Card key={i} className="border-0 shadow-md">
            <CardHeader>
              <div className="h-6 w-40 bg-muted rounded-lg animate-pulse mb-2" />
              <div className="h-4 w-24 bg-muted rounded-lg animate-pulse" />
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[...Array(3)].map((_, j) => (
                  <div
                    key={j}
                    className="h-14 bg-muted rounded-lg animate-pulse"
                  />
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Your Workspaces (Owner) */}
      <Card className="border-0 shadow-md">
        <CardHeader>
          <CardTitle>Your Workspaces</CardTitle>
          <CardDescription>
            {ownerWorkspaces.length} workspace
            {ownerWorkspaces.length !== 1 ? "s" : ""}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {ownerWorkspaces.length > 0 ? (
            <>
              <div className="space-y-2">
                {displayedOwnedWorkspaces.map((workspace) => (
                  <WorkspaceItem key={workspace._id} workspace={workspace} />
                ))}
              </div>

              {ownerWorkspaces.length > 5 && (
                <Button
                  onClick={toggleShowAllOwned}
                  variant="outline"
                  className="w-full"
                >
                  {showAllOwned ? (
                    <>Show Less</>
                  ) : (
                    <>Show All ({ownerWorkspaces.length})</>
                  )}
                </Button>
              )}
            </>
          ) : (
            <div className="text-center py-8">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-muted mb-3">
                <Folder size={24} className="text-muted-foreground" />
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                No workspaces yet
              </p>
              <Button onClick={openModal} size="sm" className="gap-2">
                <Plus size={16} />
                Create Workspace
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Shared With Me (Member) */}
      <Card className="border-0 shadow-md">
        <CardHeader>
          <CardTitle>Shared With Me</CardTitle>
          <CardDescription>
            {memberWorkspaces.length} workspace
            {memberWorkspaces.length !== 1 ? "s" : ""}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {memberWorkspaces.length > 0 ? (
            <>
              <div className="space-y-2">
                {displayedMemberWorkspaces.map((workspace) => (
                  <WorkspaceItem key={workspace._id} workspace={workspace} />
                ))}
              </div>

              {memberWorkspaces.length > 5 && (
                <Button
                  onClick={toggleShowAllMember}
                  variant="outline"
                  className="w-full"
                >
                  {showAllMember ? (
                    <>Show Less</>
                  ) : (
                    <>Show All ({memberWorkspaces.length})</>
                  )}
                </Button>
              )}
            </>
          ) : (
            <div className="text-center py-8">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-muted mb-3">
                <Folder size={24} className="text-muted-foreground" />
              </div>
              <p className="text-sm text-muted-foreground">
                No shared workspaces yet
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
});

export default ActiveWorkspaces;
