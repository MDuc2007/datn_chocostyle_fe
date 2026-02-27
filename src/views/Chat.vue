<template>
  <div class="chat-popup-inner">
    <div class="chat-header">
      <div class="header-info">
        <h4>Hỗ trợ trực tuyến</h4>
        <p class="status">
          <span class="status-dot"></span>
          {{ assignedNhanVien || "Đang kết nối..." }}
        </p>
      </div>
    </div>

    <div class="messages-box" ref="msgBox">
      <div
        v-for="msg in messages"
        :key="msg.id"
        :class="[
          'msg-wrapper',
          msg.senderId == senderId && msg.senderType == 'KHACH_HANG'
            ? 'mine'
            : 'theirs',
        ]"
      >
        <div class="msg-bubble">
          <div v-if="msg.senderType != 'KHACH_HANG'" class="sender-name">
            {{ msg.senderName }}
          </div>
          <div class="content">{{ msg.content }}</div>
          <div class="time">{{ formatTime(msg.sentAt) }}</div>
        </div>
      </div>
    </div>

    <div class="input-area">
      <div class="input-wrapper">
        <input
          v-model="newMessage"
          @keyup.enter="sendMessage"
          placeholder="Nhập nội dung tin nhắn..."
          :disabled="!senderId"
        />
        <button
          @click="sendMessage"
          :disabled="!newMessage.trim()"
          class="send-btn"
        >
          <svg viewBox="0 0 24 24" width="24" height="24">
            <path
              fill="currentColor"
              d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"
            ></path>
          </svg>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick } from "vue";
import SockJS from "sockjs-client";
import Stomp from "stompjs";
import axios from "axios";

const stompClient = ref(null);
const connected = ref(false);
const messages = ref([]);
const newMessage = ref("");
const msgBox = ref(null);
const senderId = ref(null);
const senderType = ref("KHACH_HANG");
const conversationId = ref(null);
const assignedNhanVien = ref("");

const formatTime = (time) =>
  time
    ? new Date(time).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      })
    : "";
const scrollToBottom = () =>
  nextTick(() => {
    if (msgBox.value) msgBox.value.scrollTop = msgBox.value.scrollHeight;
  });

const connectAndSubscribe = (id) => {
  const socket = new SockJS("http://localhost:8080/ws-chocostyle");
  stompClient.value = Stomp.over(socket);
  stompClient.value.debug = null;
  stompClient.value.connect({}, () => {
    connected.value = true;
    stompClient.value.subscribe(`/topic/chat/${id}`, (tick) => {
      messages.value.push(JSON.parse(tick.body));
      scrollToBottom();
    });
  });
};

onMounted(async () => {
  const user = JSON.parse(localStorage.getItem("user"));
  if (!user) return;
  senderId.value = user.id;
  try {
    const response = await axios.post(
      "http://localhost:8080/api/conversations/get-or-create",
      { khachHangId: user.id, onlyFind: true },
    );
    if (response.data) {
      conversationId.value = response.data.id;
      assignedNhanVien.value = response.data.nhanVien
        ? response.data.nhanVien.hoTen
        : "Đang chờ nhân viên tiếp nhận...";
      const history = await axios.get(
        `http://localhost:8080/api/conversations/${response.data.id}/messages`,
      );
      messages.value = history.data;
      connectAndSubscribe(response.data.id);
      scrollToBottom();
    }
  } catch (error) {
    console.log("Khách hàng mới.");
  }
});

const sendMessage = async () => {
  if (!newMessage.value.trim()) return;
  if (!conversationId.value) {
    try {
      const res = await axios.post(
        "http://localhost:8080/api/conversations/get-or-create",
        { khachHangId: senderId.value, onlyFind: false },
      );
      conversationId.value = res.data.id;
      connectAndSubscribe(res.data.id);
    } catch (e) {
      return;
    }
  }
  const attemptSend = () => {
    if (connected.value) {
      stompClient.value.send(
        "/app/chat.send",
        {},
        JSON.stringify({
          conversationId: conversationId.value,
          senderId: senderId.value,
          senderType: senderType.value,
          content: newMessage.value,
        }),
      );
      newMessage.value = "";
    } else {
      setTimeout(attemptSend, 200);
    }
  };
  attemptSend();
};
</script>

<style scoped>
.chat-popup-inner {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: #fff;
}
.chat-header {
  padding: 15px;
  background: #6b3f1e;
  color: white;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
}
.header-info h4 {
  margin: 0;
  font-size: 16px;
}
.status {
  font-size: 12px;
  margin: 4px 0 0;
  display: flex;
  align-items: center;
  opacity: 0.9;
}
.status-dot {
  width: 8px;
  height: 8px;
  background: #4caf50;
  border-radius: 50%;
  margin-right: 6px;
}

.messages-box {
  flex: 1;
  overflow-y: auto;
  padding: 15px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  background: #f9f9f9;
}
.msg-wrapper {
  display: flex;
  width: 100%;
}
.msg-wrapper.mine {
  justify-content: flex-end;
}
.msg-wrapper.theirs {
  justify-content: flex-start;
}

.msg-bubble {
  max-width: 80%;
  padding: 10px 14px;
  border-radius: 18px;
  position: relative;
  font-size: 14px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}
.mine .msg-bubble {
  background: #6b3f1e;
  color: white;
  border-bottom-right-radius: 4px;
}
.theirs .msg-bubble {
  background: #fff;
  color: #333;
  border-bottom-left-radius: 4px;
  border: 1px solid #eee;
}

.sender-name {
  font-size: 11px;
  font-weight: bold;
  margin-bottom: 4px;
  color: #6b3f1e;
}
.time {
  font-size: 10px;
  margin-top: 4px;
  opacity: 0.7;
  text-align: right;
}
.input-area {
  padding: 15px;
  background: #fff;
  border-top: 1px solid #eee;
}
.input-wrapper {
  display: flex;
  align-items: center;
  background: #f0f0f0;
  border-radius: 25px;
  padding: 4px 15px;
}
.input-wrapper input {
  flex: 1;
  background: transparent;
  border: none;
  padding: 10px 0;
  outline: none;
  font-size: 14px;
}
.send-btn {
  background: none;
  border: none;
  color: #6b3f1e;
  cursor: pointer;
  padding: 5px;
  display: flex;
}
.send-btn:disabled {
  color: #ccc;
}
</style>
