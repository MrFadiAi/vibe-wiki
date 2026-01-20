'use client';

import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Send,
  X,
  Bug,
  Lightbulb,
  Zap,
  Shield,
  AlertCircle,
  FileText,
  Globe,
  MessageSquare,
  Star,
  Upload,
  Tag,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import {
  FeedbackCategory,
  FeedbackPriority,
  FeedbackItem,
  createFeedbackItem
} from '@/lib/feedback-utils';

interface FeedbackFormProps {
  userId: string;
  sessionId?: string;
  onSubmit: (feedback: FeedbackItem) => void;
  onCancel?: () => void;
  initialCategory?: FeedbackCategory;
  className?: string;
}

const CATEGORY_INFO = {
  usability: {
    icon: MessageSquare,
    label: 'سهولة الاستخدام',
    color: 'bg-blue-500',
    description: 'صعوبات في استخدام الموقع أو التنقل'
  },
  content: {
    icon: FileText,
    label: 'المحتوى',
    color: 'bg-green-500',
    description: 'اقتراحات تحسين المحتوى أو الشرح'
  },
  performance: {
    icon: Zap,
    label: 'الأداء',
    color: 'bg-yellow-500',
    description: 'مشاكل في سرعة أو أداء الموقع'
  },
  accessibility: {
    icon: Shield,
    label: 'إمكانية الوصول',
    color: 'bg-purple-500',
    description: 'صعوبات في الوصول للمحتوى'
  },
  feature: {
    icon: Lightbulb,
    label: 'ميزة جديدة',
    color: 'bg-indigo-500',
    description: 'اقتراح ميزة أو تحسين جديد'
  },
  bug: {
    icon: Bug,
    label: 'مشكلة تقنية',
    color: 'bg-red-500',
    description: 'خطأ أو مشكلة تقنية'
  },
  translation: {
    icon: Globe,
    label: 'الترجمة',
    color: 'bg-teal-500',
    description: 'اقتراحات تحسين الترجمة'
  },
  other: {
    icon: AlertCircle,
    label: 'أخرى',
    color: 'bg-gray-500',
    description: 'ملاحظات أخرى'
  }
};

const PRIORITY_INFO = {
  critical: {
    label: 'حرجة',
    color: 'text-red-600',
    bgColor: 'bg-red-50',
    description: 'تمنع استخدام الموقع تماماً'
  },
  high: {
    label: 'عالية',
    color: 'text-orange-600',
    bgColor: 'bg-orange-50',
    description: 'تؤثر بشكل كبير على التجربة'
  },
  medium: {
    label: 'متوسطة',
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-50',
    description: 'تؤثر على التجربة ولكن يمكن المتابعة'
  },
  low: {
    label: 'منخفضة',
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    description: 'مشكلة صغيرة أو تحسين طفيف'
  },
  trivial: {
    label: 'طفيفة',
    color: 'text-gray-600',
    bgColor: 'bg-gray-50',
    description: 'تحسين تجميلي بسيط'
  }
};

