import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Ban, CreditCard, TriangleAlert, UserRoundX } from "lucide-react";
import type { AuthCardDto, CardStatus, UserDto } from "../../../@types/types";
import { useAllUsers, useUpdateAuthCard } from "../../../hooks/userHooks";
import { showToast } from "../../../components/AppToast";
import { cardStatusErrorMessage } from "../../../lib/cardErrors";
import { formatEnum, fullName } from "../../../lib/utils";
import { UserData, canEnrollCards, canHoldCard, canManageAccounts } from "../../../utils/usersData/userData";
import { AUTH_CARDS_CONTENT as T } from "../../../constants/authCardsContent";

export type StatusFilter = (typeof T.statusFilters)[number]["value"];
export type CardRow = { card: AuthCardDto; instructor: UserDto };

export const STATUS_ORDER: Record<CardStatus, number> = { ACTIVE: 0, LOST: 1, REVOKED: 2 };

export const useAuthCardsViewModel = () => {
  const viewer = UserData();
  const canManage = canManageAccounts(viewer.role);
  const canEnroll = canEnrollCards(viewer.role);

  const { data: users = [], isPending, isError, error, refetch } = useQuery(useAllUsers());
  const updateCard = useUpdateAuthCard();

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<StatusFilter>("all");
  const [registerFor, setRegisterFor] = useState<{ userId?: string } | null>(null);
  const [cardToRevoke, setCardToRevoke] = useState<AuthCardDto | null>(null);
  const [kioskAddFor, setKioskAddFor] = useState<UserDto | null>(null);

  // Cardholders: instructors and event coordinators.
  const instructors = useMemo(
    () => users.filter((u) => (u.role === "INSTRUCTOR" || u.isEventCoordinator) && !u.deletedAt).sort((a, b) => fullName(a).localeCompare(fullName(b))),
    [users],
  );

  const rows = useMemo<CardRow[]>(
    () =>
      instructors
        .flatMap((instructor) => (instructor.authCards ?? []).map((card) => ({ card, instructor })))
        .sort((a, b) => STATUS_ORDER[a.card.status] - STATUS_ORDER[b.card.status] || b.card.issuedAt.localeCompare(a.card.issuedAt)),
    [instructors],
  );

  const filteredRows = useMemo(() => {
    const q = search.trim().toLowerCase();
    return rows
      .filter((row) => status === "all" || row.card.status === status)
      .filter(
        ({ card, instructor }) =>
          !q || [card.cardUid, fullName(instructor), instructor.employeeNo, instructor.email].some((v) => v?.toLowerCase().includes(q)),
      );
  }, [rows, search, status]);

  const withoutCard = instructors.filter((u) => !u.authCards?.some((c) => c.status === "ACTIVE"));
  const countByStatus = (s: CardStatus) => rows.filter((row) => row.card.status === s).length;
  const instructorsWithActive = instructors.length - withoutCard.length;

  const stats = [
    { label: T.stats.active, value: countByStatus("ACTIVE"), sub: T.stats.activeSub(instructorsWithActive), icon: CreditCard },
    { label: T.stats.lost, value: countByStatus("LOST"), sub: T.stats.lostSub, icon: TriangleAlert },
    { label: T.stats.revoked, value: countByStatus("REVOKED"), sub: T.stats.revokedSub, icon: Ban },
    { label: T.stats.noCard, value: withoutCard.length, sub: T.stats.noCardSub, icon: UserRoundX },
  ];

  const setCardStatus = (card: AuthCardDto, next: CardStatus, onDone?: () => void) => {
    updateCard.mutate(
      { cardId: card.id, data: { status: next } },
      {
        onSuccess: () => showToast.success(T.toast.updated, T.toast.updatedMessage(card.cardUid, formatEnum(next))),
        onError: (err) => showToast.error(T.toast.failed, cardStatusErrorMessage(err, T.toast.failedMessage)),
        onSettled: onDone,
      },
    );
  };

  const isUpdating = (card: AuthCardDto) => updateCard.isPending && updateCard.variables?.cardId === card.id;

  const canKioskAdd = (user: UserDto) => canEnroll && canHoldCard(user);

  return {
    viewer,
    canManage,
    canEnroll,
    canKioskAdd,
    kioskAddFor,
    setKioskAddFor,
    users,
    isPending,
    isError,
    error,
    refetch,
    updateCard,
    search,
    setSearch,
    status,
    setStatus,
    registerFor,
    setRegisterFor,
    cardToRevoke,
    setCardToRevoke,
    instructors,
    rows,
    filteredRows,
    withoutCard,
    countByStatus,
    instructorsWithActive,
    stats,
    setCardStatus,
    isUpdating,
  };
};

export type AuthCardsViewModel = ReturnType<typeof useAuthCardsViewModel>;
