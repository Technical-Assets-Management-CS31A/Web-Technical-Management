import { create } from "zustand";

interface ISettingsState {
  showEditProfile: boolean;
  setShowEditProfile: (value: boolean) => void;
  // Unsaved business-rule edits (key -> raw input). Kept here so switching tabs keeps them.
  ruleDraft: Record<string, string>;
  setRuleDraftValue: (key: string, value: string | null) => void;
  clearRuleDraft: () => void;
}

const settingsStore = create<ISettingsState>((set) => ({
  showEditProfile: false,
  setShowEditProfile: (value) => set(() => ({ showEditProfile: value })),
  ruleDraft: {},
  // null drops the key, so the field goes back to the saved value
  setRuleDraftValue: (key, value) =>
    set((state) => {
      const next = { ...state.ruleDraft };
      if (value === null) delete next[key];
      else next[key] = value;
      return { ruleDraft: next };
    }),
  clearRuleDraft: () => set(() => ({ ruleDraft: {} })),
}));

export const useSettingsState = () => {
  const showEditProfile = settingsStore((state) => state.showEditProfile);
  const setShowEditProfile = settingsStore((state) => state.setShowEditProfile);

  return {
    showEditProfile,
    setShowEditProfile,
  };
};

export const useRuleDraftState = () => {
  const ruleDraft = settingsStore((state) => state.ruleDraft);
  const setRuleDraftValue = settingsStore((state) => state.setRuleDraftValue);
  const clearRuleDraft = settingsStore((state) => state.clearRuleDraft);

  return { ruleDraft, setRuleDraftValue, clearRuleDraft };
};
