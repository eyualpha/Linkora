import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Camera } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { UserAvatar } from "@/components/shared/user-avatar";
import { usersApi } from "@/lib/api";
import { useAuthStore } from "@/stores/auth-store";
import { getErrorMessage } from "@/lib/api/client";

const schema = z.object({
  fullname: z.string().min(2),
  username: z.string().min(3),
  bio: z.string().max(160).optional(),
});

type FormData = z.infer<typeof schema>;

export function SettingsPage() {
  const { user, setUser } = useAuthStore();
  const [profileFile, setProfileFile] = useState<File | null>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const { register, handleSubmit } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      fullname: user?.fullname || "",
      username: user?.username || "",
      bio: user?.bio || "",
    },
  });

  const mutation = useMutation({
    mutationFn: async (data: FormData) => {
      const formData = new FormData();
      formData.append("fullname", data.fullname);
      formData.append("username", data.username);
      if (data.bio) formData.append("bio", data.bio);
      if (profileFile) formData.append("profilePicture", profileFile);
      if (coverFile) formData.append("coverPicture", coverFile);
      return usersApi.updateProfile(formData);
    },
    onSuccess: (res) => {
      setUser(res.data.user);
      setSuccess("Profile updated successfully");
      setError("");
    },
    onError: (err) => setError(getErrorMessage(err)),
  });

  return (
    <section className="mx-auto max-w-2xl">
      <h2 className="mb-6 text-xl font-bold">Settings</h2>
      <Card>
        <CardHeader>
          <div className="relative">
            {user?.coverPicture ? (
              <img src={user.coverPicture} alt="" className="h-32 w-full rounded-2xl object-cover" />
            ) : (
              <div className="h-32 rounded-2xl bg-gradient-to-r from-orange-200 to-pink-200" />
            )}
            <label className="absolute bottom-3 right-3 cursor-pointer rounded-full bg-white p-2 shadow">
              <Camera className="h-4 w-4" />
              <input type="file" accept="image/*" className="hidden" onChange={(e) => setCoverFile(e.target.files?.[0] || null)} />
            </label>
            <div className="absolute -bottom-8 left-6">
              <div className="relative">
                <UserAvatar user={user} className="h-20 w-20 border-4 border-white" />
                <label className="absolute bottom-0 right-0 cursor-pointer rounded-full bg-primary p-1.5 text-white">
                  <Camera className="h-3 w-3" />
                  <input type="file" accept="image/*" className="hidden" onChange={(e) => setProfileFile(e.target.files?.[0] || null)} />
                </label>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="mt-10 space-y-4">
          <form onSubmit={handleSubmit((d) => mutation.mutate(d))} className="space-y-4">
            <div>
              <Label htmlFor="fullname">Full name</Label>
              <Input id="fullname" {...register("fullname")} className="mt-1 rounded-xl" />
            </div>
            <div>
              <Label htmlFor="username">Username</Label>
              <Input id="username" {...register("username")} className="mt-1 rounded-xl" />
            </div>
            <div>
              <Label htmlFor="bio">Bio</Label>
              <Textarea id="bio" {...register("bio")} className="mt-1" />
            </div>
            {error && <p className="text-sm text-red-500">{error}</p>}
            {success && <p className="text-sm text-green-600">{success}</p>}
            <Button type="submit" variant="gradient" disabled={mutation.isPending}>
              {mutation.isPending ? "Saving..." : "Save changes"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </section>
  );
}
