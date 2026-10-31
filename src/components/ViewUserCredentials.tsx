import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
    Mail,
    Hash,
    CalendarPlus,
    CalendarClock,
    CalendarCheck,
    CreditCard,
    DoorOpen,
    Plus,
    ShieldCheck,
    Snowflake,
    UserRound,
} from "lucide-react";
import type { CardStatus, UserDto } from "../@types/types";
import { FormattedDateTime } from "./FormattedDateTime";
import { formatEnum, formatRole, fullName, initials } from "../lib/utils";
import { ArchiveDialog, DeletedNotice, DetailHeader, DetailSection, InfoRow, InitialsAvatar, NeutralBadge } from "./ArchiveDetailShell";
import { useAddAuthCard, useLiftFreeze, useUpdateAuthCard } from "../hooks/userHooks";
import { useAllRooms } from "../hooks/assetHooks";
import { UserData, canManageAccounts, canResolvePenalties } from "../utils/usersData/userData";
import ReasonDialog from "./ReasonDialog";
import { showToast } from "./AppToast";
import { TextInput, getErrorMessage } from "./form/FormKit";

type ViewUserCredentialsProps = {
    user: UserDto;
    isOpen: boolean;
    onClose: () => void;
};

const CARD_TONE: Record<CardStatus, string> = {
    ACTIVE: "bg-emerald-50 text-emerald-700 ring-emerald-200",
    LOST: "bg-amber-50 text-amber-700 ring-amber-200",
    REVOKED: "bg-slate-100 text-slate-600 ring-slate-200",
};

