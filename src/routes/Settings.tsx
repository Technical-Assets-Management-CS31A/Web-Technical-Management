import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { useLoggedInUser } from "../hooks/userHooks";
import SettingsSkeletonLoader from "../loader/SettingsSkeletonLoader";
import EditProfileModal from "../components/EditProfileModal";
import InventorySettings from "../components/InventorySettings";
import AppearanceSettings from "../components/AppearanceSettings";
import { DetailSection, InfoRow } from "../components/ArchiveDetailShell";
import type { UserDto } from "../@types/types";
import { formatEnum, formatRole, fullName as toFullName, initials as toInitials } from "../lib/utils";
import ErrorTable from "../components/ErrorTables";
import { useSettingsState } from "../states/settings-state";
import { SETTINGS_CONTENT as T } from "../constants/settingsContent";
import {
  User,
  Mail,
  Pencil,
  BadgeCheck,
  Hash,
  CalendarCheck,
  CircleUserRound,
  Package,
  Palette,
  ShieldCheck,
  ChevronRight,
} from "lucide-react";

type SettingsTab = "profile" | "inventory" | "appearance";

const TABS: { key: SettingsTab; label: string; description: string; icon: React.ElementType }[] = [
  { key: "profile", label: T.tabs.profile, description: T.tabDescriptions.profile, icon: CircleUserRound },
  { key: "inventory", label: T.tabs.inventory, description: T.tabDescriptions.inventory, icon: Package },
  { key: "appearance", label: T.tabs.appearance, description: T.tabDescriptions.appearance, icon: Palette },
];

function PanelHeader({ title, description, action }: { title: string; description: string; action?: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h2 className="text-lg font-semibold tracking-tight text-slate-900">{title}</h2>
        <p className="mt-0.5 text-sm text-slate-500">{description}</p>
      </div>
      {action}
    </div>
  );
}

