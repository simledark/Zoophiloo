"use client";

import { useState, useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import Image from "next/image";
import { useStore } from "@/store";
import { getBrowserClient } from "@/lib/supabase/client";
import type { Message, Profile, Listing } from "@/types";
import { Send, ArrowLeft, MessageCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatDistanceToNow, format, isToday } from "date-fns";
import { fr } from "date-fns/locale";
import { APP_CONFIG } from "@/types";

interface Conversation {
  listing: Pick<Listing, "id" | "title" | "primary_photo" | "status">;
  other_user: Profile;
  last_message: Message;
  unread_count: number;
}

export function MessagesLayout() {
  const { user } = useStore();
  const searchParams = useSearchParams();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConv, setActiveConv] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [content, setContent] = useState("");
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const supabase = getBrowserClient();

  // Charger les conversations
  useEffect(() => {
    if (!user) return;
    loadConversations();
  }, [user]);

  // Ouvrir conversation depuis URL params
  useEffect(() => {
    const listingId = searchParams.get("listing");
    const userId = searchParams.get("user");
    if (listingId && userId && conversations.length > 0) {
      const conv = conversations.find(
        (c) => c.listing.id === listingId && c.other_user.id === userId
      );
      if (conv) setActiveConv(conv);
    }
  }, [searchParams, conversations]);

  // Charger messages quand conversation active change
  useEffect(() => {
    if (!activeConv || !user) return;
    loadMessages(activeConv.listing.id, activeConv.other_user.id);

    // Realtime
    const channel = supabase
      .channel(`messages:${activeConv.listing.id}:${activeConv.other_user.id}`)
      .on("postgres_changes", {
        event: "INSERT",
        schema: "public",
        table: "messages",
        filter: `listing_id=eq.${activeConv.listing.id}`,
      }, (payload) => {
        setMessages((prev) => [...prev, payload.new as Message]);
        scrollToBottom();
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [activeConv]);

  // Auto-scroll
  useEffect(() => { scrollToBottom(); }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const loadConversations = async () => {
    if (!user) return;
    setLoading(true);

    const { data } = await supabase
      .from("messages")
      .select(`
        *,
        listing:listings(id, title, primary_photo, status),
        sender:profiles!messages_sender_id_fkey(id, username, display_name, avatar_url),
        receiver:profiles!messages_receiver_id_fkey(id, username, display_name, avatar_url)
      `)
      .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
      .order("created_at", { ascending: false });

    if (!data) { setLoading(false); return; }

    // Grouper par (listing_id, other_user_id)
    const convMap = new Map<string, Conversation>();
    for (const msg of data) {
      const otherUser = msg.sender_id === user.id ? msg.receiver : msg.sender;
      if (!otherUser || !msg.listing) continue;
      const key = `${msg.listing_id}:${otherUser.id}`;
      if (!convMap.has(key)) {
        convMap.set(key, {
          listing: msg.listing as any,
          other_user: otherUser as any,
          last_message: msg as any,
          unread_count: msg.receiver_id === user.id && msg.status === "envoye" ? 1 : 0,
        });
      } else {
        const existing = convMap.get(key)!;
        if (msg.receiver_id === user.id && msg.status === "envoye") {
          existing.unread_count++;
        }
      }
    }

    setConversations(Array.from(convMap.values()));
    setLoading(false);
  };

  const loadMessages = async (listingId: string, otherUserId: string) => {
    if (!user) return;
    const { data } = await supabase
      .from("messages")
      .select("*")
      .eq("listing_id", listingId)
      .or(`and(sender_id.eq.${user.id},receiver_id.eq.${otherUserId}),and(sender_id.eq.${otherUserId},receiver_id.eq.${user.id})`)
      .order("created_at", { ascending: true });

    setMessages((data as Message[]) ?? []);

    // Marquer comme lus
    await supabase
      .from("messages")
      .update({ status: "lu" })
      .eq("listing_id", listingId)
      .eq("receiver_id", user.id)
      .eq("status", "envoye");
  };

  const sendMessage = async () => {
    if (!content.trim() || !activeConv || !user || sending) return;
    setSending(true);
    const text = content.trim();
    setContent("");

    await supabase.from("messages").insert({
      listing_id: activeConv.listing.id,
      sender_id: user.id,
      receiver_id: activeConv.other_user.id,
      content: text,
    });

    setSending(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const photoUrl = (path: string | null) =>
    path ? `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${APP_CONFIG.storageBucket}/${path}` : null;

  const formatMsgTime = (date: string) => {
    const d = new Date(date);
    return isToday(d) ? format(d, "HH:mm") : format(d, "dd/MM HH:mm");
  };

  if (!user) {
    return (
      <div className="text-center py-20">
        <MessageCircle className="w-12 h-12 text-ink/20 mx-auto mb-4" />
        <p className="font-space text-ink/40">Connectez-vous pour accéder à vos messages.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-sand overflow-hidden" style={{ height: "calc(100vh - 160px)" }}>
      <div className="flex h-full">

        {/* Liste conversations */}
        <div className={cn(
          "w-full md:w-80 border-r border-sand flex flex-col",
          activeConv ? "hidden md:flex" : "flex"
        )}>
          <div className="p-4 border-b border-sand">
            <h2 className="font-syne font-bold text-base text-ink">Messages</h2>
          </div>

          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="p-4 space-y-3">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="flex gap-3 animate-pulse">
                    <div className="w-12 h-12 rounded-full bg-sand shrink-0" />
                    <div className="flex-1 space-y-2 py-1">
                      <div className="h-3 bg-sand rounded w-3/4" />
                      <div className="h-2 bg-sand rounded w-1/2" />
                    </div>
                  </div>
                ))}
              </div>
            ) : conversations.length === 0 ? (
              <div className="p-8 text-center">
                <MessageCircle className="w-10 h-10 text-ink/20 mx-auto mb-3" />
                <p className="font-space text-sm text-ink/40">Aucune conversation</p>
              </div>
            ) : (
              conversations.map((conv) => {
                const isActive = activeConv?.listing.id === conv.listing.id && activeConv?.other_user.id === conv.other_user.id;
                const listingPhoto = photoUrl(conv.listing.primary_photo);
                return (
                  <button
                    key={`${conv.listing.id}:${conv.other_user.id}`}
                    onClick={() => setActiveConv(conv)}
                    className={cn(
                      "w-full flex items-center gap-3 p-4 border-b border-sand/50 hover:bg-warm transition-colors text-left",
                      isActive && "bg-orange/5 border-l-2 border-l-orange"
                    )}
                  >
                    {/* Photo listing */}
                    <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-warm shrink-0">
                      {listingPhoto ? (
                        <Image src={listingPhoto} alt="" fill className="object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-xl">🐾</div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-0.5">
                        <span className="font-space font-semibold text-sm text-ink truncate">
                          {conv.other_user.display_name ?? conv.other_user.username}
                        </span>
                        <span className="text-xs font-space text-ink/30 shrink-0 ml-2">
                          {formatDistanceToNow(new Date(conv.last_message.created_at), { locale: fr, addSuffix: false })}
                        </span>
                      </div>
                      <p className="font-space text-xs text-ink/40 truncate">{conv.listing.title}</p>
                      <p className="font-space text-xs text-ink/50 truncate mt-0.5">
                        {conv.last_message.sender_id === user.id ? "Vous : " : ""}
                        {conv.last_message.content}
                      </p>
                    </div>

                    {conv.unread_count > 0 && (
                      <span className="w-5 h-5 bg-orange text-white text-[10px] font-bold rounded-full flex items-center justify-center shrink-0">
                        {conv.unread_count}
                      </span>
                    )}
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Zone de conversation */}
        <div className={cn(
          "flex-1 flex flex-col",
          !activeConv ? "hidden md:flex" : "flex"
        )}>
          {activeConv ? (
            <>
              {/* Header */}
              <div className="flex items-center gap-3 p-4 border-b border-sand">
                <button
                  onClick={() => setActiveConv(null)}
                  className="md:hidden p-1.5 rounded-xl hover:bg-warm transition-colors"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>

                <div className="w-9 h-9 rounded-full bg-orange/10 flex items-center justify-center shrink-0">
                  <span className="font-space font-bold text-orange text-sm">
                    {(activeConv.other_user.display_name ?? activeConv.other_user.username ?? "U")[0].toUpperCase()}
                  </span>
                </div>

                <div>
                  <p className="font-space font-semibold text-sm text-ink">
                    {activeConv.other_user.display_name ?? activeConv.other_user.username}
                  </p>
                  <p className="font-space text-xs text-ink/40 truncate max-w-xs">
                    {activeConv.listing.title}
                  </p>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {messages.map((msg) => {
                  const isMine = msg.sender_id === user.id;
                  return (
                    <div key={msg.id} className={cn("flex", isMine ? "justify-end" : "justify-start")}>
                      <div className={cn(
                        "max-w-[75%] px-4 py-2.5 rounded-2xl font-space text-sm",
                        isMine
                          ? "bg-orange text-white rounded-br-md"
                          : "bg-warm text-ink rounded-bl-md"
                      )}>
                        <p className="leading-relaxed">{msg.content}</p>
                        <p className={cn("text-[10px] mt-1", isMine ? "text-white/60" : "text-ink/30")}>
                          {formatMsgTime(msg.created_at)}
                        </p>
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <div className="p-4 border-t border-sand">
                <div className="flex gap-2 items-end">
                  <textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Votre message..."
                    rows={1}
                    className="flex-1 input-base resize-none py-2.5 text-sm"
                    style={{ minHeight: "44px", maxHeight: "120px" }}
                  />
                  <button
                    onClick={sendMessage}
                    disabled={!content.trim() || sending}
                    className="w-11 h-11 bg-orange text-white rounded-xl flex items-center justify-center hover:bg-orange-d transition-colors disabled:opacity-40 shrink-0"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>
                <p className="font-space text-[11px] text-ink/25 mt-1.5 text-center">
                  Entrée pour envoyer · Maj+Entrée pour saut de ligne
                </p>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
              <MessageCircle className="w-14 h-14 text-ink/10 mb-4" />
              <h3 className="font-syne font-bold text-lg text-ink/30 mb-2">Vos messages</h3>
              <p className="font-space text-sm text-ink/25">
                Sélectionnez une conversation pour commencer
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
