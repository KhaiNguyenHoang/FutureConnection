"use client";

import { useEffect } from "react";
import { signalRService } from "@/lib/signalr";
import { useChatStore } from "@/store/useChatStore";
import ConversationSidebar from "./ConversationSidebar";
import ChatHeader from "./ChatHeader";
import MessageFeed from "./MessageFeed";
import MessageInput from "./MessageInput";
import MemberManagement from "./MemberManagement";
import { MessageDto } from "@/types/chat";

import { useAuthStore } from "@/store/authStore";

export default function ChatLayout() {
  const { 
    addMessage, 
    updateMessage, 
    removeMessage, 
    setSignalRConnected,
    isSignalRConnected,
    isMemberView 
  } = useChatStore();
  const { accessToken } = useAuthStore();

  useEffect(() => {
    if (!accessToken) return;

    const initSignalR = async () => {
      await signalRService.start(accessToken);
      setSignalRConnected(true);

      signalRService.on("ReceiveMessage", (message: MessageDto) => {
        addMessage(message);
      });

      signalRService.on("MessageUpdated", (message: MessageDto) => {
        updateMessage(message);
      });

      signalRService.on("MessageDeleted", (messageId: string) => {
        removeMessage(messageId);
      });

      // Join current group/channel if active
      const activeId = useChatStore.getState().activeGroup?.id || useChatStore.getState().activeChannel?.id;
      if (activeId) {
        signalRService.invoke("JoinGroupAsync", activeId);
      }
    };

    initSignalR();

    return () => {
      signalRService.stop();
      setSignalRConnected(false);
    };
  }, [accessToken, addMessage, updateMessage, removeMessage, setSignalRConnected]);

  // Handle joining new groups/channels when they change
  const activeGroupId = useChatStore(state => state.activeGroup?.id);
  const activeChannelId = useChatStore(state => state.activeChannel?.id);

  useEffect(() => {
    const activeId = activeGroupId || activeChannelId;
    if (activeId && isSignalRConnected) {
      signalRService.invoke("JoinGroupAsync", activeId).catch(err => {
        console.error("Failed to join SignalR group:", err);
      });
    }
  }, [activeGroupId, activeChannelId, isSignalRConnected]);

  return (
    <div className="flex-1 h-full flex bg-white overflow-hidden relative z-0">
      <ConversationSidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <ChatHeader />
        {isMemberView ? (
          <MemberManagement />
        ) : (
          <>
            <MessageFeed />
            <MessageInput />
          </>
        )}
      </div>
    </div>
  );
}
