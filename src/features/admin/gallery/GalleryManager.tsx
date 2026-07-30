import { useState } from "react";
import { ArrowDown, ArrowUp, Trash2, Upload } from "lucide-react";
import { FileDropField } from "@/components/common";
import { GALLERY_CATEGORIES } from "@/config/occasions";
import {
  useGalleryMutations,
  useGalleryPhotos,
} from "@/features/gallery/hooks/useGalleryPhotos";
import { galleryPhotoUrl } from "@/features/gallery/components/GalleryGrid";
import type { GalleryPhoto } from "@/features/gallery/types";

export function GalleryManager() {
  const { data: photos = [], isLoading } = useGalleryPhotos();
  const { upload, remove, reorder } = useGalleryMutations();

  const [file, setFile] = useState<File | null>(null);
  const [caption, setCaption] = useState("");
  const [category, setCategory] = useState<string>(GALLERY_CATEGORIES[0]);
  const [error, setError] = useState<string | null>(null);

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;
    setError(null);
    try {
      const nextSortOrder = photos.reduce((m, p) => Math.max(m, p.sort_order), 0) + 1;
      await upload.mutateAsync({ file, caption, category, nextSortOrder });
      setFile(null);
      setCaption("");
      const input = document.getElementById("gallery-file-input") as HTMLInputElement | null;
      if (input) input.value = "";
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    }
  };

  const handleDelete = (photo: GalleryPhoto) => {
    if (!confirm("Delete this photo?")) return;
    remove.mutate(photo);
  };

  const handleMove = (index: number, dir: -1 | 1) => {
    const other = index + dir;
    if (other < 0 || other >= photos.length) return;
    reorder.mutate({ a: photos[index], b: photos[other] });
  };

  return (
    <>
      <form
        onSubmit={handleUpload}
        className="mt-6 space-y-3 p-4 rounded-lg border border-dashed border-border"
      >
        <div>
          <FileDropField
            id="gallery-file-input"
            variant="block"
            showSize
            required
            file={file}
            onFileChange={setFile}
            placeholder="Tap to choose a photo"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Category</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          >
            {GALLERY_CATEGORIES.map((o) => (
              <option key={o} value={o}>
                {o}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Caption (optional)</label>
          <input
            type="text"
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            maxLength={200}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            placeholder="e.g. Pink floral 70th birthday cake"
          />
        </div>
        {error && <p className="text-sm text-destructive">{error}</p>}
        <button
          type="submit"
          disabled={!file || upload.isPending}
          className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          <Upload className="w-4 h-4" />
          {upload.isPending ? "Uploading…" : file ? "Upload photo" : "Choose a photo first"}
        </button>
      </form>

      <h2 className="mt-8 text-lg font-semibold">Photos ({photos.length})</h2>
      <div className="mt-3 space-y-3">
        {isLoading && <p className="text-sm text-muted-foreground">Loading…</p>}
        {!isLoading && photos.length === 0 && (
          <p className="text-sm text-muted-foreground">No photos yet.</p>
        )}
        {photos.map((p, i) => (
          <div key={p.id} className="flex items-center gap-3 p-2 border border-border rounded-md">
            <img
              src={galleryPhotoUrl(p.image_path)}
              alt=""
              className="w-16 h-16 object-cover rounded"
            />
            <div className="flex-1 min-w-0">
              <p className="text-sm truncate">
                {p.caption || <span className="text-muted-foreground">No caption</span>}
              </p>
              <p className="text-xs text-muted-foreground">
                {p.category || "Uncategorised"} · Order: {p.sort_order}
              </p>
            </div>
            <div className="flex flex-col gap-1">
              <button
                onClick={() => handleMove(i, -1)}
                disabled={i === 0}
                className="p-1 disabled:opacity-30"
                aria-label="Move up"
              >
                <ArrowUp className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleMove(i, 1)}
                disabled={i === photos.length - 1}
                className="p-1 disabled:opacity-30"
                aria-label="Move down"
              >
                <ArrowDown className="w-4 h-4" />
              </button>
            </div>
            <button
              onClick={() => handleDelete(p)}
              className="p-2 text-destructive"
              aria-label="Delete photo"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </>
  );
}
