import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { useLoggedInUser } from "../../../hooks/userHooks";
import type { UserDto } from "../../../@types/types";
import { useSettingsState } from "../../../states/settings-state";
import { SETTINGS_CONTENT as T } from "../../../constants/settingsContent";
import { CircleUserRound, Package, Palette, SlidersHorizontal } from "lucide-react";

export type SettingsTab = "profile" | "businessRules" | "inventory" | "appearance";

export const TABS: { key: SettingsTab; label: string; description: string; icon: React.ElementType }[] = [
  { key: "profile", label: T.tabs.profile, description: T.tabDescriptions.profile, icon: CircleUserRound },
  { key: "businessRules", label: T.tabs.businessRules, description: T.tabDescriptions.businessRules, icon: SlidersHorizontal },
  { key: "inventory", label: T.tabs.inventory, description: T.tabDescriptions.inventory, icon: Package },
  { key: "appearance", label: T.tabs.appearance, description: T.tabDescriptions.appearance, icon: Palette },
];

export const useSettingsViewModel = () => {
  const [activeTab, setActiveTab] = useState<SettingsTab>("profile");
  const { showEditProfile, setShowEditProfile } = useSettingsState();
  const { data, isLoading, isError, error, refetch } = useQuery(useLoggedInUser());

  const user: UserDto | null = useMemo(() => data ?? null, [data]);

  return {
    activeTab,
    setActiveTab,
    showEditProfile,
    setShowEditProfile,
    data,
    isLoading,
    isError,
    error,
    refetch,
    user,
  };
};

export type SettingsViewModel = ReturnType<typeof useSettingsViewModel>;