export default function Settings() {
  const [activeTab, setActiveTab] = useState<SettingsTab>("profile");
  const { showEditProfile, setShowEditProfile } = useSettingsState();
  const { data, isLoading, isError } = useQuery(useLoggedInUser());

  const user: UserDto | null = useMemo(() => data ?? null, [data]);

  if (isLoading) return <SettingsSkeletonLoader />;

  const initials = toInitials(user) || "U";
  const fullName = toFullName(user) || T.fallbackName;
  const isActive = user?.status === "ACTIVE";

  const editButton = (
    <button
      type="button"
      onClick={() => setShowEditProfile(true)}
      className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-blue-700 active:scale-[0.98]"
    >
      <Pencil className="h-3.5 w-3.5" />
      {T.editProfile}
    </button>
  );

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-6xl space-y-6 px-4 py-6 sm:px-6 md:px-8 animate-in fade-in slide-in-from-bottom-2 duration-500 ease-out">

        {/* Header */}
        <header>
          <p className="text-xs font-medium uppercase tracking-wider text-blue-600">{T.eyebrow}</p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-900">{T.title}</h1>
          <p className="mt-1 text-sm text-slate-500">{T.description}</p>
        </header>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[240px_minmax(0,1fr)] lg:gap-8">

          {/* Settings navigation — vertical on desktop, scrollable row on mobile */}
          <nav aria-label="Settings sections" className="lg:sticky lg:top-6 lg:self-start">
            <ul className="-mx-1 flex gap-1 overflow-x-auto px-1 pb-1 lg:mx-0 lg:flex-col lg:overflow-visible lg:px-0 lg:pb-0">
              {TABS.map(({ key, label, description, icon: Icon }) => {
                const isActive = activeTab === key;
                return (
                  <li key={key} className="shrink-0">
                    <button
                      type="button"
                      onClick={() => setActiveTab(key)}
                      aria-current={isActive ? "page" : undefined}
                      className={`group flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors ${
                        isActive
                          ? "bg-white text-slate-900 shadow-sm ring-1 ring-slate-200"
                          : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                      }`}
                    >
                      <span
                        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-md transition-colors ${
                          isActive ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-500 group-hover:bg-white"
                        }`}
                      >
                        <Icon className="h-4 w-4" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block text-sm font-medium">{label}</span>
                        <span className="hidden truncate text-xs text-slate-500 lg:block">{description}</span>
                      </span>
                      <ChevronRight
                        className={`hidden h-4 w-4 shrink-0 transition-opacity lg:block ${isActive ? "text-slate-400 opacity-100" : "opacity-0"}`}
                      />
                    </button>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* Content */}
          <main key={activeTab} className="min-w-0 space-y-6 animate-in fade-in duration-300">
            {activeTab === "appearance" ? (
              <>
                <PanelHeader title={T.tabs.appearance} description={T.appearance.description} />
                <AppearanceSettings />
              </>
            ) : activeTab === "inventory" ? (
              <>
                <PanelHeader title={T.inventory.title} description={T.inventory.description} />
                <InventorySettings />
              </>
            ) : isError ? (
              <ErrorTable />
            ) : (
              <>
                <PanelHeader title={T.profileSection.title} description={T.profileSection.description} action={editButton} />

                {/* Profile card */}
                <section className="flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-5">
                  <div className="relative shrink-0">
                    <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-slate-100 text-xl font-semibold text-slate-600 ring-1 ring-inset ring-slate-200">
                      {initials}
                    </div>
                    <span
                      className={`absolute -bottom-1 -right-1 h-4 w-4 rounded-full ring-4 ring-white ${isActive ? "bg-emerald-500" : "bg-slate-300"}`}
                    />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs text-slate-500">{T.profileCard.signedInAs}</p>
                    <h3 className="truncate text-lg font-semibold tracking-tight text-slate-900">{fullName}</h3>
                    <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                      <span className="text-sm text-slate-500">{user?.email}</span>
                      <span className="text-slate-300">·</span>
                      <span className="inline-flex items-center gap-1 rounded-md bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-700 ring-1 ring-inset ring-slate-200">
                        <ShieldCheck className="h-3 w-3 text-slate-500" />
                        {formatRole(user?.role) || T.fallbackRole}
                      </span>
                      {user?.isEventCoordinator && (
                        <span className="inline-flex items-center gap-1 rounded-md bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-700 ring-1 ring-inset ring-slate-200">
                          <CalendarCheck className="h-3 w-3 text-slate-500" />
                          {T.accountInfo.eventCoordinator}
                        </span>
                      )}
                    </div>
                  </div>
                </section>

                {/* Details */}
                <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
                  <DetailSection title={T.personalInfo.title}>
                    <InfoRow icon={User} label={T.personalInfo.firstName} value={user?.firstName} />
                    <InfoRow icon={User} label={T.personalInfo.lastName} value={user?.lastName} />
                  </DetailSection>

                  <DetailSection title={T.accountInfo.title}>
                    <InfoRow icon={Hash} label={T.accountInfo.employeeNo} value={user?.employeeNo} copyable />
                    <InfoRow icon={Mail} label={T.accountInfo.email} value={user?.email} copyable />
                    <InfoRow icon={BadgeCheck} label={T.accountInfo.role} value={formatRole(user?.role)} />
                  </DetailSection>
                </div>

                {/* Account status */}
                <section className="flex items-center justify-between gap-4 rounded-xl border border-slate-200 bg-white px-5 py-4">
                  <div className="flex items-center gap-3">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-500">
                      <ShieldCheck className="h-4 w-4" />
                    </span>
                    <div>
                      <p className="text-sm font-medium text-slate-900">{T.accountStatus.title}</p>
                      <p className="text-xs text-slate-500">{T.accountStatus.description}</p>
                    </div>
                  </div>
                  <span
                    className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${
                      isActive ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-600"
                    }`}
                  >
                    <span className="relative flex h-1.5 w-1.5">
                      {isActive && (
                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                      )}
                      <span className={`relative inline-flex h-1.5 w-1.5 rounded-full ${isActive ? "bg-emerald-500" : "bg-slate-400"}`} />
                    </span>
                    {formatEnum(user?.status) || T.fallbackStatus}
                  </span>
                </section>

                {/* Security — commented out until Change Password is ready */}
                {/* <section> ... <button onClick={() => setShowChangePassword(true)}>Change Password</button> </section> */}
              </>
            )}
          </main>
        </div>
      </div>

      {/* {showChangePassword && (
        <ChangePasswordModal id={user?.id} onClose={() => setShowChangePassword(false)} />
      )} */}
      {showEditProfile && user && (
        <EditProfileModal user={user} onClose={() => setShowEditProfile(false)} />
      )}
    </div>
  );
}
