<template>
  <div class="staff-chat-container">
    <aside class="chat-sidebar">
      <div class="sidebar-header">
        <h3>Inbox Hỗ Trợ</h3>
      </div>
      <div class="conversation-list">
        <div
          v-for="conv in conversations"
          :key="conv.id"
          :class="[
            'conversation-item',
            {
              active: currentConversation?.id === conv.id,
              'is-waiting': !conv.nhanVien,
            },
          ]"
          @click="selectConversation(conv)"
        >
          <div class="avatar-circle">
            {{ conv.khachHang.tenKhachHang.charAt(0) }}
          </div>
          <div class="conv-info">
            <div class="name-box">
              <span class="customer-name">{{
                conv.khachHang.tenKhachHang
              }}</span>
              <span v-if="!conv.nhanVien" class="badge-new">Mới</span>
            </div>
            <p class="last-msg">
              {{ conv.nhanVien ? "Đang nhắn tin..." : "Chờ tiếp nhận" }}
            </p>
          </div>
        </div>
      </div>
    </aside>

    <main class="chat-window">
      <template v-if="currentConversation">
        <header class="chat-window-header">
          <div class="customer-profile">
            <div class="header-avatar">
              {{ currentConversation.khachHang.tenKhachHang.charAt(0) }}
            </div>
            <div class="header-text">
              <h4>{{ currentConversation.khachHang.tenKhachHang }}</h4>
              <span>Khách hàng trực tuyến</span>
            </div>
          </div>
        </header>

        <div class="messages-display" ref="msgBox">
          <div
            v-for="msg in messages"
            :key="msg.id"
            :class="[
              'message-row',
              msg.senderType === 'NHAN_VIEN' ? 'mine' : 'theirs',
            ]"
          >
            <div class="message-bubble">
              <div class="content">{{ msg.content }}</div>
              <div class="msg-time">{{ formatTime(msg.sentAt) }}</div>
            </div>
          </div>
        </div>

        <div class="chat-input-area">
          <div class="input-container">
            <input
              v-model="newMessage"
              @keyup.enter="sendChatMessage"
              placeholder="Nhập câu trả lời cho khách hàng..."
            />
            <button
              @click="sendChatMessage"
              :disabled="!newMessage.trim()"
              class="staff-send-btn"
            >
              Gửi tin nhắn
            </button>
          </div>
        </div>
      </template>
      <div v-else class="no-selection">
        <div class="empty-icon">💬</div>
        <h3>Chưa chọn hội thoại</h3>
        <p>Chọn một khách hàng bên trái để bắt đầu hỗ trợ giải đáp thắc mắc.</p>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick } from "vue";
import SockJS from "sockjs-client";
import { Client } from "@stomp/stompjs";
import axios from "axios";

const conversations = ref([]);
const currentConversation = ref(null);
const messages = ref([]);
const newMessage = ref("");
const msgBox = ref(null);
const stompClient = ref(null);
const staff = JSON.parse(localStorage.getItem("user") || "{}");

const formatTime = (t) =>
  t
    ? new Date(t).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    : "";
const scrollToBottom = () =>
  nextTick(() => {
    if (msgBox.value) msgBox.value.scrollTop = msgBox.value.scrollHeight;
  });

const loadConversations = async () => {
  try {
    const waitingRes = await axios.get(
      `http://localhost:8080/api/conversations/waiting-list`,
    );
    const myChatsRes = await axios.get(
      `http://localhost:8080/api/conversations/staff/${staff.id}`,
    );
    conversations.value = [...waitingRes.data, ...myChatsRes.data];
  } catch (e) {
    console.error(e);
  }
};

const selectConversation = async (conv) => {
  try {
    if (!conv.nhanVien) {
      const res = await axios.put(
        `http://localhost:8080/api/conversations/${conv.id}/assign`,
        { staffId: staff.id },
      );
      currentConversation.value = res.data;
      loadConversations();
    } else {
      currentConversation.value = conv;
    }
    const msgRes = await axios.get(
      `http://localhost:8080/api/conversations/${currentConversation.value.id}/messages`,
    );
    messages.value = msgRes.data;
    subscribeToTopic(currentConversation.value.id);
    scrollToBottom();
  } catch (error) {
    alert("Lỗi: " + error);
    loadConversations();
  }
};

const subscribeToTopic = (id) => {
  if (!stompClient.value) return;

  stompClient.value.subscribe(`/topic/chat/${id}`, (message) => {
    const msg = JSON.parse(message.body);

    if (currentConversation.value?.id === msg.conversationId) {
      messages.value.push(msg);
      scrollToBottom();
    }
  });
};

