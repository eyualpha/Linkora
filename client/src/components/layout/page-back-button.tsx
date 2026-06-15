import { ArrowLeft } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

const ROOT_PATHS = ["/"];
const NO_BACK_PATH_PREFIXES = ["/messages"];

export function PageBackButton() {
  const location = useLocation();
  const navigate = useNavigate();

  if (
    ROOT_PATHS.includes(location.pathname) ||
    NO_BACK_PATH_PREFIXES.some((prefix) => location.pathname.startsWith(prefix))
  ) {
    return null;
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      className="mb-4 -ml-2 gap-2 rounded-lg px-3 text-muted hover:text-foreground"
      onClick={() => navigate(-1)}
    >
      <ArrowLeft className="h-4 w-4" />
      Back
    </Button>
  );
}
