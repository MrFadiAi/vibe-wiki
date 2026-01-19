"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FileText,
  GraduationCap,
  Code2,
  Map,
  Plus,
  X,
  Save,
  Send,
  Eye,
  Loader2,
} from "lucide-react";
import type {
  ContributionType,
  DifficultyLevel,
  CreateContributionInput,
  TutorialStep,
  PathItem,
} from "@/types";
import { Button } from "@/components/ui/button";
import { createContribution } from "@/lib/contribution-utils";

const TYPE_OPTIONS: Array<{ value: ContributionType; label: string; icon: React.ReactNode }> = [
  { value: "article", label: "Article", icon: <FileText className="h-5 w-5" /> },
  { value: "tutorial", label: "Tutorial", icon: <GraduationCap className="h-5 w-5" /> },
  { value: "example", label: "Interactive Example", icon: <Code2 className="h-5 w-5" /> },
  { value: "path", label: "Learning Path", icon: <Map className="h-5 w-5" /> },
];

const DIFFICULTY_OPTIONS: Array<{ value: DifficultyLevel; label: string }> = [
  { value: "beginner", label: "Beginner" },
  { value: "intermediate", label: "Intermediate" },
  { value: "advanced", label: "Advanced" },
];

export interface ContributionFormProps {
  authorId: string;
  initialData?: Partial<CreateContributionInput>;
  onSubmit?: (data: CreateContributionInput) => Promise<void>;
  onSaveDraft?: (data: CreateContributionInput) => Promise<void>;
  onCancel?: () => void;
  submitLabel?: string;
  isSubmitting?: boolean;
  isSaving?: boolean;
}

