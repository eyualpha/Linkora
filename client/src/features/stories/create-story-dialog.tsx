import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Film } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { storiesApi } from "@/lib/api";
import { getErrorMessage } from "@/lib/api/client";

interface CreateStoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateStoryDialog({ open, onOpenChange }: CreateStoryDialogProps) {
  const queryClient = useQueryClient();
  const [file, setFile] = useState<File | null>(null);
  const [caption, setCaption] = useState("");
  const [error, setError] = useState("");

  const mutation = useMutation({
    mutationFn: async () => {
      if (!file) throw new Error("Please select media");
      const formData = new FormData();
      formData.append("media", file);
      if (caption.trim()) formData.append("caption", caption.trim());
      return storiesApi.create(formData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["stories"] });
      setFile(null);
      setCaption("");
      setError("");
      onOpenChange(false);
    },
    onError: (err) => setError(getErrorMessage(err)),
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Add to your story</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <label className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50 p-10 transition hover:border-primary/50">
            <Film className="mb-2 h-10 w-10 text-muted" />
            <span className="text-sm text-muted">Photo or video (24h)</span>
            <input
              type="file"
              accept="image/*,video/*"
              className="hidden"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
            />
          </label>

          {file && (
            <div className="overflow-hidden rounded-2xl">
              {file.type.startsWith("video/") ? (
                <video src={URL.createObjectURL(file)} className="max-h-48 w-full object-cover" controls />
              ) : (
                <img src={URL.createObjectURL(file)} alt="" className="max-h-48 w-full object-cover" />
              )}
            </div>
          )}

          <Input placeholder="Add a caption..." value={caption} onChange={(e) => setCaption(e.target.value)} />

          {error && <p className="text-sm text-red-500">{error}</p>}

          <Button variant="gradient" className="w-full" disabled={!file || mutation.isPending} onClick={() => mutation.mutate()}>
            {mutation.isPending ? "Uploading..." : "Share story"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
