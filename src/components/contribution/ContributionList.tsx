"use client";

import { motion } from "framer-motion";
import { FileText, GraduationCap, Code2, Map, Filter } from "lucide-react";
import type { Contribution, ContributionType, ContributionStatus, DifficultyLevel } from "@/types";
import { ContributionCard } from "./ContributionCard";
import { Button } from "@/components/ui/button";

const TYPE_ICONS: Record<ContributionType, React.ReactNode> = {
  article: <FileText className="h-4 w-4" />,
  tutorial: <GraduationCap className="h-4 w-4" />,
  example: <Code2 className="h-4 w-4" />,
  path: <Map className="h-4 w-4" />,
};

const TYPE_LABELS: Record<ContributionType, string> = {
  article: "Articles",
  tutorial: "Tutorials",
  example: "Examples",
  path: "Paths",
};

const STATUS_LABELS: Record<ContributionStatus, string> = {
  draft: "Drafts",
  submitted: "Submitted",
  under_review: "Under Review",
  approved: "Approved",
  rejected: "Rejected",
  published: "Published",
};

const DIFFICULTY_LABELS: Record<DifficultyLevel, string> = {
  beginner: "Beginner",
  intermediate: "Intermediate",
  advanced: "Advanced",
};

export interface ContributionListProps {
  contributions: Contribution[];
  title?: string;
  description?: string;
  emptyMessage?: string;
  emptyIcon?: React.ReactNode;
  showAuthor?: boolean;
  showFilters?: boolean;
  onContributionClick?: (contribution: Contribution) => void;
  renderActions?: (contribution: Contribution) => React.ReactNode;
  className?: string;
}

