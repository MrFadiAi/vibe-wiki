"use client";

import { FileText, GraduationCap, Map, Code2, Clock, User, Calendar } from "lucide-react";
import type { Contribution, ContributionType } from "@/types";

const TYPE_ICONS: Record<ContributionType, React.ReactNode> = {
  article: <FileText className="h-4 w-4" />,
  tutorial: <GraduationCap className="h-4 w-4" />,
  example: <Code2 className="h-4 w-4" />,
  path: <Map className="h-4 w-4" />,
};

const STATUS_COLORS: Record<string, string> = {
  draft: "bg-gray-500/20 text-gray-300 border-gray-500/30",
  submitted: "bg-blue-500/20 text-blue-300 border-blue-500/30",
  under_review: "bg-yellow-500/20 text-yellow-300 border-yellow-500/30",
  approved: "bg-green-500/20 text-green-300 border-green-500/30",
  rejected: "bg-red-500/20 text-red-300 border-red-500/30",
  published: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
};

const DIFFICULTY_COLORS: Record<string, string> = {
  beginner: "bg-green-500/20 text-green-300",
  intermediate: "bg-yellow-500/20 text-yellow-300",
  advanced: "bg-red-500/20 text-red-300",
};

const STATUS_LABELS: Record<string, string> = {
  draft: "Draft",
  submitted: "Submitted",
  under_review: "Under Review",
  approved: "Approved",
  rejected: "Rejected",
  published: "Published",
};

export interface ContributionCardProps {
  contribution: Contribution;
  onClick?: () => void;
  showAuthor?: boolean;
  showActions?: boolean;
  actions?: React.ReactNode;
}

export function ContributionCard({
  contribution,
  onClick,
  showAuthor = true,
  showActions = false,
  actions,
}: ContributionCardProps) {
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    }).format(date);
  };

  return (
    <article
      onClick={onClick}
      className={`group relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-6 transition-all ${
        onClick ? "cursor-pointer hover:border-white/20 hover:bg-white/10" : ""
      }`}
    >
      {/* Status indicator */}
      <div className="absolute right-4 top-4">
        <span
          className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium ${
            STATUS_COLORS[contribution.status]
          }`}
        >
          {STATUS_LABELS[contribution.status]}
        </span>
      </div>

      <div className="flex flex-col gap-4">
        {/* Type badge and icon */}
        <div className="flex items-start gap-3">
          <div className="rounded-lg bg-neon-cyan/10 p-2.5 text-neon-cyan ring-1 ring-neon-cyan/20 group-hover:scale-110 group-hover:bg-neon-cyan/20 transition-all duration-300">
            {TYPE_ICONS[contribution.type]}
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold leading-7 group-hover:text-neon-cyan transition-colors">
              {contribution.title}
            </h3>
            <p className="mt-2 text-sm leading-6 text-muted-foreground line-clamp-2">
              {contribution.description}
            </p>
          </div>
        </div>

        {/* Metadata */}
        <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
          {contribution.estimatedMinutes && (
            <span className="inline-flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {contribution.estimatedMinutes} min
            </span>
          )}

          {contribution.difficulty && (
            <span
              className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 ${
                DIFFICULTY_COLORS[contribution.difficulty]
              }`}
            >
              {contribution.difficulty}
            </span>
          )}

          <span className="inline-flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            {formatDate(contribution.createdAt)}
          </span>

          {showAuthor && (
            <span className="inline-flex items-center gap-1">
              <User className="h-3 w-3" />
              {contribution.authorId}
            </span>
          )}
        </div>

        {/* Tags */}
        {contribution.tags && contribution.tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {contribution.tags.slice(0, 5).map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center rounded-md bg-white/5 px-2 py-1 text-xs text-muted-foreground ring-1 ring-white/10"
              >
                {tag}
              </span>
            ))}
            {contribution.tags.length > 5 && (
              <span className="inline-flex items-center rounded-md bg-white/5 px-2 py-1 text-xs text-muted-foreground ring-1 ring-white/10">
                +{contribution.tags.length - 5}
              </span>
            )}
          </div>
        )}

        {/* Learning objectives for tutorials and paths */}
        {contribution.learningObjectives && contribution.learningObjectives.length > 0 && (
          <div className="rounded-lg bg-white/5 p-3 ring-1 ring-white/10">
            <p className="text-xs font-medium text-muted-foreground mb-2">Learning Objectives</p>
            <ul className="space-y-1">
              {contribution.learningObjectives.slice(0, 3).map((objective, index) => (
                <li key={index} className="text-xs text-foreground/80 flex items-start gap-2">
                  <span className="text-neon-cyan">•</span>
                  <span className="line-clamp-1">{objective}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Review notes if present */}
        {contribution.reviewNotes && contribution.reviewNotes.length > 0 && (
          <div className="rounded-lg bg-yellow-500/10 p-3 ring-1 ring-yellow-500/20">
            <p className="text-xs font-medium text-yellow-300 mb-1">Review Notes</p>
            <ul className="space-y-1">
              {contribution.reviewNotes.map((note, index) => (
                <li key={index} className="text-xs text-yellow-200/80">
                  • {note}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Rejection reason */}
        {contribution.rejectionReason && (
          <div className="rounded-lg bg-red-500/10 p-3 ring-1 ring-red-500/20">
            <p className="text-xs font-medium text-red-300 mb-1">Rejection Reason</p>
            <p className="text-xs text-red-200/80">{contribution.rejectionReason}</p>
          </div>
        )}

        {/* Actions */}
        {showActions && actions && (
          <div className="flex items-center gap-2 pt-2 border-t border-white/10">
            {actions}
          </div>
        )}
      </div>
    </article>
  );
}
