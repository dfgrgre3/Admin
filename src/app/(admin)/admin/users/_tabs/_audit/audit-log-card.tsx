"use client";

import { Clock, User } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";
import { getActionMeta, tryParseJson } from "./action-meta";
import type { AuditLog } from "./_audit-types";

interface AuditLogCardProps {
  log: AuditLog;
}

export function AuditLogCard({ log }: AuditLogCardProps) {
  const meta = getActionMeta(log.action);
  const Icon = meta.icon;
  const changes = tryParseJson(log.changes);

  return (
    <div className="flex items-start gap-4 p-4 rounded-xl bg-white/5 border border-white/5 hover:border-primary/20 transition-all">
      <div className="p-2 rounded-xl bg-primary/10 text-primary">
        <Icon className={`h-4 w-4 ${meta.className}`} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1 flex-wrap">
          <Badge variant="outline">{meta.label}</Badge>
          {log.resource && <Badge variant="secondary">{log.resource}</Badge>}
        </div>
        {changes && (
          <pre className="text-[11px] text-muted-foreground mt-1 whitespace-pre-wrap break-all bg-black/10 rounded-lg p-2">
            {JSON.stringify(changes, null, 2)}
          </pre>
        )}
        <div className="flex items-center gap-3 text-xs text-muted-foreground mt-2 flex-wrap">
          {log.performedBy && (
            <span className="flex items-center gap-1">
              <User className="h-3 w-3" />
              {log.performedBy}
            </span>
          )}
          <span className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {formatDate(log.createdAt)}
          </span>
          {log.ip && <span>• {log.ip}</span>}
        </div>
      </div>
    </div>
  );
}