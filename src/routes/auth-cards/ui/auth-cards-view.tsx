import { Ban, CreditCard, Info, Nfc, Plus, Search, SearchCheck, TriangleAlert, UserRoundX } from "lucide-react";
import SearchBar from "../../../components/SearchBar";
import ErrorTable from "../../../components/ErrorTables";
import PopUpModal from "../../../components/PopUpModal";
import CardStatusPill from "../../../components/CardStatusPill";
import AuthCardFormDialog from "../../../components/AuthCardFormDialog";
import AddCardKioskDialog from "../../../components/AddCardKioskDialog";
import { FormattedDateTime } from "../../../components/FormattedDateTime";
import { UserSkeletonLoader } from "../../../components/UserSkeletonLoader";
import { fullName, initials } from "../../../lib/utils";
import { AUTH_CARDS_CONTENT as T } from "../../../constants/authCardsContent";
import { type AuthCardsViewModel } from "../model/auth-cards-view-model";

export default function AuthCardsView(vm: AuthCardsViewModel) {
  const {
    canManage,
    canEnroll,
    canKioskAdd,
    kioskAddFor,
    setKioskAddFor,
    isPending,
    isError,
    error,
    refetch,
    updateCard,
    setSearch,
    status,
    setStatus,
    registerFor,
    setRegisterFor,
    cardToRevoke,
    setCardToRevoke,
    instructors,
    filteredRows,
    withoutCard,
    stats,
    setCardStatus,
    isUpdating,
  } = vm;

  if (isPending) return <UserSkeletonLoader tabs={false} filters={[220]} columns={["icon", "stack", "pill", "text", "action"]} />;

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-8xl space-y-6 px-4 py-6 sm:px-6 md:px-8 animate-in fade-in slide-in-from-bottom-2 duration-500 ease-out">

        {/* Header */}
        <header className="flex flex-col gap-4 mt-12 md:mt-0 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-blue-600">{T.badge}</p>
            <h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-900">{T.title}</h1>
            <p className="mt-1 max-w-xl text-sm text-slate-500">{T.description}</p>
          </div>
          {canManage && (
            <button
              type="button"
              onClick={() => setRegisterFor({})}
              disabled={instructors.length === 0}
              className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm shadow-blue-600/20 transition-all hover:bg-blue-700 active:scale-[0.98] disabled:opacity-50"
            >
              <Plus className="h-4 w-4" />
              {T.newCard}
            </button>
          )}
        </header>

        {/* Summary */}
        <section className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="flex items-center justify-between gap-4 rounded-xl border border-slate-200 bg-white p-5 transition-shadow hover:shadow-sm"
            >
              <div className="min-w-0">
                <p className="truncate text-sm text-slate-500">{stat.label}</p>
                <p className="mt-1.5 text-2xl font-semibold tracking-tight text-slate-900 tabular-nums">{stat.value}</p>
                <p className="mt-0.5 truncate text-xs text-slate-400">{stat.sub}</p>
              </div>
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-500">
                <stat.icon className="h-5 w-5" />
              </span>
            </div>
          ))}
        </section>

        {/* Instructors who cannot authorize a checkout yet */}
        {withoutCard.length > 0 && (
          <section className="rounded-xl border border-amber-200 bg-amber-50/60 px-5 py-4">
            <h2 className="flex items-center gap-2 text-sm font-medium text-amber-900">
              <UserRoundX className="h-4 w-4 text-amber-600" />
              {T.withoutCard.title} · {withoutCard.length}
            </h2>
            <ul className="mt-3 flex flex-wrap gap-2">
              {withoutCard.map((instructor) => (
                <li key={instructor.id} className="inline-flex items-center gap-2 rounded-lg border border-amber-200 bg-white py-1 pl-1 pr-1.5 text-sm text-slate-700">
                  <span className="flex h-6 w-6 items-center justify-center rounded-md bg-amber-100 text-[10px] font-semibold text-amber-800">
                    {initials(instructor) || "?"}
                  </span>
                  {fullName(instructor)}
                  {canKioskAdd(instructor) && (
                    <button
                      type="button"
                      onClick={() => setKioskAddFor(instructor)}
                      title={T.withoutCard.kioskHint}
                      className="inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-xs font-medium text-blue-600 hover:bg-blue-50"
                    >
                      <Nfc className="h-3 w-3" />
                      {T.withoutCard.kioskAdd}
                    </button>
                  )}
                  {canManage && (
                    <button
                      type="button"
                      onClick={() => setRegisterFor({ userId: instructor.id })}
                      className="rounded-md px-1.5 py-0.5 text-xs font-medium text-slate-500 hover:bg-slate-100"
                    >
                      {T.withoutCard.register}
                    </button>
                  )}
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* Cards table */}
        <section className="overflow-hidden rounded-xl border border-slate-200 bg-white">

          {/* Toolbar */}
          <div className="flex flex-col gap-3 border-b border-slate-200 px-5 py-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="text-base font-semibold text-slate-900">{T.tableTitle}</h2>
              <p className="mt-0.5 text-xs text-slate-500">{T.countLabel(filteredRows.length)}</p>
            </div>

            <div className="flex flex-col flex-wrap items-stretch gap-2 sm:flex-row sm:items-center lg:justify-end">
              <div className="inline-flex shrink-0 rounded-lg bg-slate-100 p-1">
                {T.statusFilters.map(({ value, label }) => (
                  <button
                    key={value}
                    onClick={() => setStatus(value)}
                    className={`rounded-md px-3 py-1.5 text-xs font-medium transition-all ${
                      status === value ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
              <SearchBar onChangeValue={setSearch} name={T.searchName} placeholder={T.searchPlaceholder} />
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <div className="max-h-[60vh] min-h-[45vh] overflow-y-auto">
              {isError ? (
                <ErrorTable error={error} onRetry={() => refetch()} />
              ) : filteredRows.length === 0 ? (
                <div className="flex flex-col items-center justify-center px-8 py-20 text-center">
                  <span className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-slate-100">
                    <Search className="h-5 w-5 text-slate-400" />
                  </span>
                  <h3 className="text-sm font-semibold text-slate-900">{T.empty.title}</h3>
                  <p className="mt-1 max-w-sm text-sm text-slate-500">{T.empty.description}</p>
                </div>
              ) : (
                <table className="w-full text-left text-sm whitespace-nowrap">
                  <thead>
                    <tr className="sticky top-0 z-10 bg-slate-50">
                      {T.tableHeaders.map((col) => (
                        <th key={col} className="border-b border-slate-200 px-5 py-3 font-medium text-slate-500">{col}</th>
                      ))}
                      {canManage && <th className="border-b border-slate-200 px-5 py-3" />}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredRows.map(({ card, instructor }) => (
                      <tr key={card.id} className={card.status === "REVOKED" ? "text-slate-400" : "hover:bg-slate-50"}>
                        <td className="px-5 py-3">
                          <span className="inline-flex items-center gap-2.5">
                            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-500">
                              <CreditCard className="h-4 w-4" />
                            </span>
                            <span className={`font-mono font-medium ${card.status === "REVOKED" ? "text-slate-400 line-through" : "text-slate-900"}`}>{card.cardUid}</span>
                          </span>
                        </td>
                        <td className="px-5 py-3">
                          <p className="font-medium text-slate-900">{fullName(instructor)}</p>
                          <p className="text-xs text-slate-500">{instructor.employeeNo}</p>
                        </td>
                        <td className="px-5 py-3"><CardStatusPill status={card.status} /></td>
                        <td className="px-5 py-3 text-slate-600">{FormattedDateTime(card.issuedAt)}</td>
                        {canManage && (
                          <td className="px-5 py-3">
                            {card.status !== "REVOKED" && (
                              <div className="flex justify-end gap-1">
                                {card.status === "ACTIVE" ? (
                                  <button
                                    type="button"
                                    onClick={() => setCardStatus(card, "LOST")}
                                    disabled={isUpdating(card)}
                                    className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-amber-700 hover:bg-amber-50 disabled:opacity-50"
                                  >
                                    <TriangleAlert className="h-3.5 w-3.5" />
                                    {T.actions.lost}
                                  </button>
                                ) : (
                                  <button
                                    type="button"
                                    onClick={() => setCardStatus(card, "ACTIVE")}
                                    disabled={isUpdating(card)}
                                    className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-emerald-700 hover:bg-emerald-50 disabled:opacity-50"
                                  >
                                    <SearchCheck className="h-3.5 w-3.5" />
                                    {T.actions.found}
                                  </button>
                                )}
                                <button
                                  type="button"
                                  onClick={() => setCardToRevoke(card)}
                                  disabled={isUpdating(card)}
                                  className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-rose-700 hover:bg-rose-50 disabled:opacity-50"
                                >
                                  <Ban className="h-3.5 w-3.5" />
                                  {T.actions.revoke}
                                </button>
                              </div>
                            )}
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>

          {!canManage && (
            <p className="flex items-start gap-2 border-t border-slate-200 px-5 py-3 text-xs text-slate-500">
              <Info className="mt-px h-3.5 w-3.5 shrink-0 text-slate-400" />
              <span>{canEnroll ? T.kioskOnly : T.readOnly}</span>
            </p>
          )}
        </section>
      </div>

      {/* Modals */}
      {registerFor && (
        <AuthCardFormDialog instructors={instructors} userId={registerFor.userId} onClose={() => setRegisterFor(null)} />
      )}

      {kioskAddFor && <AddCardKioskDialog user={kioskAddFor} onClose={() => setKioskAddFor(null)} />}

      {cardToRevoke && (
        <PopUpModal
          title={T.revokeModal.title}
          label={T.revokeModal.label}
          noun={T.revokeModal.noun}
          onHandleCancelAction={() => setCardToRevoke(null)}
          onHandleConfirmAction={() => setCardStatus(cardToRevoke, "REVOKED", () => setCardToRevoke(null))}
          isLoading={updateCard.isPending}
        />
      )}
    </div>
  );
}