export function ContributionList({
  contributions,
  title,
  description,
  emptyMessage = "No contributions found",
  emptyIcon,
  showAuthor = true,
  showFilters = false,
  onContributionClick,
  renderActions,
  className = "",
}: ContributionListProps) {
  const [selectedTypes, setSelectedTypes] = React.useState<ContributionType[]>([]);
  const [selectedStatuses, setSelectedStatuses] = React.useState<ContributionStatus[]>([]);
  const [selectedDifficulties, setSelectedDifficulties] = React.useState<DifficultyLevel[]>([]);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [sortBy, setSortBy] = React.useState<"recent" | "oldest" | "title">("recent");

  // Get unique values for filters
  const availableTypes = Array.from(
    new Set(contributions.map((c) => c.type))
  ).sort();
  const availableStatuses = Array.from(
    new Set(contributions.map((c) => c.status))
  ).sort();
  const availableDifficulties = Array.from(
    new Set(contributions.map((c) => c.difficulty).filter(Boolean) as DifficultyLevel[])
  ).sort();

  // Toggle filter
  const toggleFilter = <T,>(
    current: T[],
    setter: (value: T[]) => void,
    value: T
  ) => {
    if (current.includes(value)) {
      setter(current.filter((v) => v !== value));
    } else {
      setter([...current, value]);
    }
  };

  // Clear all filters
  const clearFilters = () => {
    setSelectedTypes([]);
    setSelectedStatuses([]);
    setSelectedDifficulties([]);
    setSearchQuery("");
  };

  // Filter contributions
  const filteredContributions = contributions
    .filter((contribution) => {
      // Type filter
      if (selectedTypes.length > 0 && !selectedTypes.includes(contribution.type)) {
        return false;
      }

      // Status filter
      if (selectedStatuses.length > 0 && !selectedStatuses.includes(contribution.status)) {
        return false;
      }

      // Difficulty filter
      if (
        selectedDifficulties.length > 0 &&
        (!contribution.difficulty || !selectedDifficulties.includes(contribution.difficulty))
      ) {
        return false;
      }

      // Search query
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesSearch =
          contribution.title.toLowerCase().includes(query) ||
          contribution.description.toLowerCase().includes(query) ||
          contribution.content.toLowerCase().includes(query) ||
          contribution.tags?.some((tag) => tag.toLowerCase().includes(query));

        if (!matchesSearch) {
          return false;
        }
      }

      return true;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "recent":
          return b.createdAt.getTime() - a.createdAt.getTime();
        case "oldest":
          return a.createdAt.getTime() - b.createdAt.getTime();
        case "title":
          return a.title.localeCompare(b.title);
        default:
          return 0;
      }
    });

  const activeFiltersCount =
    selectedTypes.length +
    selectedStatuses.length +
    selectedDifficulties.length +
    (searchQuery ? 1 : 0);

  return (
    <div className={`flex flex-col gap-8 ${className}`}>
      {/* Header */}
      {(title || description) && (
        <div className="text-center">
          {title && <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">{title}</h2>}
          {description && (
            <p className="mt-4 text-lg text-muted-foreground">{description}</p>
          )}
        </div>
      )}

      {/* Filters */}
      {showFilters && (
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Filter className="h-5 w-5 text-muted-foreground" />
              <h3 className="text-lg font-semibold">Filters</h3>
              {activeFiltersCount > 0 && (
                <span className="rounded-full bg-neon-cyan/20 px-2.5 py-0.5 text-xs font-medium text-neon-cyan">
                  {activeFiltersCount}
                </span>
              )}
            </div>
            {activeFiltersCount > 0 && (
              <Button variant="ghost" size="sm" onClick={clearFilters}>
                Clear All
              </Button>
            )}
          </div>

          <div className="space-y-6">
            {/* Search */}
            <div>
              <label className="block text-sm font-medium mb-2">Search</label>
              <input
                type="text"
                placeholder="Search contributions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm focus:border-neon-cyan/50 focus:outline-none focus:ring-1 focus:ring-neon-cyan/50"
              />
            </div>

            {/* Type filters */}
            {availableTypes.length > 0 && (
              <div>
                <label className="block text-sm font-medium mb-2">Type</label>
                <div className="flex flex-wrap gap-2">
                  {availableTypes.map((type) => (
                    <button
                      key={type}
                      onClick={() => toggleFilter(selectedTypes, setSelectedTypes, type)}
                      className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-sm transition-all ${
                        selectedTypes.includes(type)
                          ? "border-neon-cyan/50 bg-neon-cyan/20 text-neon-cyan"
                          : "border-white/10 bg-white/5 text-muted-foreground hover:border-white/20"
                      }`}
                    >
                      {TYPE_ICONS[type]}
                      {TYPE_LABELS[type]}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Status filters */}
            {availableStatuses.length > 0 && (
              <div>
                <label className="block text-sm font-medium mb-2">Status</label>
                <div className="flex flex-wrap gap-2">
                  {availableStatuses.map((status) => (
                    <button
                      key={status}
                      onClick={() => toggleFilter(selectedStatuses, setSelectedStatuses, status)}
                      className={`inline-flex items-center rounded-lg border px-3 py-1.5 text-sm transition-all ${
                        selectedStatuses.includes(status)
                          ? "border-neon-cyan/50 bg-neon-cyan/20 text-neon-cyan"
                          : "border-white/10 bg-white/5 text-muted-foreground hover:border-white/20"
                      }`}
                    >
                      {STATUS_LABELS[status]}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Difficulty filters */}
            {availableDifficulties.length > 0 && (
              <div>
                <label className="block text-sm font-medium mb-2">Difficulty</label>
                <div className="flex flex-wrap gap-2">
                  {availableDifficulties.map((difficulty) => (
                    <button
                      key={difficulty}
                      onClick={() => toggleFilter(selectedDifficulties, setSelectedDifficulties, difficulty)}
                      className={`inline-flex items-center rounded-lg border px-3 py-1.5 text-sm transition-all ${
                        selectedDifficulties.includes(difficulty)
                          ? "border-neon-cyan/50 bg-neon-cyan/20 text-neon-cyan"
                          : "border-white/10 bg-white/5 text-muted-foreground hover:border-white/20"
                      }`}
                    >
                      {DIFFICULTY_LABELS[difficulty]}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Sort */}
            <div>
              <label className="block text-sm font-medium mb-2">Sort By</label>
              <div className="flex flex-wrap gap-2">
                {(["recent", "oldest", "title"] as const).map((option) => (
                  <button
                    key={option}
                    onClick={() => setSortBy(option)}
                    className={`rounded-lg border px-3 py-1.5 text-sm capitalize transition-all ${
                      sortBy === option
                        ? "border-neon-cyan/50 bg-neon-cyan/20 text-neon-cyan"
                        : "border-white/10 bg-white/5 text-muted-foreground hover:border-white/20"
                    }`}
                  >
                    {option === "recent" ? "Most Recent" : option === "oldest" ? "Oldest" : "Title"}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Results count */}
      {showFilters && (
        <div className="text-sm text-muted-foreground">
          {activeFiltersCount > 0 ? (
            <>
              Showing <span className="text-foreground font-medium">{filteredContributions.length}</span> of{" "}
              {contributions.length} contributions
            </>
          ) : (
            <>
              <span className="text-foreground font-medium">{contributions.length}</span> contributions
            </>
          )}
        </div>
      )}

      {/* Contributions grid */}
      {filteredContributions.length > 0 ? (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {filteredContributions.map((contribution, index) => (
            <motion.div
              key={contribution.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <ContributionCard
                contribution={contribution}
                onClick={() => onContributionClick?.(contribution)}
                showAuthor={showAuthor}
                showActions={!!renderActions}
                actions={renderActions?.(contribution)}
              />
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-white/20 bg-white/5 p-12">
          {emptyIcon || <FileText className="h-16 w-16 text-muted-foreground/50" />}
          <p className="mt-4 text-lg text-muted-foreground">{emptyMessage}</p>
          {activeFiltersCount > 0 && (
            <Button variant="outline" className="mt-4" onClick={clearFilters}>
              Clear Filters
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