export function FeedbackForm({
  userId,
  sessionId,
  onSubmit,
  onCancel,
  initialCategory = 'other',
  className = ''
}: FeedbackFormProps) {
  const [category, setCategory] = useState<FeedbackCategory>(initialCategory);
  const [priority, setPriority] = useState<FeedbackPriority>('medium');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [rating, setRating] = useState<1 | 2 | 3 | 4 | 5 | null>(null);
  const [affectedArea, setAffectedArea] = useState('');
  const [reproductionSteps, setReproductionSteps] = useState<string[]>(['']);
  const [expectedBehavior, setExpectedBehavior] = useState('');
  const [actualBehavior, setActualBehavior] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateForm = useCallback(() => {
    const newErrors: Record<string, string> = {};

    if (!title.trim()) {
      newErrors.title = 'العنوان مطلوب';
    } else if (title.length < 5) {
      newErrors.title = 'العنوان يجب أن يكون 5 أحرف على الأقل';
    }

    if (!description.trim()) {
      newErrors.description = 'الوصف مطلوب';
    } else if (description.length < 20) {
      newErrors.description = 'الوصف يجب أن يكون 20 حرف على الأقل';
    }

    if (category === 'bug' && reproductionSteps.filter(s => s.trim()).length === 0) {
      newErrors.reproductionSteps = 'يجب إضافة خطوة واحدة على الأقل لإعادة المشكلة';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [title, description, category, reproductionSteps]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const feedback = createFeedbackItem({
        category,
        priority,
        title: title.trim(),
        description: description.trim(),
        userId,
        sessionId: sessionId || null,
        rating,
        affectedArea: affectedArea.trim() || null,
        reproductionSteps: reproductionSteps.filter(s => s.trim()) || null,
        expectedBehavior: expectedBehavior.trim() || null,
        actualBehavior: actualBehavior.trim() || null,
        screenshots: [],
        tags
      });

      onSubmit(feedback);

      // Reset form
      setTitle('');
      setDescription('');
      setRating(null);
      setAffectedArea('');
      setReproductionSteps(['']);
      setExpectedBehavior('');
      setActualBehavior('');
      setTags([]);
      setErrors({});
    } catch (error) {
      console.error('Error submitting feedback:', error);
      setErrors({ form: 'حدث خطأ أثناء إرسال الملاحظات. يرجى المحاولة مرة أخرى.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const addTag = () => {
    const trimmed = tagInput.trim();
    if (trimmed && !tags.includes(trimmed)) {
      setTags([...tags, trimmed]);
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(t => t !== tagToRemove));
  };

  const addStep = () => {
    setReproductionSteps([...reproductionSteps, '']);
  };

  const updateStep = (index: number, value: string) => {
    const newSteps = [...reproductionSteps];
    newSteps[index] = value;
    setReproductionSteps(newSteps);
  };

  const removeStep = (index: number) => {
    setReproductionSteps(reproductionSteps.filter((_, i) => i !== index));
  };

  const CategoryIcon = CATEGORY_INFO[category].icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className={`bg-white rounded-2xl shadow-lg overflow-hidden ${className}`}
      dir="rtl"
    >
      {/* Header */}
      <div className={`${CATEGORY_INFO[category].color} px-6 py-4`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <CategoryIcon className="w-6 h-6 text-white" />
            <h2 className="text-xl font-bold text-white">
              إرسال ملاحظات
            </h2>
          </div>
          {onCancel && (
            <button
              onClick={onCancel}
              className="text-white/80 hover:text-white transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          )}
        </div>
        <p className="text-white/90 text-sm mt-1">
          {CATEGORY_INFO[category].description}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        {errors.form && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg"
          >
            {errors.form}
          </motion.div>
        )}

        {/* Category Selection */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-3">
            التصنيف
          </label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {(Object.keys(CATEGORY_INFO) as FeedbackCategory[]).map((cat) => {
              const info = CATEGORY_INFO[cat];
              const Icon = info.icon;
              const isSelected = category === cat;

              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCategory(cat)}
                  className={`
                    flex flex-col items-center gap-2 p-3 rounded-lg border-2 transition-all
                    ${isSelected
                      ? 'border-current bg-current/10'
                      : 'border-gray-200 hover:border-gray-300'
                    }
                  `}
                  style={isSelected ? { color: getComputedStyle(document.documentElement).getPropertyValue(info.color.replace('bg-', 'text-')) } : {}}
                >
                  <Icon className="w-5 h-5" />
                  <span className="text-xs font-semibold">{info.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Priority Selection */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-3">
            الأولوية
          </label>
          <div className="flex flex-wrap gap-2">
            {(Object.keys(PRIORITY_INFO) as FeedbackPriority[]).map((pri) => {
              const info = PRIORITY_INFO[pri];
              const isSelected = priority === pri;

              return (
                <button
                  key={pri}
                  type="button"
                  onClick={() => setPriority(pri)}
                  className={`
                    px-4 py-2 rounded-lg border-2 font-medium text-sm transition-all
                    ${isSelected
                      ? `${info.color} ${info.bgColor} border-current`
                      : 'border-gray-200 text-gray-600 hover:border-gray-300'
                    }
                  `}
                >
                  {info.label}
                </button>
              );
            })}
          </div>
          <p className="text-xs text-gray-500 mt-2">
            {PRIORITY_INFO[priority].description}
          </p>
        </div>

        {/* Title */}
        <div>
          <label htmlFor="title" className="block text-sm font-semibold text-gray-700 mb-2">
            العنوان *
          </label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="ملخص موجز للملاحظة..."
            className={`
              w-full px-4 py-3 rounded-lg border-2 transition-all
              ${errors.title ? 'border-red-300 focus:border-red-500' : 'border-gray-200 focus:border-blue-500'}
              focus:outline-none
            `}
            maxLength={200}
          />
          {errors.title && (
            <p className="text-red-600 text-sm mt-1">{errors.title}</p>
          )}
        </div>

        {/* Description */}
        <div>
          <label htmlFor="description" className="block text-sm font-semibold text-gray-700 mb-2">
            الوصف التفصيلي *
          </label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="اشرح الملاحظة بالتفصيل..."
            rows={5}
            className={`
              w-full px-4 py-3 rounded-lg border-2 transition-all resize-none
              ${errors.description ? 'border-red-300 focus:border-red-500' : 'border-gray-200 focus:border-blue-500'}
              focus:outline-none
            `}
            minLength={20}
          />
          {errors.description && (
            <p className="text-red-600 text-sm mt-1">{errors.description}</p>
          )}
        </div>

        {/* Rating */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            التقييم العام
          </label>
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star as 1 | 2 | 3 | 4 | 5)}
                className="p-1 transition-transform hover:scale-110"
              >
                <Star
                  className={`w-8 h-8 ${
                    rating && star <= rating
                      ? 'fill-yellow-400 text-yellow-400'
                      : 'text-gray-300'
                  }`}
                />
              </button>
            ))}
          </div>
        </div>

        {/* Affected Area */}
        <div>
          <label htmlFor="affectedArea" className="block text-sm font-semibold text-gray-700 mb-2">
            المنطقة المتأثرة
          </label>
          <input
            type="text"
            id="affectedArea"
            value={affectedArea}
            onChange={(e) => setAffectedArea(e.target.value)}
            placeholder="مثال: صفحة الترحيب، قائمة التنقل..."
            className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 focus:border-blue-500 focus:outline-none transition-all"
          />
        </div>

        {/* Reproduction Steps (for bugs) */}
        {category === 'bug' && (
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              خطوات إعادة المشكلة *
            </label>
            <div className="space-y-2">
              {reproductionSteps.map((step, index) => (
                <div key={index} className="flex gap-2">
                  <span className="flex items-center justify-center w-8 h-10 bg-gray-100 rounded-lg text-sm font-semibold text-gray-600 shrink-0">
                    {index + 1}
                  </span>
                  <input
                    type="text"
                    value={step}
                    onChange={(e) => updateStep(index, e.target.value)}
                    placeholder="الخطوة..."
                    className="flex-1 px-4 py-2 rounded-lg border-2 border-gray-200 focus:border-blue-500 focus:outline-none transition-all"
                  />
                  {reproductionSteps.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeStep(index)}
                      className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  )}
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={addStep}
              className="mt-2 text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center gap-1"
            >
              <ChevronDown className="w-4 h-4" />
              إضافة خطوة
            </button>
            {errors.reproductionSteps && (
              <p className="text-red-600 text-sm mt-1">{errors.reproductionSteps}</p>
            )}
          </div>
        )}

        {/* Expected & Actual Behavior (for bugs) */}
        {category === 'bug' && (
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="expectedBehavior" className="block text-sm font-semibold text-gray-700 mb-2">
                السلوك المتوقع
              </label>
              <textarea
                id="expectedBehavior"
                value={expectedBehavior}
                onChange={(e) => setExpectedBehavior(e.target.value)}
                placeholder="ما الذي كنت تتوقع أن يحدث؟"
                rows={3}
                className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 focus:border-blue-500 focus:outline-none transition-all resize-none"
              />
            </div>
            <div>
              <label htmlFor="actualBehavior" className="block text-sm font-semibold text-gray-700 mb-2">
                السلوك الفعلي
              </label>
              <textarea
                id="actualBehavior"
                value={actualBehavior}
                onChange={(e) => setActualBehavior(e.target.value)}
                placeholder="ما الذي حدث فعلاً؟"
                rows={3}
                className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 focus:border-blue-500 focus:outline-none transition-all resize-none"
              />
            </div>
          </div>
        )}

        {/* Tags */}
        <div>
          <label htmlFor="tags" className="block text-sm font-semibold text-gray-700 mb-2">
            الوسوم
          </label>
          <div className="flex gap-2 mb-2">
            <input
              type="text"
              id="tags"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
              placeholder="أضف وسماً..."
              className="flex-1 px-4 py-2 rounded-lg border-2 border-gray-200 focus:border-blue-500 focus:outline-none transition-all"
            />
            <button
              type="button"
              onClick={addTag}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2"
            >
              <Tag className="w-4 h-4" />
              إضافة
            </button>
          </div>
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1 px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm"
                >
                  {tag}
                  <button
                    type="button"
                    onClick={() => removeTag(tag)}
                    className="hover:text-blue-900"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Submit Button */}
        <div className="flex gap-3 pt-4 border-t border-gray-200">
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors font-semibold"
          >
            {isSubmitting ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                جاري الإرسال...
              </>
            ) : (
              <>
                <Send className="w-5 h-5" />
                إرسال الملاحظات
              </>
            )}
          </button>
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="px-6 py-3 border-2 border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-semibold"
            >
              إلغاء
            </button>
          )}
        </div>
      </form>
    </motion.div>
  );
}
