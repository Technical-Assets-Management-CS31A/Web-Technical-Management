import type { FC } from "react";
import { FormattedDateTime } from "./FormattedDateTime";
import { SlugCondition } from "./SlugCondition";
import ArchiveRowActions from "./ArchiveRowActions";
import no_image_svg from "../assets/no-image-svgrepo-com.svg";
import { ARCHIVE_CONTENT as T } from "../constants/archiveContent";

type TArchiveItemTableProps = {
    id: string;
    archivedAt: string;
    itemName: string;
    serialNumber: string;
    image: string | null;
    description: string;
    category: string;
    condition: string;
    onDelete: (id: string) => void;
    onRestore: (id: string) => void;
    isRestoring: boolean;
    isDeleting: boolean;
};

export const ArchiveItemTable: FC<TArchiveItemTableProps> = (props) => (
    <>
        <td className="px-5 py-3">
            <div className="flex items-center gap-3">
                <img
                    src={typeof props.image === "string" ? props.image : no_image_svg}
                    alt={props.itemName}
                    className="h-10 w-10 shrink-0 rounded-lg border border-slate-200 bg-slate-50 object-cover"
                />
                <div className="min-w-0">
                    <p className="truncate font-medium text-slate-900">{props.itemName}</p>
                    <p className="truncate font-mono text-xs text-slate-500">{props.serialNumber}</p>
                </div>
            </div>
        </td>
        <td className="px-5 py-3 text-slate-700">{props.category}</td>
        <td className="px-5 py-3">
            <span className={`rounded px-2 py-0.5 text-xs font-medium ${SlugCondition(props.condition)}`}>
                {props.condition}
            </span>
        </td>
        <td className="px-5 py-3 text-slate-600">{FormattedDateTime(props.archivedAt)}</td>
        <td className="px-5 py-3 text-right">
            <ArchiveRowActions
                restoreLabel={T.rowActions.restoreItem}
                deleteLabel={T.rowActions.deleteItem}
                onRestore={() => props.onRestore(props.id)}
                onDelete={() => props.onDelete(props.id)}
                isRestoring={props.isRestoring}
                isDeleting={props.isDeleting}
            />
        </td>
    </>
);
