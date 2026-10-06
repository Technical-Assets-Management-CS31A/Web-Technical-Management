import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useGetArchiveItemInfo } from "../hooks/itemHooks";
import { Hash, Tag, Layers, Wrench, Package, FileText } from "lucide-react";
import { SlugCondition } from "./SlugCondition";
import {
  ArchiveDialog,
  ArchiveError,
  ArchiveLoading,
  ArchivedNotice,
  DetailSection,
  ImageLightbox,
  InfoRow,
  NeutralBadge,
  ZoomableImage,
} from "./ArchiveDetailShell";

type TArchiveItemDetailsPopupProps = {
  itemId: string;
  isOpen: boolean;
  onClose: () => void;
};

export default function ArchiveItemDetailsPopup({
  itemId,
  isOpen,
  onClose,
}: TArchiveItemDetailsPopupProps) {
  const { data: item, isPending, isError } = useQuery(useGetArchiveItemInfo(itemId));
  const [lightboxSrc, setLightboxSrc] = useState<string | null>(null);

  if (!isOpen) return null;
  if (isPending) return <ArchiveLoading message="Loading item details..." />;
  if (isError || !item) return <ArchiveError message="Could not load this archived item." onClose={onClose} />;

  return (
    <ArchiveDialog
      label="Archived Item"
      titleId="archive-item-title"
      recordId={item.id ?? itemId}
      recordIdLabel="Item ID"
      onClose={onClose}
      onEscape={() => (lightboxSrc ? setLightboxSrc(null) : onClose())}
    >
      {/* Overview */}
      <div className="flex flex-col gap-5 sm:flex-row">
        <ZoomableImage
          src={item.image}
          alt={item.itemName}
          emptyLabel="No image"
          className="aspect-square w-full shrink-0 sm:w-40"
          onZoom={setLightboxSrc}
        />
        <div className="flex min-w-0 flex-1 flex-col justify-center">
          <h2 id="archive-item-title" className="text-lg font-semibold tracking-tight text-slate-900">
            {item.itemName}
          </h2>
          <p className="mt-0.5 font-mono text-sm text-slate-500">{item.serialNumber || "No serial number"}</p>
          <div className="mt-3 flex flex-wrap gap-1.5">
            {item.category && <NeutralBadge icon={Tag}>{item.category}</NeutralBadge>}
            {item.condition && (
              <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium ${SlugCondition(item.condition)}`}>
                {item.condition}
              </span>
            )}
          </div>
        </div>
      </div>

      <ArchivedNotice archivedAt={item.archivedAt} subject="item" />

      <DetailSection title="Specifications" columns={2}>
        <InfoRow icon={Hash} label="Serial Number" value={item.serialNumber} mono copyable />
        <InfoRow icon={Tag} label="Category" value={item.category} />
        <InfoRow icon={Layers} label="Type" value={item.itemType} />
        <InfoRow icon={Wrench} label="Make" value={item.itemMake} />
        <InfoRow icon={Package} label="Model" value={item.itemModel} full />
      </DetailSection>

      {item.description && (
        <section>
          <h3 className="mb-2 text-xs font-medium uppercase tracking-wider text-slate-400">Description</h3>
          <div className="flex gap-3 rounded-xl border border-slate-200 px-4 py-3">
            <FileText className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
            <p className="whitespace-pre-line text-sm leading-relaxed text-slate-700">{item.description}</p>
          </div>
        </section>
      )}

      {lightboxSrc && <ImageLightbox src={lightboxSrc} alt={item.itemName} onClose={() => setLightboxSrc(null)} />}
    </ArchiveDialog>
  );
}
