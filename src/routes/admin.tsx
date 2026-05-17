import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Trash2, ArrowUp, ArrowDown, Upload, LogOut } from "lucide-react";
import { OCCASIONS } from "@/lib/order-config";

type Photo = {
  id: string;
  image_path: string;
  caption: string | null;
  sort_order: number;
  category: string | null;
};

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Gallery Admin — Vanilla Valley Bakery" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: AdminPage,
});

function publicUrl(path: string) {
  return supabase.storage.from("gallery-photos").getPublicUrl(path).data.publicUrl;
}

function AdminPage() {
  const navigate = useNavigate();
  const [checking, setChecking] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [file, setFile] = useState<File | null>(null);
  const [caption, setCaption] = useState("");
  const [category, setCategory] = useState<string>(OCCASIONS[0]);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data: sess } = await supabase.auth.getSession();
      if (!sess.session) {
        navigate({ to: "/login" });
        return;
      }
      const { data: roles } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", sess.session.user.id)
        .eq("role", "admin");
      if (cancelled) return;
      if (!roles || roles.length === 0) {
        setChecking(false);
        setIsAdmin(false);
        return;
      }
      setIsAdmin(true);
      setChecking(false);
      void loadPhotos();
    })();
    return () => { cancelled = true; };
  }, [navigate]);

  const loadPhotos = async () => {
    const { data } = await supabase
      .from("gallery_photos")
      .select("id,image_path,caption,sort_order,category")
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: false });
    setPhotos(data ?? []);
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;
    setError(null);
    setUploading(true);
    try {
      const ext = file.name.split(".").pop() ?? "jpg";
      const path = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
      const { error: upErr } = await supabase.storage
        .from("gallery-photos")
        .upload(path, file, { upsert: false, contentType: file.type });
      if (upErr) throw upErr;

      const maxOrder = photos.reduce((m, p) => Math.max(m, p.sort_order), 0);
      const { error: insErr } = await supabase.from("gallery_photos").insert({
        image_path: path,
        caption: caption.trim() || null,
        category,
        sort_order: maxOrder + 1,
      });
      if (insErr) throw insErr;

      setFile(null);
      setCaption("");
      (document.getElementById("file-input") as HTMLInputElement | null)?.value && ((document.getElementById("file-input") as HTMLInputElement).value = "");
      await loadPhotos();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (photo: Photo) => {
    if (!confirm("Delete this photo?")) return;
    await supabase.storage.from("gallery-photos").remove([photo.image_path]);
    await supabase.from("gallery_photos").delete().eq("id", photo.id);
    await loadPhotos();
  };

  const handleMove = async (idx: number, dir: -1 | 1) => {
    const other = idx + dir;
    if (other < 0 || other >= photos.length) return;
    const a = photos[idx];
    const b = photos[other];
    await supabase.from("gallery_photos").update({ sort_order: b.sort_order }).eq("id", a.id);
    await supabase.from("gallery_photos").update({ sort_order: a.sort_order }).eq("id", b.id);
    await loadPhotos();
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate({ to: "/login" });
  };

  if (checking) {
    return <div className="min-h-screen flex items-center justify-center text-sm text-muted-foreground">Checking access…</div>;
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 text-center">
        <div>
          <h1 className="text-xl font-semibold">No admin access</h1>
          <p className="mt-2 text-sm text-muted-foreground">Your account exists but isn't an admin yet.</p>
          <button onClick={handleSignOut} className="mt-4 text-sm underline">Sign out</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="px-4 py-4 border-b border-border flex items-center justify-between">
        <Link to="/gallery" className="text-sm text-muted-foreground">View public gallery</Link>
        <button onClick={handleSignOut} className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
          <LogOut className="w-4 h-4" /> Sign out
        </button>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6">
        <h1 className="text-2xl font-semibold">Gallery Admin</h1>

        <form onSubmit={handleUpload} className="mt-6 space-y-3 p-4 rounded-lg border border-dashed border-border">
          <div>
            <label
              htmlFor="file-input"
              className="flex flex-col items-center justify-center gap-2 w-full py-8 rounded-md border-2 border-dashed border-border bg-muted/30 cursor-pointer hover:bg-muted/50 transition-colors"
            >
              <Upload className="w-6 h-6 text-muted-foreground" />
              <span className="text-sm font-medium">
                {file ? file.name : "Tap to choose a photo"}
              </span>
              {file && (
                <span className="text-xs text-muted-foreground">
                  {(file.size / 1024 / 1024).toFixed(2)} MB
                </span>
              )}
            </label>
            <input
              id="file-input"
              type="file"
              accept="image/*"
              required
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              className="sr-only"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              {OCCASIONS.map((o) => (
                <option key={o} value={o}>{o}</option>
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
            disabled={!file || uploading}
            className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            <Upload className="w-4 h-4" />
            {uploading ? "Uploading…" : file ? "Upload photo" : "Choose a photo first"}
          </button>
        </form>

        <h2 className="mt-8 text-lg font-semibold">Photos ({photos.length})</h2>
        <div className="mt-3 space-y-3">
          {photos.length === 0 && <p className="text-sm text-muted-foreground">No photos yet.</p>}
          {photos.map((p, i) => (
            <div key={p.id} className="flex items-center gap-3 p-2 border border-border rounded-md">
              <img src={publicUrl(p.image_path)} alt="" className="w-16 h-16 object-cover rounded" />
              <div className="flex-1 min-w-0">
                <p className="text-sm truncate">{p.caption || <span className="text-muted-foreground">No caption</span>}</p>
                <p className="text-xs text-muted-foreground">{p.category || "Uncategorised"} · Order: {p.sort_order}</p>
              </div>
              <div className="flex flex-col gap-1">
                <button onClick={() => handleMove(i, -1)} disabled={i === 0} className="p-1 disabled:opacity-30">
                  <ArrowUp className="w-4 h-4" />
                </button>
                <button onClick={() => handleMove(i, 1)} disabled={i === photos.length - 1} className="p-1 disabled:opacity-30">
                  <ArrowDown className="w-4 h-4" />
                </button>
              </div>
              <button onClick={() => handleDelete(p)} className="p-2 text-destructive">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
