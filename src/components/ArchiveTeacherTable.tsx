import type { FC } from "react";
import ArchiveRowActions from "./ArchiveRowActions";
import { StatusBadge, UserIdentity } from "./ArchiveCells";
import { ARCHIVE_CONTENT as T } from "../constants/archiveContent";

type ArchiveTeacherTableProps = {
    id: string;
    firstName: string;
    middleName: string;
    lastName: string;
    username: string;
    status: string;
    onDelete: (id: string) => void;
    onRestore: (id: string) => void;
    isRestoring: boolean;
    isDeleting: boolean;
};

export const ArchiveTeacherTable: FC<ArchiveTeacherTableProps> = (props) => (
    <>
        <td className="px-5 py-3">
            <UserIdentity
                firstName={props.firstName}
                middleName={props.middleName}
                lastName={props.lastName}
                subtitle={props.id}
            />
        </td>
        <td className="px-5 py-3 text-slate-700">{props.username}</td>
        <td className="px-5 py-3">
            <StatusBadge status={props.status} />
        </td>
        <td className="px-5 py-3 text-right">
            <ArchiveRowActions
                restoreLabel={T.rowActions.restoreUser}
                deleteLabel={T.rowActions.deleteUser}
                onRestore={() => props.onRestore(props.id)}
                onDelete={() => props.onDelete(props.id)}
                isRestoring={props.isRestoring}
                isDeleting={props.isDeleting}
            />
        </td>
    </>
);
