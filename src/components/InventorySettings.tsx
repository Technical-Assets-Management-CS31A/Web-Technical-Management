import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Plus, Trash2, Tag, Layers, Loader2 } from "lucide-react";
import { showToast } from "./AppToast";
import {
  useGetCategories,
  useGetConditions,
  useAddCategory,
  useDeleteCategory,
  useAddCondition,
  useDeleteCondition,
} from "../hooks/inventorySettingsHooks";

type LookupPanelProps = {
  title: string;
  description: string;
  noun: string;
  icon: React.ElementType;
  items: string[];
  isLoading: boolean;
  isAdding: boolean;
  deletingItem: string | null;
  onAdd: (name: string, onDone: () => void) => void;
  onDelete: (name: string) => void;
  placeholder: string;
};

function LookupPanel({
  title,
  description,
  noun,
  icon: Icon,
  items,
  isLoading,
  isAdding,
  deletingItem,
  onAdd,
  onDelete,
  placeholder,
}: LookupPanelProps) {
  const [input, setInput] = useState("");
  const [confirming, setConfirming] = useState<string | null>(null);

  const trimmed = input.trim();
  const isDuplicate = !!trimmed && items.some((i) => i.toLowerCase() === trimmed.toLowerCase());

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!trimmed || isDuplicate || isAdding) return;
    // Only clear the field once the save succeeds, so a failed save keeps the text
    onAdd(trimmed, () => setInput(""));
  };

  return (
    <section className="flex flex-col overflow-hidden rounded-xl border border-slate-200 bg-white">
      {/* Header */}
      <div className="flex items-start justify-between gap-3 border-b border-slate-200 px-5 py-4">
        <div className="flex items-start gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-500">
            <Icon className="h-4 w-4" />
          </span>
          <div>
            <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
            <p className="mt-0.5 text-xs text-slate-500">{description}</p>
          </div>
        </div>
        <span className="shrink-0 rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium tabular-nums text-slate-600">
          {isLoading ? "…" : items.length}
        </span>
      </div>

      {/* Add form */}
      <form onSubmit={handleAdd} className="border-b border-slate-100 px-5 py-4">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={placeholder}
            aria-label={`New ${noun}`}
            aria-invalid={isDuplicate || undefined}
            className={`h-10 min-w-0 flex-1 rounded-lg border bg-white px-3 text-sm text-slate-900 shadow-sm outline-none transition-colors placeholder:text-slate-400 focus:ring-4 ${
              isDuplicate
                ? "border-rose-300 focus:border-rose-500 focus:ring-rose-500/10"
                : "border-slate-200 hover:border-slate-300 focus:border-blue-500 focus:ring-blue-500/10"
            }`}
          />
          <button
            type="submit"
            disabled={isAdding || !trimmed || isDuplicate}
            className="inline-flex h-10 shrink-0 items-center gap-1.5 rounded-lg bg-blue-600 px-4 text-sm font-medium text-white shadow-sm transition-colors hover:bg-blue-700 focus:outline-none focus-visible:ring-4 focus-visible:ring-blue-200 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isAdding ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
            Add
          </button>
        </div>
        {isDuplicate && <p className="mt-1.5 text-xs text-rose-600">"{trimmed}" already exists.</p>}
      </form>

      {/* List */}
      {isLoading ? (
        <div className="flex items-center justify-center gap-2 py-10 text-sm text-slate-500">
          <Loader2 className="h-4 w-4 animate-spin text-slate-400" />
          Loading…
        </div>
      ) : items.length === 0 ? (
        <div className="flex flex-col items-center justify-center px-5 py-10 text-center">
          <span className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-400">
            <Icon className="h-4 w-4" />
          </span>
          <p className="text-sm font-medium text-slate-900">No {title.toLowerCase()} yet</p>
          <p className="mt-0.5 text-xs text-slate-500">Add your first {noun} above.</p>
        </div>
      ) : (
        <ul className="scrollbar-thin max-h-72 divide-y divide-slate-100 overflow-y-auto">
          {items.map((item) => {
            const isConfirming = confirming === item;
            const isDeleting = deletingItem === item;
            return (
              <li
                key={item}
                className={`group flex items-center justify-between gap-3 px-5 py-2.5 transition-colors ${
                  isConfirming ? "bg-rose-50/60" : "hover:bg-slate-50"
                }`}
              >
                <span className="min-w-0 truncate text-sm text-slate-800">{item}</span>

                {isConfirming ? (
                  <div className="flex shrink-0 items-center gap-1.5">
                    <span className="hidden text-xs text-rose-700 sm:inline">Delete?</span>
                    <button
                      type="button"
                      onClick={() => setConfirming(null)}
                      className="rounded-md border border-slate-200 bg-white px-2 py-1 text-xs font-medium text-slate-600 hover:bg-slate-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        onDelete(item);
                        setConfirming(null);
                      }}
                      className="rounded-md bg-rose-600 px-2 py-1 text-xs font-medium text-white hover:bg-rose-700"
                    >
                      Delete
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setConfirming(item)}
                    disabled={isDeleting}
                    title={`Delete ${item}`}
                    aria-label={`Delete ${item}`}
                    className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-slate-400 transition-colors hover:bg-rose-50 hover:text-rose-600 focus-visible:text-rose-600 disabled:cursor-not-allowed"
                  >
                    {isDeleting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
                  </button>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}

export default function InventorySettings() {
  const { data: categories = [], isLoading: catLoading } = useQuery(useGetCategories());
  const { data: conditions = [], isLoading: conLoading } = useQuery(useGetConditions());

  const addCategory = useAddCategory();
  const deleteCategory = useDeleteCategory();
  const addCondition = useAddCondition();
  const deleteCondition = useDeleteCondition();

  const handleAddCategory = (name: string, onDone: () => void) => {
    addCategory.mutate(name, {
      onSuccess: () => {
        onDone();
        showToast.success("Category Added", `"${name}" has been added.`);
      },
      onError: (err) => showToast.error("Failed", err.message),
    });
  };

  const handleDeleteCategory = (name: string) => {
    deleteCategory.mutate(name, {
      onSuccess: () => showToast.success("Category Removed", `"${name}" has been removed.`),
      onError: (err) => showToast.error("Failed", err.message),
    });
  };

  const handleAddCondition = (name: string, onDone: () => void) => {
    addCondition.mutate(name, {
      onSuccess: () => {
        onDone();
        showToast.success("Condition Added", `"${name}" has been added.`);
      },
      onError: (err) => showToast.error("Failed", err.message),
    });
  };

  const handleDeleteCondition = (name: string) => {
    deleteCondition.mutate(name, {
      onSuccess: () => showToast.success("Condition Removed", `"${name}" has been removed.`),
      onError: (err) => showToast.error("Failed", err.message),
    });
  };

  return (
    <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
      <LookupPanel
        title="Categories"
        description="Group items by type, e.g. Electronics or Tools."
        noun="category"
        icon={Tag}
        items={categories}
        isLoading={catLoading}
        isAdding={addCategory.isPending}
        deletingItem={deleteCategory.isPending ? (deleteCategory.variables ?? null) : null}
        onAdd={handleAddCategory}
        onDelete={handleDeleteCategory}
        placeholder="e.g. Electronics"
      />
      <LookupPanel
        title="Conditions"
        description="Describe an item's physical state, e.g. Good or Defective."
        noun="condition"
        icon={Layers}
        items={conditions}
        isLoading={conLoading}
        isAdding={addCondition.isPending}
        deletingItem={deleteCondition.isPending ? (deleteCondition.variables ?? null) : null}
        onAdd={handleAddCondition}
        onDelete={handleDeleteCondition}
        placeholder="e.g. Good"
      />
    </div>
  );
}
