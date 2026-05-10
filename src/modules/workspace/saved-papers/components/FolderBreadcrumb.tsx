"use client";

import { Home } from "lucide-react";
import { BreadcrumbItem } from "./types";
import {
  Breadcrumb,
  BreadcrumbItem as BreadcrumbItemUI,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
  Button,
} from "@/shared/components/ui";

interface FolderBreadcrumbProps {
  items: BreadcrumbItem[];
  onNavigate: (item: BreadcrumbItem) => void;
}

export default function FolderBreadcrumb({
  items,
  onNavigate,
}: FolderBreadcrumbProps) {
  // Don't render breadcrumbs if we're at root level
  if (items.length === 0) {
    return null;
  }

  return (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItemUI>
          <BreadcrumbLink asChild>
            <Button
              type="button"
              variant="ghost"
              onClick={() => onNavigate({ id: null, name: "Saved Papers" })}
              className="flex items-center gap-1.5 px-2 py-1 text-(--text-secondary) hover:text-(--text-primary)"
            >
              <Home size={14} />
              <span className="truncate max-w-[120px] sm:max-w-none">
                Saved Papers
              </span>
            </Button>
          </BreadcrumbLink>
        </BreadcrumbItemUI>

        {items.map((item, index) => (
          <div key={item.id || "root"} className="flex items-center gap-1">
            <BreadcrumbSeparator />
            <BreadcrumbItemUI>
              {index === items.length - 1 ? (
                <BreadcrumbPage className="truncate max-w-[120px] sm:max-w-none">
                  {item.name}
                </BreadcrumbPage>
              ) : (
                <BreadcrumbLink asChild>
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => onNavigate(item)}
                    className="flex items-center gap-1.5 px-2 py-1 text-(--text-secondary) hover:text-(--text-primary)"
                  >
                    <span className="truncate max-w-[120px] sm:max-w-none">
                      {item.name}
                    </span>
                  </Button>
                </BreadcrumbLink>
              )}
            </BreadcrumbItemUI>
          </div>
        ))}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