const sendChatMessage = () => {
  if (
    newMessage.value.trim() &&
    stompClient.value &&
    currentConversation.value
  ) {
    stompClient.value.publish({
      destination: "/app/chat.send",
      body: JSON.stringify({
        conversationId: currentConversation.value.id,
        senderId: staff.id,
        senderType: "NHAN_VIEN",
        content: newMessage.value,
      }),
    });

    newMessage.value = "";
  }
};

onMounted(() => {
  loadConversations();

  const client = new Client({
    webSocketFactory: () =>
      new SockJS("http://localhost:8080/ws-chocostyle"),

    reconnectDelay: 5000, // tự reconnect nếu mất kết nối

    debug: () => {},

    onConnect: () => {
      console.log("STOMP Connected");

      client.subscribe("/topic/chat/reload-waiting", () =>
        loadConversations(),
      );

      client.subscribe("/topic/chat/new-waiting", () =>
        loadConversations(),
      );
    },
  });

  client.activate();
  stompClient.value = client;
});
</script>

<style scoped>
.staff-chat-container {
  display: flex;
  height: calc(100vh - 100px);
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 5px 25px rgba(0, 0, 0, 0.1);
  margin: 10px;
  overflow: hidden;
}

/* SIDEBAR */
.chat-sidebar {
  width: 320px;
  border-right: 1px solid #f0f0f0;
  background: #fff;
  display: flex;
  flex-direction: column;
}
.sidebar-header {
  padding: 25px 20px;
  border-bottom: 1px solid #f0f0f0;
}
.sidebar-header h3 {
  margin: 0;
  color: #6b3f23;
  font-size: 18px;
}
.conversation-list {
  flex: 1;
  overflow-y: auto;
}
.conversation-item {
  display: flex;
  padding: 15px 20px;
  gap: 15px;
  cursor: pointer;
  transition: 0.3s;
  border-bottom: 1px solid #f9f9f9;
  align-items: center;
}
.conversation-item:hover {
  background: #fdf8f4;
}
.conversation-item.active {
  background: #fdf8f4;
  border-right: 4px solid #6b3f23;
}
.is-waiting {
  background: #fff9f0;
}

.avatar-circle {
  width: 48px;
  height: 48px;
  background: #6b3f23;
  color: #fff;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 18px;
}
.name-box {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 4px;
}
.customer-name {
  font-weight: 600;
  color: #333;
}
.badge-new {
  background: #ff9800;
  color: white;
  font-size: 10px;
  padding: 2px 8px;
  border-radius: 10px;
  font-weight: bold;
}
.last-msg {
  font-size: 13px;
  color: #888;
  margin: 0;
}

/* MAIN WINDOW */
.chat-window {
  flex: 1;
  display: flex;
  flex-direction: column;
  background: #fcfcfc;
}
.chat-window-header {
  padding: 15px 30px;
  background: #fff;
  border-bottom: 1px solid #f0f0f0;
}
.customer-profile {
  display: flex;
  align-items: center;
  gap: 15px;
}
.header-avatar {
  width: 40px;
  height: 40px;
  background: #eee;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
}
.header-text h4 {
  margin: 0;
  color: #333;
}
.header-text span {
  font-size: 12px;
  color: #4caf50;
}

.messages-display {
  flex: 1;
  padding: 30px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 20px;
}
.message-row {
  display: flex;
  width: 100%;
}
.message-row.mine {
  justify-content: flex-end;
}
.message-row.theirs {
  justify-content: flex-start;
}

.message-bubble {
  max-width: 60%;
  padding: 12px 18px;
  border-radius: 18px;
  font-size: 15px;
  line-height: 1.5;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.03);
}
.mine .message-bubble {
  background: #6b3f23;
  color: white;
  border-bottom-right-radius: 4px;
}
.theirs .message-bubble {
  background: #fff;
  color: #333;
  border-bottom-left-radius: 4px;
  border: 1px solid #eee;
}
.msg-time {
  font-size: 11px;
  margin-top: 6px;
  opacity: 0.7;
}

.chat-input-area {
  padding: 25px 30px;
  background: #fff;
  border-top: 1px solid #f0f0f0;
}
.input-container {
  display: flex;
  gap: 15px;
  align-items: center;
}
.input-container input {
  flex: 1;
  border: 1px solid #ddd;
  border-radius: 30px;
  padding: 14px 25px;
  outline: none;
  transition: 0.3s;
}
.input-container input:focus {
  border-color: #6b3f23;
  box-shadow: 0 0 0 3px rgba(107, 63, 30, 0.1);
}
.staff-send-btn {
  background: #6b3f23;
  color: white;
  border: none;
  padding: 14px 30px;
  border-radius: 30px;
  font-weight: bold;
  cursor: pointer;
  transition: 0.3s;
}
.staff-send-btn:hover {
  background: #5a3419;
}

.no-selection {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #aaa;
  text-align: center;
}
.empty-icon {
  font-size: 60px;
  margin-bottom: 20px;
}
</style>