const ViewUserCredentials = ({ user, isOpen, onClose }: ViewUserCredentialsProps) => {
    const viewer = UserData();
    const { data: rooms = [] } = useQuery(useAllRooms());
    const addCard = useAddAuthCard();
    const updateCard = useUpdateAuthCard();
    const liftFreeze = useLiftFreeze();
    const [newCardUid, setNewCardUid] = useState("");
    const [isLiftOpen, setIsLiftOpen] = useState(false);

    if (!isOpen) return null;

    const isInstructor = user.role === "INSTRUCTOR";
    const canManage = canManageAccounts(viewer.role);
    const defaultRoom = rooms.find((room) => room.id === user.defaultRoomId);

    const handleAddCard = () => {
        // Card UIDs are uppercase hex with no separators, like asset tags
        const cardUid = newCardUid.replace(/[^0-9a-f]/gi, "").toUpperCase();
        if (!cardUid) return;
        addCard.mutate(
            { userId: user.id, data: { cardUid, status: "ACTIVE" } },
            {
                onSuccess: () => {
                    setNewCardUid("");
                    showToast.success("Card Registered", `Card ${cardUid} is now active.`);
                },
                onError: (err) => showToast.error("Card Not Saved", getErrorMessage(err, "Failed to register card.")),
            },
        );
    };

    const handleCardStatus = (cardId: string, status: CardStatus) => {
        updateCard.mutate(
            { cardId, data: { status } },
            { onError: (err) => showToast.error("Card Not Updated", getErrorMessage(err, "Failed to update card.")) },
        );
    };

    return (
        <ArchiveDialog label={formatRole(user.role)} icon={ShieldCheck} titleId="user-detail-title" recordId={user.id} recordIdLabel="User ID" onClose={onClose}>
            <DetailHeader
                titleId="user-detail-title"
                title={fullName(user)}
                subtitle={user.email}
                avatar={<InitialsAvatar initials={initials(user) || "?"} />}
                badges={
                    <>
                        <NeutralBadge icon={ShieldCheck}>{formatRole(user.role)}</NeutralBadge>
                        <NeutralBadge>{formatEnum(user.status)}</NeutralBadge>
                        {user.isEventCoordinator && <NeutralBadge icon={CalendarCheck}>Event coordinator</NeutralBadge>}
                    </>
                }
            />

            {user.deletedAt && <DeletedNotice deletedAt={user.deletedAt} subject="account" />}

            {/* Approval freeze — instructors can't approve on mobile until staff lift it */}
            {isInstructor && user.isFrozen && (
                <div className="flex flex-col gap-3 rounded-xl border border-sky-200 bg-sky-50/70 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-start gap-3 text-sm">
                        <Snowflake className="mt-0.5 h-4 w-4 shrink-0 text-sky-600" />
                        <div>
                            <p className="font-medium text-sky-900">Approvals frozen</p>
                            <p className="text-sky-800/80">
                                {user.activeFreeze?.reason ?? "This instructor cannot approve borrows on mobile."}
                                {user.activeFreeze?.frozenAt && ` Since ${FormattedDateTime(user.activeFreeze.frozenAt)}.`}
                            </p>
                        </div>
                    </div>
                    {canResolvePenalties(viewer.role) && user.activeFreeze && (
                        <button
                            type="button"
                            onClick={() => setIsLiftOpen(true)}
                            className="shrink-0 rounded-lg border border-sky-200 bg-white px-3 py-1.5 text-sm font-medium text-sky-800 transition-colors hover:bg-sky-100"
                        >
                            Lift freeze
                        </button>
                    )}
                </div>
            )}

            <DetailSection title="Account" columns={2}>
                <InfoRow icon={Hash} label="Employee No." value={user.employeeNo} mono copyable />
                <InfoRow icon={Mail} label="Email" value={user.email} href={`mailto:${user.email}`} copyable />
                <InfoRow icon={UserRound} label="Role" value={formatRole(user.role)} />
                {isInstructor && <InfoRow icon={DoorOpen} label="Default room" value={defaultRoom ? `${defaultRoom.code} — ${defaultRoom.name}` : null} />}
                <InfoRow icon={CalendarPlus} label="Created" value={FormattedDateTime(user.createdAt)} />
                <InfoRow icon={CalendarClock} label="Updated" value={FormattedDateTime(user.updatedAt)} />
            </DetailSection>

            {/* RFID authorization cards — the card tapped first at the kiosk belongs to the instructor */}
            {isInstructor && (
                <section>
                    <h3 className="mb-2 text-xs font-medium uppercase tracking-wider text-slate-400">Authorization cards</h3>
                    <div className="divide-y divide-slate-100 overflow-hidden rounded-xl border border-slate-200">
                        {(user.authCards ?? []).length === 0 && (
                            <p className="bg-white px-4 py-3 text-sm italic text-slate-400">No card registered. This instructor cannot start a kiosk checkout.</p>
                        )}
                        {(user.authCards ?? []).map((card) => (
                            <div key={card.id} className="flex items-center gap-3 bg-white px-4 py-3">
                                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-500">
                                    <CreditCard className="h-4 w-4" />
                                </span>
                                <div className="min-w-0 flex-1">
                                    <p className="truncate font-mono text-sm font-medium text-slate-900">{card.cardUid}</p>
                                    <p className="text-xs text-slate-500">Issued {FormattedDateTime(card.issuedAt)}</p>
                                </div>
                                <span className={`rounded-md px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${CARD_TONE[card.status]}`}>{formatEnum(card.status)}</span>
                                {canManage && card.status === "ACTIVE" && (
                                    <div className="flex gap-1">
                                        <button type="button" onClick={() => handleCardStatus(card.id, "LOST")} className="rounded-md px-2 py-1 text-xs font-medium text-amber-700 hover:bg-amber-50">Lost</button>
                                        <button type="button" onClick={() => handleCardStatus(card.id, "REVOKED")} className="rounded-md px-2 py-1 text-xs font-medium text-rose-700 hover:bg-rose-50">Revoke</button>
                                    </div>
                                )}
                            </div>
                        ))}
                        {canManage && (
                            <div className="flex items-center gap-2 bg-slate-50/60 px-4 py-3">
                                <TextInput
                                    value={newCardUid}
                                    onChange={(e) => setNewCardUid(e.target.value)}
                                    placeholder="Card UID, e.g. 04A3B2C1"
                                    aria-label="New card UID"
                                    className="font-mono"
                                />
                                <button
                                    type="button"
                                    onClick={handleAddCard}
                                    disabled={!newCardUid.trim() || addCard.isPending}
                                    className="inline-flex h-10 shrink-0 items-center gap-1.5 rounded-lg bg-blue-600 px-3 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:opacity-50"
                                >
                                    <Plus className="h-4 w-4" />
                                    Add card
                                </button>
                            </div>
                        )}
                    </div>
                </section>
            )}

            {isLiftOpen && user.activeFreeze && (
                <ReasonDialog
                    title="Lift approval freeze"
                    subtitle={fullName(user)}
                    confirmLabel="Lift freeze"
                    isSubmitting={liftFreeze.isPending}
                    onClose={() => setIsLiftOpen(false)}
                    onConfirm={(reason) =>
                        liftFreeze.mutate(
                            { id: user.activeFreeze!.id, data: { reason } },
                            {
                                onSuccess: () => {
                                    setIsLiftOpen(false);
                                    showToast.success("Freeze Lifted", `${fullName(user)} can approve borrows again.`);
                                },
                                onError: (err) => showToast.error("Not Lifted", getErrorMessage(err, "Failed to lift freeze.")),
                            },
                        )
                    }
                />
            )}
        </ArchiveDialog>
    );
};

export default ViewUserCredentials;
