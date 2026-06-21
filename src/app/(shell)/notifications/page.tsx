"use client";
import { useApp } from "@/lib/store";
import { formatRelativeTime, cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import PageTransition from "@/components/layout/PageTransition";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import EmptyState from "@/components/ui/EmptyState";
import { Bell, CheckCircle, XCircle, MessageSquare, Package, CreditCard, TrendingUp, Info } from "lucide-react";
import type { Notification } from "@/lib/mock-data";

function notifIcon(type: Notification["type"]) {
  const icons: Record<string, { icon: React.ElementType; bg: string; color: string }> = {
    offer_received:    { icon: MessageSquare, bg: "bg-primary-50",  color: "text-primary-600" },
    offer_accepted:    { icon: CheckCircle,   bg: "bg-secondary-50", color: "text-secondary" },
    offer_rejected:    { icon: XCircle,       bg: "bg-error-50",     color: "text-error" },
    product_approved:  { icon: CheckCircle,   bg: "bg-secondary-50", color: "text-secondary" },
    product_rejected:  { icon: XCircle,       bg: "bg-error-50",     color: "text-error" },
    payment_confirmed: { icon: CreditCard,    bg: "bg-secondary-50", color: "text-secondary" },
    qc_approved:       { icon: Package,       bg: "bg-primary-50",   color: "text-primary-600" },
    social_milestone:  { icon: TrendingUp,    bg: "bg-warning-50",   color: "text-warning-600" },
  };
  return icons[type] ?? { icon: Info, bg: "bg-bg", color: "text-ink-subtle" };
}

export default function NotificationsPage() {
  const { state, dispatch } = useApp();
  const router = useRouter();
  const notifications = state.notifications.filter((n) => n.userId === state.currentUser.id || state.currentRole === "super_admin");
  const unread = notifications.filter((n) => !n.read).length;

  function handleClick(notif: Notification) {
    dispatch({ type: "MARK_NOTIFICATION_READ", notificationId: notif.id });
    if (notif.linkTo) router.push(notif.linkTo);
  }

  return (
    <PageTransition>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-h1 text-ink">Notifications</h1>
            {unread > 0 && <p className="text-small text-ink-subtle mt-1">{unread} unread</p>}
          </div>
          {unread > 0 && <Button variant="ghost" size="sm" onClick={() => dispatch({ type: "MARK_ALL_READ" })}>Mark all as read</Button>}
        </div>

        {notifications.length === 0 ? (
          <EmptyState icon={Bell} title="No notifications yet" description="You'll be notified here about offers, approvals, payments, and more." />
        ) : (
          <Card padding="none">
            <div className="divide-y divide-primary-50">
              {notifications.map((notif) => {
                const { icon: Icon, bg, color } = notifIcon(notif.type);
                return (
                  <button key={notif.id} onClick={() => handleClick(notif)} className={cn("w-full text-left flex items-start gap-4 px-5 py-4 transition-colors", notif.read ? "hover:bg-bg" : "bg-primary-50/40 hover:bg-primary-50")}>
                    <div className={cn("w-10 h-10 rounded-full flex items-center justify-center shrink-0 mt-0.5", bg)}><Icon className={cn("w-5 h-5", color)} /></div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <p className={cn("text-small", notif.read ? "font-normal text-ink-muted" : "font-semibold text-ink")}>{notif.title}</p>
                        {!notif.read && <span className="w-2 h-2 rounded-full bg-primary shrink-0 mt-1.5" />}
                      </div>
                      <p className="text-caption text-ink-subtle mt-0.5 line-clamp-2">{notif.message}</p>
                      <p className="text-[11px] text-ink-subtle mt-1.5">{formatRelativeTime(notif.createdAt)}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </Card>
        )}
      </div>
    </PageTransition>
  );
}
