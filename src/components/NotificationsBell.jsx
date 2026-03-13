"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { Bell, RefreshCw, CheckCheck } from "lucide-react";
import { createPortal } from "react-dom";
import { getSupabaseBrowser } from "@/lib/supabaseBrowser";

function cx(...classes) {
  return classes.filter(Boolean).join(" ");
}

function timeAgo(ts) {
  if (!ts) return "";
  const d = new Date(ts);
  const ms = Date.now() - d.getTime();
  if (Number.isNaN(ms)) return "";
  const s = Math.floor(ms / 1000);
  if (s < 60) return "hace unos segundos";
  const m = Math.floor(s / 60);
  if (m < 60) return `hace ${m} min`;
  const h = Math.floor(m / 60);
  if (h < 24) return `hace ${h} h`;
  const days = Math.floor(h / 24);
  return `hace ${days} d`;
}

function SkeletonRow() {
  return (
    <div className="border-b border-gray-100 p-4">
      <div className="h-4 w-40 animate-pulse rounded bg-gray-200" />
      <div className="mt-2 h-3 w-64 animate-pulse rounded bg-gray-100" />
      <div className="mt-3 h-3 w-24 animate-pulse rounded bg-gray-100" />
    </div>
  );
}

export default function NotificationsBell({ className = "" }) {
  const [open, setOpen] = useState(false);
  const [unread, setUnread] = useState(0);
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [pos, setPos] = useState({ top: 0, left: 0, width: 360 });

  const rootRef = useRef(null);
  const btnRef = useRef(null);
  const panelRef = useRef(null);
  const loadingRef = useRef(false);
  const audioRef = useRef(null);

  const hasUnread = unread > 0;

  const setUnreadSafe = useCallback((next) => {
    const n = Number(next || 0);
    setUnread((prev) => (prev === n ? prev : n));
  }, []);

  const loadBadge = useCallback(async () => {
    try {
      const r = await fetch("/api/notifications?mode=badge", { cache: "no-store" });
      const j = await r.json().catch(() => ({}));
      if (r.ok) setUnreadSafe(j.unread);
    } catch {}
  }, [setUnreadSafe]);

  const loadList = useCallback(async () => {
    if (loadingRef.current) return;

    loadingRef.current = true;
    setLoading(true);

    try {
      const r = await fetch("/api/notifications?limit=25", { cache: "no-store" });
      const j = await r.json().catch(() => ({}));
      if (r.ok) {
        setRows(Array.isArray(j.data) ? j.data : []);
        setUnreadSafe(j.unread);
      }
    } catch {
    } finally {
      loadingRef.current = false;
      setLoading(false);
    }
  }, [setUnreadSafe]);

  const playSound = useCallback(() => {
    try {
      if (!audioRef.current) return;
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(() => {});
    } catch {}
  }, []);

  const markRead = useCallback(async (id) => {
    setRows((prev) => prev.map((n) => (n.id === id ? { ...n, is_read: true } : n)));
    setUnread((u) => Math.max(0, u - 1));

    await fetch(`/api/notifications/${encodeURIComponent(id)}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ is_read: true }),
    }).catch(() => {});
  }, []);

  const markAllRead = useCallback(async () => {
    setRows((prev) => {
      if (!prev.some((n) => !n.is_read)) return prev;
      return prev.map((n) => ({ ...n, is_read: true }));
    });
    setUnreadSafe(0);

    await fetch("/api/notifications/mark-all", {
      method: "PATCH",
      headers: { "content-type": "application/json" },
    }).catch(() => {});
  }, [setUnreadSafe]);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    loadBadge().catch(() => {});
  }, [loadBadge]);

  const computePosition = useCallback(() => {
    const el = btnRef.current;
    if (!el) return;

    const rect = el.getBoundingClientRect();
    const vw = window.innerWidth;
    const desired = vw < 420 ? Math.min(340, vw - 24) : 360;

    let left = rect.right + 12;
    if (left + desired > vw - 12) left = Math.max(12, vw - desired - 12);

    let top = rect.top;
    top = Math.max(12, Math.min(top, window.innerHeight - 12));

    setPos((p) => {
      if (p.top === top && p.left === left && p.width === desired) return p;
      return { top, left, width: desired };
    });
  }, []);

  useEffect(() => {
    if (!open) return;

    computePosition();

    const onScroll = () => computePosition();
    const onResize = () => computePosition();

    window.addEventListener("scroll", onScroll, true);
    window.addEventListener("resize", onResize);

    return () => {
      window.removeEventListener("scroll", onScroll, true);
      window.removeEventListener("resize", onResize);
    };
  }, [open, computePosition]);

  useEffect(() => {
    function onDoc(e) {
      const root = rootRef.current;
      const panel = panelRef.current;
      if (root && root.contains(e.target)) return;
      if (panel && panel.contains(e.target)) return;
      setOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  useEffect(() => {
    function onKey(e) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    if (!open) return;
    loadList().catch(() => {});
  }, [open, loadList]);

  // Realtime
  useEffect(() => {
    const supabase = getSupabaseBrowser();

    let active = true;
    let myUserId = null;

    const init = async () => {
      const { data } = await supabase.auth.getUser();
      myUserId = data?.user?.id;
      if (!myUserId || !active) return;

      const channel = supabase
        .channel(`notifications:${myUserId}`)
        .on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "notifications",
            filter: `recipient_user_id=eq.${myUserId}`,
          },
          (payload) => {
            const n = payload.new;
            if (!n) return;

            setRows((prev) => {
              const exists = prev.some((x) => x.id === n.id);
              if (exists) return prev;
              return [n, ...prev].slice(0, 25);
            });

            if (!n.is_read) {
              setUnread((u) => u + 1);
              playSound();
            }
          }
        )
        .on(
          "postgres_changes",
          {
            event: "UPDATE",
            schema: "public",
            table: "notifications",
            filter: `recipient_user_id=eq.${myUserId}`,
          },
          (payload) => {
            const n = payload.new;
            if (!n) return;

            setRows((prev) => prev.map((x) => (x.id === n.id ? { ...x, ...n } : x)));
            loadBadge().catch(() => {});
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    };

    let cleanup;
    init().then((fn) => {
      cleanup = fn;
    });

    return () => {
      active = false;
      if (cleanup) cleanup();
    };
  }, [loadBadge, playSound]);

  // Polling suave de respaldo
  useEffect(() => {
    if (open) return;

    const tick = async () => {
      if (document.visibilityState !== "visible") return;
      await loadBadge().catch(() => {});
    };

    tick();
    const t = setInterval(tick, 30000);

    return () => clearInterval(t);
  }, [open, loadBadge]);

  useEffect(() => {
    const onVis = () => {
      if (document.visibilityState === "visible") loadBadge().catch(() => {});
    };
    const onFocus = () => loadBadge().catch(() => {});

    document.addEventListener("visibilitychange", onVis);
    window.addEventListener("focus", onFocus);

    return () => {
      document.removeEventListener("visibilitychange", onVis);
      window.removeEventListener("focus", onFocus);
    };
  }, [loadBadge]);

  const visibleRows = useMemo(() => rows.slice(0, 25), [rows]);

  const dropdown = open ? (
    <div
      ref={panelRef}
      className="fixed z-[9999] overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl"
      style={{ top: pos.top, left: pos.left, width: pos.width }}
    >
      <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3">
        <div className="min-w-0">
          <div className="text-sm font-semibold text-gray-900">Notificaciones</div>
          <div className="text-[11px] text-gray-500">
            {hasUnread ? `${unread} sin leer` : "Todo al día"}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={loadList}
            className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50"
            type="button"
          >
            <RefreshCw className={cx("h-4 w-4", loading && "animate-spin")} />
            {loading ? "Cargando" : "Recargar"}
          </button>

          <button
            onClick={markAllRead}
            disabled={!rows.some((n) => !n.is_read)}
            className="inline-flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold text-white disabled:opacity-50"
            style={{ background: "#31572c" }}
            type="button"
          >
            <CheckCheck className="h-4 w-4" />
            Listo
          </button>
        </div>
      </div>

      <div className="max-h-[420px] overflow-auto">
        {loading && rows.length === 0 ? (
          <>
            <SkeletonRow />
            <SkeletonRow />
            <SkeletonRow />
          </>
        ) : visibleRows.length === 0 ? (
          <div className="p-5 text-sm text-gray-600">No hay notificaciones.</div>
        ) : (
          visibleRows.map((n) => {
            const isUnread = !n.is_read;
            return (
              <div
                key={n.id}
                className={cx(
                  "border-b border-gray-100 p-4 transition",
                  isUnread ? "bg-gray-50" : "bg-white",
                  "hover:bg-gray-50"
                )}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      {isUnread && <span className="mt-1 h-2 w-2 rounded-full bg-red-600" />}
                      <div className="truncate text-sm font-semibold text-gray-900">{n.title}</div>
                    </div>

                    {n.body && <div className="mt-1 text-xs text-gray-600 line-clamp-2">{n.body}</div>}
                    <div className="mt-2 text-[11px] text-gray-500">{timeAgo(n.created_at)}</div>
                  </div>

                  <div className="shrink-0">
                    {n.url ? (
                      <Link
                        href={n.url}
                        onClick={() => {
                          if (!n.is_read) markRead(n.id);
                          setOpen(false);
                        }}
                        className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-semibold text-gray-800 hover:bg-gray-50"
                      >
                        Ver
                      </Link>
                    ) : (
                      <button
                        onClick={() => !n.is_read && markRead(n.id)}
                        className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-semibold text-gray-800 hover:bg-gray-50"
                        type="button"
                      >
                        Marcar
                      </button>
                    )}
                  </div>
                </div>

                {!n.is_read && (
                  <div className="mt-3">
                    <button
                      onClick={() => markRead(n.id)}
                      className="text-xs font-semibold text-gray-700 hover:underline"
                      type="button"
                    >
                      Marcar como leída
                    </button>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      <div className="flex items-center justify-between border-t border-gray-100 px-4 py-3">
        <div className="text-[11px] text-gray-500">
          Mostrando {Math.min(visibleRows.length, 25)} de {rows.length}
        </div>
        <button
          onClick={() => setOpen(false)}
          className="text-xs font-semibold text-gray-700 hover:underline"
          type="button"
        >
          Cerrar
        </button>
      </div>
    </div>
  ) : null;

  return (
    <div ref={rootRef} className={cx("relative", className)}>
      <audio ref={audioRef} preload="auto" src="/sounds/notification.mp3" />

      <button
        ref={btnRef}
        onClick={() => setOpen((v) => !v)}
        className={cx(
          "relative rounded-xl border bg-white p-2 transition",
          "border-gray-200 hover:bg-gray-50 active:scale-[0.99]",
          open && "ring-2 ring-gray-200"
        )}
        aria-label="Notificaciones"
        type="button"
      >
        <Bell className="h-5 w-5 text-gray-900" />
        {hasUnread && (
          <span className="absolute -right-1 -top-1 grid h-5 min-w-[20px] place-items-center rounded-full bg-red-600 px-1 text-[11px] font-extrabold text-white shadow">
            {unread > 99 ? "99+" : unread}
          </span>
        )}
      </button>

      {mounted && dropdown ? createPortal(dropdown, document.body) : null}
    </div>
  );
}