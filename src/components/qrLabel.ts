import { assetQrApi } from "../api/asset_api";

// QR labels for assets (US-11, FR-7.1). The image comes from GET /assets/{id}/qr and encodes tams:asset:<uuid>.

type LabelAsset = { id: string; assetCode: string; name: string };

const escapeHtml = (text: string) =>
  text.replace(/[&<>"']/g, (ch) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[ch] ?? ch);

const blobToDataUrl = (blob: Blob) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error ?? new Error("Could not read the QR image."));
    reader.readAsDataURL(blob);
  });

/** Fetches the asset's QR image as a data URL, ready for an <img> or the print frame. */
export const fetchAssetQrDataUrl = async (id: string) => blobToDataUrl(await assetQrApi(id));

export const assetQrQuery = (id: string | undefined) => ({
  queryKey: ["asset-qr", id] as const,
  queryFn: () => fetchAssetQrDataUrl(id as string),
  enabled: !!id,
  staleTime: Infinity,
});

const labelHtml = (qrSrc: string, asset: LabelAsset) => `<!doctype html>
<html><head><meta charset="utf-8"><title>${escapeHtml(asset.assetCode)}</title>
<style>
  @page { margin: 6mm; }
  html, body { margin: 0; }
  body { display: flex; justify-content: center; font-family: system-ui, sans-serif; color: #000; }
  .label { display: flex; flex-direction: column; align-items: center; padding: 4mm; border: 1px dashed #999; border-radius: 2mm; }
  img { width: 40mm; height: 40mm; image-rendering: pixelated; }
  .code { font: 700 14pt ui-monospace, monospace; margin-top: 2mm; letter-spacing: .04em; }
  .name { font-size: 9pt; margin-top: 1mm; max-width: 48mm; text-align: center; color: #333; }
</style></head>
<body><div class="label">
  <img src="${qrSrc}" alt="">
  <div class="code">${escapeHtml(asset.assetCode)}</div>
  <div class="name">${escapeHtml(asset.name)}</div>
</div></body></html>`;

/**
 * Prints one label through a hidden iframe, so it works after an await
 * (no popup to be blocked) and never leaves the page.
 */
export const printQrLabel = (qrSrc: string, asset: LabelAsset) =>
  new Promise<void>((resolve, reject) => {
    const frame = document.createElement("iframe");
    frame.setAttribute("aria-hidden", "true");
    frame.tabIndex = -1;
    frame.style.cssText = "position:fixed;right:0;bottom:0;width:0;height:0;border:0";
    document.body.appendChild(frame);

    const win = frame.contentWindow;
    const doc = frame.contentDocument;
    if (!win || !doc) {
      frame.remove();
      reject(new Error("Printing is not available in this browser."));
      return;
    }

    let cleaned = false;
    const cleanup = () => {
      if (cleaned) return;
      cleaned = true;
      frame.remove();
    };

    doc.open();
    doc.write(labelHtml(qrSrc, asset));
    doc.close();

    const img = doc.querySelector("img");
    const print = () => {
      win.addEventListener("afterprint", cleanup, { once: true });
      // Fallback for browsers that never fire afterprint.
      setTimeout(cleanup, 60_000);
      win.focus();
      win.print();
      resolve();
    };

    if (!img || img.complete) {
      print();
    } else {
      img.onload = print;
      img.onerror = () => {
        cleanup();
        reject(new Error("Could not load the QR image."));
      };
    }
  });

/** Fetches the QR for an asset and prints its label in one go (asset detail page). */
export const fetchAndPrintQrLabel = async (asset: LabelAsset) =>
  printQrLabel(await fetchAssetQrDataUrl(asset.id), asset);
