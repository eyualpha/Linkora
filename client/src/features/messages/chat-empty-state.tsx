import { Link } from "react-router-dom";
import { Compass, MessageCircle, Send, Sparkles, UserRoundSearch } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type ChatEmptyStateVariant = "inbox" | "welcome";

interface ChatEmptyStateProps {
  variant?: ChatEmptyStateVariant;
  className?: string;
}

const steps = [
  { icon: UserRoundSearch, label: "Find someone" },
  { icon: MessageCircle, label: "Tap Message" },
  { icon: Send, label: "Say hello" },
];

export function ChatEmptyState({ variant = "inbox", className }: ChatEmptyStateProps) {
  const isWelcome = variant === "welcome";

  return (
    <div
      className={cn(
        "relative flex flex-col items-center justify-center overflow-hidden px-6 text-center",
        isWelcome ? "py-16" : "py-12",
        className
      )}
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-60"
        aria-hidden
      >
        <div className="absolute left-1/2 top-8 h-40 w-40 -translate-x-1/2 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute bottom-6 right-8 h-24 w-24 rounded-full bg-orange-400/10 blur-2xl" />
      </div>

      <div className={cn("relative mb-6", isWelcome ? "mb-8" : "mb-5")}>
        <div
          className={cn(
            "absolute rounded-2xl border border-primary/10 bg-card/80 shadow-sm backdrop-blur-sm",
            isWelcome ? "-left-10 top-3 h-11 w-[4.5rem] rounded-bl-md" : "-left-7 top-2 h-9 w-14 rounded-bl-md"
          )}
        >
          <div className="flex h-full items-center justify-center gap-1 px-2">
            <span className="h-1.5 w-1.5 rounded-full bg-primary/40" />
            <span className="h-1.5 w-1.5 rounded-full bg-primary/25" />
            <span className="h-1.5 w-1.5 rounded-full bg-primary/15" />
          </div>
        </div>

        <div
          className={cn(
            "absolute rounded-2xl border border-rose-200/50 bg-gradient-to-br from-primary/15 to-rose-400/10 shadow-sm dark:border-primary/20",
            isWelcome ? "-right-8 bottom-1 h-10 w-[3.25rem] rounded-br-md" : "-right-6 bottom-0 h-8 w-12 rounded-br-md"
          )}
        >
          <div className="flex h-full items-center justify-end px-2.5">
            <Send className="h-3.5 w-3.5 text-primary/70" />
          </div>
        </div>

        <div
          className={cn(
            "relative flex items-center justify-center rounded-[1.75rem] bg-gradient-to-br from-primary via-rose-500 to-orange-400 shadow-xl shadow-primary/30",
            isWelcome ? "h-24 w-24" : "h-[4.5rem] w-[4.5rem]"
          )}
        >
          <MessageCircle
            className={cn("text-white drop-shadow-sm", isWelcome ? "h-11 w-11" : "h-8 w-8")}
            strokeWidth={1.75}
          />
          <Sparkles
            className={cn(
              "absolute text-amber-300 drop-shadow",
              isWelcome ? "-right-2 -top-2 h-6 w-6" : "-right-1.5 -top-1.5 h-4 w-4"
            )}
          />
        </div>
      </div>

      <h3
        className={cn(
          "relative font-bold tracking-tight text-foreground",
          isWelcome ? "text-2xl" : "text-lg"
        )}
      >
        {isWelcome ? "Start a conversation" : "No chats yet"}
      </h3>

      <p
        className={cn(
          "relative mt-2 max-w-xs leading-relaxed text-muted",
          isWelcome ? "max-w-sm text-sm" : "text-xs sm:text-sm"
        )}
      >
        {isWelcome
          ? "Pick someone you follow, send a message, and keep the conversation going right here."
          : "Your inbox is ready. Visit a profile and tap Message to begin."}
      </p>

      <div className="relative mt-6 flex w-full max-w-xs flex-col gap-2 sm:max-w-none sm:flex-row sm:justify-center">
        <Button
          asChild
          className={cn(
            "gap-2 rounded-full bg-gradient-to-r from-primary to-rose-500 shadow-md shadow-primary/25 hover:opacity-95",
            isWelcome ? "h-11 px-6" : "h-10 px-5"
          )}
        >
          <Link to="/explore">
            <Compass className="h-4 w-4" />
            Discover people
          </Link>
        </Button>
      </div>

      <div
        className={cn(
          "relative mt-8 grid w-full max-w-sm grid-cols-3 gap-2",
          isWelcome ? "max-w-md gap-3" : "max-w-xs"
        )}
      >
        {steps.map(({ icon: Icon, label }) => (
          <div
            key={label}
            className={cn(
              "flex flex-col items-center gap-2 rounded-xl border border-border/60 bg-card/50 px-2 py-3 backdrop-blur-sm",
              isWelcome && "py-4"
            )}
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
              <Icon className="h-4 w-4" />
            </div>
            <span className="text-[10px] font-medium leading-tight text-muted sm:text-xs">
              {label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