export function ContributionForm({
  authorId,
  initialData,
  onSubmit,
  onSaveDraft,
  onCancel,
  submitLabel = "Submit for Review",
  isSubmitting = false,
  isSaving = false,
}: ContributionFormProps) {
  const [type, setType] = useState<ContributionType>(initialData?.type || "article");
  const [title, setTitle] = useState(initialData?.title || "");
  const [description, setDescription] = useState(initialData?.description || "");
  const [content, setContent] = useState(initialData?.content || "");
  const [tags, setTags] = useState<string[]>(initialData?.tags || []);
  const [tagInput, setTagInput] = useState("");
  const [categoryId, setCategoryId] = useState(initialData?.categoryId || "");
  const [difficulty, setDifficulty] = useState<DifficultyLevel | undefined>(
    initialData?.difficulty
  );
  const [estimatedMinutes, setEstimatedMinutes] = useState<number | undefined>(
    initialData?.estimatedMinutes
  );

  // Tutorial-specific fields
  const [learningObjectives, setLearningObjectives] = useState<string[]>(
    initialData?.learningObjectives || []
  );
  const [objectiveInput, setObjectiveInput] = useState("");
  const [prerequisites, setPrerequisites] = useState<string[]>(initialData?.prerequisites || []);
  const [prereqInput, setPrereqInput] = useState("");
  const [steps, setSteps] = useState<Array<Omit<TutorialStep, "id">>>(
    initialData?.steps?.map(({ id, ...rest }) => rest) || []
  );

  // Path-specific fields
  const [targetAudience, setTargetAudience] = useState<string[]>(initialData?.targetAudience || []);
  const [audienceInput, setAudienceInput] = useState("");
  const [pathItems, setPathItems] = useState<Array<Omit<PathItem, "id">>>(
    initialData?.items?.map(({ id, ...rest }) => rest) || []
  );

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [previewMode, setPreviewMode] = useState(false);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!title || title.trim().length < 5) {
      newErrors.title = "Title must be at least 5 characters";
    }
    if (!description || description.trim().length < 20) {
      newErrors.description = "Description must be at least 20 characters";
    }
    if (!content || content.trim().length < 100) {
      newErrors.content = "Content must be at least 100 characters";
    }

    // Type-specific validations
    if (type === "tutorial") {
      if (steps.length === 0) {
        newErrors.steps = "Tutorials must have at least one step";
      }
      if (!difficulty) {
        newErrors.difficulty = "Tutorials must specify a difficulty level";
      }
      if (learningObjectives.length === 0) {
        newErrors.learningObjectives = "Tutorials must have at least one learning objective";
      }
    }

    if (type === "path") {
      if (pathItems.length === 0) {
        newErrors.pathItems = "Learning paths must have at least one item";
      }
      if (!difficulty) {
        newErrors.difficulty = "Learning paths must specify a difficulty level";
      }
      if (targetAudience.length === 0) {
        newErrors.targetAudience = "Learning paths must specify target audience";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    const data: CreateContributionInput = {
      type,
      title,
      description,
      content,
      authorId,
      tags,
      categoryId,
      difficulty,
      estimatedMinutes,
      learningObjectives: learningObjectives.length > 0 ? learningObjectives : undefined,
      prerequisites: prerequisites.length > 0 ? prerequisites : undefined,
      steps: steps.length > 0 ? steps : undefined,
      targetAudience: targetAudience.length > 0 ? targetAudience : undefined,
      items: pathItems.length > 0 ? pathItems : undefined,
    };

    await onSubmit?.(data);
  };

  const handleSaveDraft = async () => {
    const data: CreateContributionInput = {
      type,
      title: title || "Untitled Draft",
      description: description || "",
      content: content || "",
      authorId,
      tags,
      categoryId,
      difficulty,
      estimatedMinutes,
      learningObjectives: learningObjectives.length > 0 ? learningObjectives : undefined,
      prerequisites: prerequisites.length > 0 ? prerequisites : undefined,
      steps: steps.length > 0 ? steps : undefined,
      targetAudience: targetAudience.length > 0 ? targetAudience : undefined,
      items: pathItems.length > 0 ? pathItems : undefined,
    };

    await onSaveDraft?.(data);
  };

  const addTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput("");
    }
  };

  const removeTag = (tag: string) => {
    setTags(tags.filter((t) => t !== tag));
  };

  const addObjective = () => {
    if (objectiveInput.trim() && !learningObjectives.includes(objectiveInput.trim())) {
      setLearningObjectives([...learningObjectives, objectiveInput.trim()]);
      setObjectiveInput("");
    }
  };

  const removeObjective = (objective: string) => {
    setLearningObjectives(learningObjectives.filter((o) => o !== objective));
  };

  const addPrereq = () => {
    if (prereqInput.trim() && !prerequisites.includes(prereqInput.trim())) {
      setPrerequisites([...prerequisites, prereqInput.trim()]);
      setPrereqInput("");
    }
  };

  const removePrereq = (prereq: string) => {
    setPrerequisites(prerequisites.filter((p) => p !== prereq));
  };

  const addAudience = () => {
    if (audienceInput.trim() && !targetAudience.includes(audienceInput.trim())) {
      setTargetAudience([...targetAudience, audienceInput.trim()]);
      setAudienceInput("");
    }
  };

  const removeAudience = (audience: string) => {
    setTargetAudience(targetAudience.filter((a) => a !== audience));
  };

  const addStep = () => {
    setSteps([
      ...steps,
      {
        title: `Step ${steps.length + 1}`,
        content: "",
        order: steps.length,
      },
    ]);
  };

  const updateStep = (index: number, field: keyof Omit<TutorialStep, "id">, value: string) => {
    const newSteps = [...steps];
    newSteps[index] = { ...newSteps[index], [field]: value };
    setSteps(newSteps);
  };

  const removeStep = (index: number) => {
    setSteps(steps.filter((_, i) => i !== index).map((s, i) => ({ ...s, order: i })));
  };

  const addPathItem = () => {
    setPathItems([
      ...pathItems,
      {
        type: "article",
        slug: "",
        title: "",
        description: "",
        estimatedMinutes: 10,
        order: pathItems.length,
      },
    ]);
  };

  const updatePathItem = (
    index: number,
    field: keyof Omit<PathItem, "id">,
    value: string | number | boolean
  ) => {
    const newItems = [...pathItems];
    newItems[index] = { ...newItems[index], [field]: value };
    setPathItems(newItems);
  };

  const removePathItem = (index: number) => {
    setPathItems(pathItems.filter((_, i) => i !== index).map((item, i) => ({ ...item, order: i })));
  };

  const needsTutorialFields = type === "tutorial";
  const needsPathFields = type === "path";
  const needsDifficulty = needsTutorialFields || needsPathFields;

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Type Selection */}
      <div>
        <label className="block text-sm font-medium mb-3">Content Type</label>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {TYPE_OPTIONS.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => setType(option.value)}
              className={`flex flex-col items-center gap-2 rounded-xl border p-4 transition-all ${
                type === option.value
                  ? "border-neon-cyan/50 bg-neon-cyan/20 text-neon-cyan"
                  : "border-white/10 bg-white/5 text-muted-foreground hover:border-white/20"
              }`}
            >
              {option.icon}
              <span className="text-sm font-medium">{option.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Title */}
      <div>
        <label className="block text-sm font-medium mb-2">Title</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Enter a descriptive title..."
          className={`w-full rounded-lg border bg-white/5 px-4 py-3 focus:outline-none focus:ring-1 focus:ring-neon-cyan/50 ${
            errors.title ? "border-red-500/50" : "border-white/10 focus:border-neon-cyan/50"
          }`}
        />
        {errors.title && <p className="mt-1 text-sm text-red-400">{errors.title}</p>}
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-medium mb-2">Description</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Briefly describe what this contribution covers..."
          rows={3}
          className={`w-full rounded-lg border bg-white/5 px-4 py-3 focus:outline-none focus:ring-1 focus:ring-neon-cyan/50 ${
            errors.description
              ? "border-red-500/50"
              : "border-white/10 focus:border-neon-cyan/50"
          }`}
        />
        {errors.description && (
          <p className="mt-1 text-sm text-red-400">{errors.description}</p>
        )}
      </div>

      {/* Content */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="block text-sm font-medium">Content (Markdown)</label>
          <button
            type="button"
            onClick={() => setPreviewMode(!previewMode)}
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <Eye className="h-4 w-4" />
            {previewMode ? "Edit" : "Preview"}
          </button>
        </div>
        <AnimatePresence mode="wait">
          {previewMode ? (
            <motion.div
              key="preview"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="rounded-lg border border-white/10 bg-white/5 p-4 prose prose-invert max-w-none"
            >
              {content || "No content yet..."}
            </motion.div>
          ) : (
            <motion.textarea
              key="edit"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Write your content in Markdown..."
              rows={12}
              className={`w-full rounded-lg border bg-white/5 px-4 py-3 font-mono text-sm focus:outline-none focus:ring-1 focus:ring-neon-cyan/50 ${
                errors.content
                  ? "border-red-500/50"
                  : "border-white/10 focus:border-neon-cyan/50"
              }`}
            />
          )}
        </AnimatePresence>
        {errors.content && <p className="mt-1 text-sm text-red-400">{errors.content}</p>}
      </div>

      {/* Tags */}
      <div>
        <label className="block text-sm font-medium mb-2">Tags</label>
        <div className="flex gap-2 mb-2">
          <input
            type="text"
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addTag())}
            placeholder="Add a tag..."
            className="flex-1 rounded-lg border border-white/10 bg-white/5 px-4 py-2 focus:outline-none focus:ring-1 focus:ring-neon-cyan/50 focus:border-neon-cyan/50"
          />
          <Button type="button" size="sm" onClick={addTag}>
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {tags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center gap-1 rounded-full bg-white/5 px-3 py-1 text-sm ring-1 ring-white/10"
              >
                {tag}
                <button
                  type="button"
                  onClick={() => removeTag(tag)}
                  className="hover:text-red-400 transition-colors"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Difficulty (for tutorials and paths) */}
      {needsDifficulty && (
        <div>
          <label className="block text-sm font-medium mb-2">Difficulty Level</label>
          <div className="flex gap-2">
            {DIFFICULTY_OPTIONS.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => setDifficulty(option.value)}
                className={`rounded-lg border px-4 py-2 transition-all ${
                  difficulty === option.value
                    ? "border-neon-cyan/50 bg-neon-cyan/20 text-neon-cyan"
                    : "border-white/10 bg-white/5 text-muted-foreground hover:border-white/20"
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
          {errors.difficulty && (
            <p className="mt-1 text-sm text-red-400">{errors.difficulty}</p>
          )}
        </div>
      )}

      {/* Estimated Time */}
      <div>
        <label className="block text-sm font-medium mb-2">Estimated Time (minutes)</label>
        <input
          type="number"
          value={estimatedMinutes ?? ""}
          onChange={(e) => setEstimatedMinutes(e.target.value ? parseInt(e.target.value) : undefined)}
          placeholder="e.g., 30"
          min="1"
          className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2 focus:outline-none focus:ring-1 focus:ring-neon-cyan/50 focus:border-neon-cyan/50"
        />
      </div>

      {/* Learning Objectives (for tutorials and paths) */}
      {(needsTutorialFields || needsPathFields) && (
        <div>
          <label className="block text-sm font-medium mb-2">Learning Objectives</label>
          <div className="flex gap-2 mb-2">
            <input
              type="text"
              value={objectiveInput}
              onChange={(e) => setObjectiveInput(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addObjective())}
              placeholder="What will learners achieve?"
              className="flex-1 rounded-lg border border-white/10 bg-white/5 px-4 py-2 focus:outline-none focus:ring-1 focus:ring-neon-cyan/50 focus:border-neon-cyan/50"
            />
            <Button type="button" size="sm" onClick={addObjective}>
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          {learningObjectives.length > 0 && (
            <div className="space-y-2">
              {learningObjectives.map((objective, index) => (
                <div
                  key={index}
                  className="flex items-start gap-2 rounded-lg bg-white/5 p-3 ring-1 ring-white/10"
                >
                  <span className="text-neon-cyan mt-0.5">•</span>
                  <span className="flex-1 text-sm">{objective}</span>
                  <button
                    type="button"
                    onClick={() => removeObjective(objective)}
                    className="text-muted-foreground hover:text-red-400 transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
          {errors.learningObjectives && (
            <p className="mt-1 text-sm text-red-400">{errors.learningObjectives}</p>
          )}
        </div>
      )}

      {/* Prerequisites (for tutorials) */}
      {needsTutorialFields && (
        <div>
          <label className="block text-sm font-medium mb-2">Prerequisites</label>
          <div className="flex gap-2 mb-2">
            <input
              type="text"
              value={prereqInput}
              onChange={(e) => setPrereqInput(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addPrereq())}
              placeholder="What should learners know first?"
              className="flex-1 rounded-lg border border-white/10 bg-white/5 px-4 py-2 focus:outline-none focus:ring-1 focus:ring-neon-cyan/50 focus:border-neon-cyan/50"
            />
            <Button type="button" size="sm" onClick={addPrereq}>
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          {prerequisites.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {prerequisites.map((prereq) => (
                <span
                  key={prereq}
                  className="inline-flex items-center gap-1 rounded-full bg-yellow-500/10 px-3 py-1 text-sm text-yellow-300 ring-1 ring-yellow-500/20"
                >
                  {prereq}
                  <button
                    type="button"
                    onClick={() => removePrereq(prereq)}
                    className="hover:text-red-400 transition-colors"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Target Audience (for paths) */}
      {needsPathFields && (
        <div>
          <label className="block text-sm font-medium mb-2">Target Audience</label>
          <div className="flex gap-2 mb-2">
            <input
              type="text"
              value={audienceInput}
              onChange={(e) => setAudienceInput(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addAudience())}
              placeholder="Who is this path for?"
              className="flex-1 rounded-lg border border-white/10 bg-white/5 px-4 py-2 focus:outline-none focus:ring-1 focus:ring-neon-cyan/50 focus:border-neon-cyan/50"
            />
            <Button type="button" size="sm" onClick={addAudience}>
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          {targetAudience.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {targetAudience.map((audience) => (
                <span
                  key={audience}
                  className="inline-flex items-center gap-1 rounded-full bg-purple-500/10 px-3 py-1 text-sm text-purple-300 ring-1 ring-purple-500/20"
                >
                  {audience}
                  <button
                    type="button"
                    onClick={() => removeAudience(audience)}
                    className="hover:text-red-400 transition-colors"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
            </div>
          )}
          {errors.targetAudience && (
            <p className="mt-1 text-sm text-red-400">{errors.targetAudience}</p>
          )}
        </div>
      )}

      {/* Tutorial Steps */}
      {needsTutorialFields && (
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-medium">Tutorial Steps</label>
            <Button type="button" size="sm" variant="outline" onClick={addStep}>
              <Plus className="h-4 w-4 mr-1" />
              Add Step
            </Button>
          </div>
          {steps.length > 0 ? (
            <div className="space-y-4">
              {steps.map((step, index) => (
                <div
                  key={index}
                  className="rounded-lg border border-white/10 bg-white/5 p-4 ring-1 ring-white/10"
                >
                  <div className="flex items-start justify-between mb-3">
                    <h4 className="text-sm font-medium">Step {index + 1}</h4>
                    <button
                      type="button"
                      onClick={() => removeStep(index)}
                      className="text-muted-foreground hover:text-red-400 transition-colors"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="space-y-3">
                    <input
                      type="text"
                      value={step.title}
                      onChange={(e) => updateStep(index, "title", e.target.value)}
                      placeholder="Step title..."
                      className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-neon-cyan/50 focus:border-neon-cyan/50"
                    />
                    <textarea
                      value={step.content}
                      onChange={(e) => updateStep(index, "content", e.target.value)}
                      placeholder="Step content (Markdown)..."
                      rows={4}
                      className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm font-mono focus:outline-none focus:ring-1 focus:ring-neon-cyan/50 focus:border-neon-cyan/50"
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No steps yet. Add your first step!</p>
          )}
          {errors.steps && <p className="mt-1 text-sm text-red-400">{errors.steps}</p>}
        </div>
      )}

      {/* Path Items */}
      {needsPathFields && (
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-medium">Path Items</label>
            <Button type="button" size="sm" variant="outline" onClick={addPathItem}>
              <Plus className="h-4 w-4 mr-1" />
              Add Item
            </Button>
          </div>
          {pathItems.length > 0 ? (
            <div className="space-y-4">
              {pathItems.map((item, index) => (
                <div
                  key={index}
                  className="rounded-lg border border-white/10 bg-white/5 p-4 ring-1 ring-white/10"
                >
                  <div className="flex items-start justify-between mb-3">
                    <h4 className="text-sm font-medium">Item {index + 1}</h4>
                    <button
                      type="button"
                      onClick={() => removePathItem(index)}
                      className="text-muted-foreground hover:text-red-400 transition-colors"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <select
                      value={item.type}
                      onChange={(e) => updatePathItem(index, "type", e.target.value)}
                      className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-neon-cyan/50"
                    >
                      <option value="article">Article</option>
                      <option value="tutorial">Tutorial</option>
                      <option value="exercise">Exercise</option>
                    </select>
                    <input
                      type="text"
                      value={item.slug}
                      onChange={(e) => updatePathItem(index, "slug", e.target.value)}
                      placeholder="Slug..."
                      className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-neon-cyan/50"
                    />
                    <input
                      type="text"
                      value={item.title}
                      onChange={(e) => updatePathItem(index, "title", e.target.value)}
                      placeholder="Title..."
                      className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-neon-cyan/50 sm:col-span-2"
                    />
                    <textarea
                      value={item.description || ""}
                      onChange={(e) => updatePathItem(index, "description", e.target.value)}
                      placeholder="Description..."
                      rows={2}
                      className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-neon-cyan/50 sm:col-span-2"
                    />
                    <input
                      type="number"
                      value={item.estimatedMinutes}
                      onChange={(e) => updatePathItem(index, "estimatedMinutes", parseInt(e.target.value) || 0)}
                      placeholder="Minutes..."
                      min="1"
                      className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-neon-cyan/50"
                    />
                    <label className="flex items-center gap-2 text-sm text-muted-foreground">
                      <input
                        type="checkbox"
                        checked={item.isOptional || false}
                        onChange={(e) => updatePathItem(index, "isOptional", e.target.checked)}
                        className="rounded border-white/10"
                      />
                      Optional
                    </label>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No items yet. Add your first item!</p>
          )}
          {errors.pathItems && <p className="mt-1 text-sm text-red-400">{errors.pathItems}</p>}
        </div>
      )}

      {/* Actions */}
      <div className="flex flex-wrap items-center gap-3 pt-4 border-t border-white/10">
        {onSaveDraft && (
          <Button
            type="button"
            variant="outline"
            onClick={handleSaveDraft}
            disabled={isSaving || isSubmitting}
          >
            {isSaving ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Save Draft
              </>
            )}
          </Button>
        )}
        <Button type="submit" disabled={isSubmitting || isSaving}>
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Submitting...
            </>
          ) : (
            <>
              <Send className="h-4 w-4 mr-2" />
              {submitLabel}
            </>
          )}
        </Button>
        {onCancel && (
          <Button type="button" variant="ghost" onClick={onCancel}>
            Cancel
          </Button>
        )}
      </div>
    </form>
  );
}
