import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ImagePlus } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { postsApi } from "@/lib/api";
import { getErrorMessage } from "@/lib/api/client";

interface CreatePostDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreatePostDialog({ open, onOpenChange }: CreatePostDialogProps) {
  const queryClient = useQueryClient();
  const [text, setText] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [error, setError] = useState("");

  const mutation = useMutation({
    mutationFn: async () => {
      const formData = new FormData();
      if (text.trim()) formData.append("text", text.trim());
      files.forEach((file) => formData.append("file", file));
      return postsApi.create(formData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["posts"] });
      setText("");
      setFiles([]);
      setError("");
      onOpenChange(false);
    },
    onError: (err) => setError(getErrorMessage(err)),
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Create a post</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <Textarea
            placeholder="What's on your mind?"
            value={text}
            onChange={(e) => setText(e.target.value)}
          />

          <label className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50 p-8 transition hover:border-primary/50">
            <ImagePlus className="mb-2 h-8 w-8 text-muted" />
            <span className="text-sm text-muted">Add up to 2 images</span>
            <input
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={(e) => setFiles(Array.from(e.target.files || []).slice(0, 2))}
            />
          </label>

          {files.length > 0 && (
            <div className="grid grid-cols-2 gap-2">
              {files.map((file) => (
                <img
                  key={file.name}
                  src={URL.createObjectURL(file)}
                  alt=""
                  className="aspect-square rounded-xl object-cover"
                />
              ))}
            </div>
          )}

          {error && <p className="text-sm text-red-500">{error}</p>}

          <Button
            variant="gradient"
            className="w-full"
            disabled={mutation.isPending || (!text.trim() && files.length === 0)}
            onClick={() => mutation.mutate()}
          >
            {mutation.isPending ? "Posting..." : "Share post"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
