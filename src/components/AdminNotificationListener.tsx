import { useEffect } from 'react';
import { useSignalR } from '../hooks/useSignalR';
import { showToast } from './AppToast';
import { useQueryClient } from '@tanstack/react-query';
import type { StationHealth } from '../@types/types';
import { formatEnum } from '../lib/utils';

// ── Staff dashboard events (PRD 6.4) ──────────────────────────────────────────

interface AnomalyEvent {
    anomalyId: string;
    type: string;
    assetCode?: string;
    roomCode?: string;
}

interface WarningIssuedEvent {
    loanId: string;
    studentName?: string;
    warningNo: number;
    penaltyTriggered: boolean;
}

interface LoanOverdueEvent {
    loanId: string;
    assetCode?: string;
    studentName?: string;
}

interface StationHealthChangedEvent {
    stationId: string;
    stationCode: string;
    health: StationHealth;
}

// ── Component ─────────────────────────────────────────────────────────────────

/**
 * Mounts once in the Home layout for staff and admins.
 *
 * Initialization order (critical):
 *   1. Register all SignalR event handlers via subscribe() — queued in the
 *      service's pendingHandlers list before the connection exists.
 *   2. Call connect() — starts the connection and replays queued handlers.
 *   3. Call joinAdminStaffGroup() — join the group so events start flowing.
 */
const AdminNotificationListener = () => {
    const { connect, subscribe, joinAdminStaffGroup } = useSignalR();
    const queryClient = useQueryClient();

    useEffect(() => {
        const refresh = (...keys: string[]) => keys.forEach((key) => queryClient.invalidateQueries({ queryKey: [key] }));

        // Step 1: Register all handlers BEFORE connecting so none are missed
        const unsubscribers = [
            subscribe('asset.statusChanged', () => {
                refresh('assets', 'loans', 'dashboard');
            }),
            subscribe('loan.created', () => {
                refresh('loans', 'assets', 'dashboard', 'kioskSessions');
            }),
            subscribe('room.occupancyChanged', () => {
                refresh('dashboard', 'loans');
            }),
            subscribe('anomaly.raised', (e: AnomalyEvent) => {
                showToast.warning('Location Anomaly', [formatEnum(e.type), e.assetCode, e.roomCode].filter(Boolean).join(' · '), { autoClose: 10000 });
                refresh('dashboard', 'loans', 'assets');
            }),
            subscribe('anomaly.resolved', () => {
                refresh('dashboard', 'loans', 'assets');
            }),
            subscribe('warning.issued', (e: WarningIssuedEvent) => {
                showToast.info(
                    `Late Arrival Warning #${e.warningNo}`,
                    `${e.studentName ?? 'A student'}${e.penaltyTriggered ? ' now has a Non-Compliance Mark.' : ' arrived late.'}`,
                );
                refresh('students', 'standing', 'loans');
            }),
            subscribe('loan.overdue', (e: LoanOverdueEvent) => {
                showToast.warning('Loan Overdue', [e.assetCode, e.studentName].filter(Boolean).join(' · '), { autoClose: 10000 });
                refresh('loans', 'dashboard', 'students');
            }),
            subscribe('station.healthChanged', (e: StationHealthChangedEvent) => {
                if (e.health === 'OFFLINE') showToast.error('Station Offline', e.stationCode);
                refresh('dashboard');
            }),
        ];

        // Step 2: Connect → Step 3: Join group
        connect()
            .then(() => joinAdminStaffGroup())
            .catch((err) => {
                console.error('[AdminNotificationListener] Connection failed:', err);
                showToast.error('SignalR Connection Failed', 'Real-time notifications are not available. Please refresh the page.');
            });

        return () => {
            unsubscribers.forEach((unsubscribe) => unsubscribe());
        };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return null;
};

export default AdminNotificationListener;
