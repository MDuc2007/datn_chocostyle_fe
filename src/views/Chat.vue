<template>
  <div class="chat-popup-inner">
    <div class="chat-header">
      <div class="header-info">
        <h4>Hỗ trợ trực tuyến</h4>
        <p class="status">
          <span class="status-dot"></span>
          {{ headerStatusText }}
        </p>
      </div>

      <button
        v-if="chatStatus === 'ACTIVE'"
        class="end-chat-btn"
        @click="endChat"
      >
        Kết thúc
      </button>
    </div>

    <div v-if="chatStatus === 'BOT'" class="request-staff-banner">
      <span>AI chưa giải quyết được vấn đề?</span>
      <button @click="requestStaff">Gặp nhân viên</button>
    </div>
    <div v-if="chatStatus === 'WAITING'" class="request-staff-banner waiting">
      <span>Đang kết nối với nhân viên hỗ trợ... Vui lòng giữ máy.</span>
      <button @click="cancelRequest">Hủy yêu cầu</button>
    </div>

    <div class="messages-box" ref="msgBox">
      <div
        v-for="msg in messages"
        :key="msg.id"
        :class="[
          'msg-wrapper',
          msg.senderType === 'AI' || msg.senderType === 'SYSTEM'
            ? 'ai'
            : msg.senderId == senderId && msg.senderType == 'KHACH_HANG'
              ? 'mine'
              : 'theirs',
        ]"
      >
        <div
          class="msg-bubble"
          :class="{ 'system-bubble': msg.senderType === 'SYSTEM' }"
        >
          <div v-if="msg.senderType != 'KHACH_HANG'" class="sender-name">
            {{ msg.senderName }}
          </div>
          <div class="content" v-html="msg.content"></div>
          <div class="time">{{ formatTime(msg.sentAt) }}</div>
        </div>
      </div>
    </div>

    <div v-if="chatStatus === 'BOT'" class="suggestions">
      <button
        v-for="(q, index) in suggestedQuestions"
        :key="index"
        class="suggestion-btn"
        @click="selectSuggestion(q)"
      >
        {{ q }}
      </button>
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
import { ref, onMounted, nextTick, computed } from "vue";
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

const assignedNhanVien = ref(null);
const chatStatus = ref("BOT"); // 'BOT', 'WAITING', 'ACTIVE'
const lastActivity = ref(Date.now());
const CHAT_TIMEOUT = 15 * 60 * 1000;
const isLoading = ref(false);

const headerStatusText = computed(() => {
  if (chatStatus.value === "BOT") return "ChocoBot đang hỗ trợ";
  if (chatStatus.value === "WAITING") return "Đang chờ nhân viên...";
  return assignedNhanVien.value || "Nhân viên đang hỗ trợ";
});

const suggestedQuestions = [
  "Shop có những sản phẩm gì?",
  "Áo khoác size L",
  "Áo khoác dưới 500k",
  "Áo khoác đang giảm giá",
  "Shop có voucher không?",
];

const selectSuggestion = (q) => {
  newMessage.value = q;
  sendMessage();
};

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

const messageSubscription = ref(null);

const connectAndSubscribe = (id) => {
  if (stompClient.value && stompClient.value.connected) {
    stompClient.value.disconnect();
  }

  const socket = new SockJS("http://localhost:8080/ws-chocostyle");
  stompClient.value = Stomp.over(socket);
  stompClient.value.debug = null;

  stompClient.value.connect({}, () => {
    connected.value = true;

    if (messageSubscription.value) messageSubscription.value.unsubscribe();

    // 🔴 Lắng nghe tin nhắn từ kênh chính
    messageSubscription.value = stompClient.value.subscribe(
      `/topic/chat/${id}`,
      (tick) => {
        const incoming = JSON.parse(tick.body);
        if (
          incoming.senderId == senderId.value &&
          incoming.senderType === "KHACH_HANG"
        )
          return;

        // Loại bỏ tin nhắn loading của AI
        messages.value = messages.value.filter(
          (m) => !String(m.id).startsWith("loading"),
        );

        // 🔴 NẾU CÓ TIN NHẮN TỪ SYSTEM (Nhân viên vừa vào)
        if (
          incoming.senderType === "SYSTEM" &&
          incoming.content.includes("đã tham gia")
        ) {
          chatStatus.value = "ACTIVE"; // Tự động đóng banner chờ
          // Trích xuất tên nhân viên từ nội dung tin nhắn để gán lên Header
          const match = incoming.content.match(/Nhân viên (.*?) đã tham gia/);
          if (match && match[1]) {
            assignedNhanVien.value = match[1];
          }
        }

        messages.value.push(incoming);
        lastActivity.value = Date.now();
        scrollToBottom();
      },
    );
  });
};

const requestStaff = async () => {
  try {
    messages.value = messages.value.filter(
      (m) => !String(m.id).startsWith("loading"),
    );

    // 1️⃣ đổi trạng thái conversation
    await axios.put(
      `http://localhost:8080/api/conversations/${conversationId.value}/request-staff`,
    );

    // 2️⃣ gửi thông báo cho staff
    await axios.post("http://localhost:8080/api/thong-bao/support-request", {
      khachHangId: senderId.value,
      conversationId: conversationId.value,
    });

    chatStatus.value = "WAITING";

    messages.value.push({
      id: Date.now(),
      senderType: "SYSTEM",
      senderName: "Hệ thống",
      content: "Đã gửi yêu cầu đến nhân viên. Vui lòng đợi trong giây lát...",
      sentAt: new Date(),
    });

    scrollToBottom();
  } catch (error) {
    console.error("Lỗi khi gọi nhân viên:", error);
  }
};

const cancelRequest = async () => {
  if (!conversationId.value) return;

  try {
    await axios.put(
      `http://localhost:8080/api/conversations/${conversationId.value}/cancel-request`
    );

    chatStatus.value = "BOT";
    assignedNhanVien.value = null;

    messages.value.push({
      id: Date.now(),
      senderType: "SYSTEM",
      senderName: "Hệ thống",
      content: "Bạn đã hủy yêu cầu hỗ trợ. ChocoBot sẽ tiếp tục hỗ trợ bạn.",
      sentAt: new Date(),
    });

    scrollToBottom();
  } catch (error) {
    console.error("Không thể hủy yêu cầu", error);
  }
};

const endChat = async () => {
  if (!conversationId.value) return;

  try {
    await axios.put(
      `http://localhost:8080/api/conversations/${conversationId.value}/end`,
    );

    messages.value.push({
      id: Date.now(),
      senderType: "SYSTEM",
      senderName: "Hệ thống",
      content: "Bạn đã kết thúc cuộc trò chuyện.",
      sentAt: new Date(),
    });

    conversationId.value = null;
    chatStatus.value = "BOT";
    assignedNhanVien.value = null;

    if (stompClient.value) {
      stompClient.value.disconnect();
      connected.value = false;
    }

    scrollToBottom();
  } catch (error) {
    console.error("Không thể kết thúc chat", error);
  }
};

const callAI = async (content) => {
  lastActivity.value = Date.now();
  if (isLoading.value) return;
  isLoading.value = true;

  messages.value.push({
    id: "loading-" + Date.now(),
    senderType: "AI",
    senderName: "ChocoBot",
    content: "Đang xử lý...",
    sentAt: new Date(),
  });
  scrollToBottom();

  try {
    const res = await axios.post("http://localhost:8080/api/chat", {
      message: content,
      conversationId: conversationId.value,
      senderId: senderId.value,
    });

    messages.value = messages.value.filter(
      (m) => !String(m.id).startsWith("loading"),
    );

    // 🔴 FIX 2: Nếu khách đã chuyển sang ĐỢI NHÂN VIÊN thì BỎ QUA tin nhắn của AI trả về
    if (chatStatus.value !== "BOT") return;

    // 🔴 Tự động chuyển nhân viên nếu AI không giải quyết được
    if (res.data.reply === "CHUYEN_NHAN_VIEN") {
      requestStaff();
      return;
    }

    messages.value.push({
      id: Date.now(),
      senderType: "AI",
      senderName: "ChocoBot",
      content: res.data.reply,
      sentAt: new Date(),
    });
    scrollToBottom();
  } catch (e) {
    messages.value = messages.value.filter(
      (m) => !String(m.id).startsWith("loading"),
    );

    // Chỉ báo lỗi nếu khách vẫn đang chat với BOT
    if (chatStatus.value === "BOT") {
      messages.value.push({
        id: Date.now(),
        senderType: "SYSTEM",
        senderName: "Hệ thống",
        content: "Hệ thống đang gặp sự cố. Vui lòng thử lại sau.",
        sentAt: new Date(),
      });
      scrollToBottom();
    }
  } finally {
    isLoading.value = false;
  }
};

onMounted(async () => {
  const user = JSON.parse(localStorage.getItem("user"));
  if (!user) return;
  senderId.value = user.id;

  try {
    const response = await axios.post(
      "http://localhost:8080/api/conversations/get-or-create",
      { khachHangId: user.id },
    );

    if (response.data) {
      conversationId.value = response.data.id;
      chatStatus.value = response.data.trangThai || "BOT";

      // 🔴 NẾU LOAD LẠI TRANG MÀ ĐÃ CÓ NHÂN VIÊN THÌ BẬT ACTIVE LUÔN
      if (response.data.nhanVien) {
        assignedNhanVien.value = response.data.nhanVien.hoTen;
        chatStatus.value = "ACTIVE";
      }

      const history = await axios.get(
        `http://localhost:8080/api/conversations/${response.data.id}/messages`,
      );
      messages.value = history.data;

      connectAndSubscribe(response.data.id);
      scrollToBottom();

      if (messages.value.length === 0) {
        messages.value.push({
          id: Date.now(),
          senderType: "AI",
          senderName: "ChocoBot",
          content:
            "Xin chào anh/chị! Em là trợ lý của ChocoStyle. Anh/chị cần tư vấn thông tin gì ạ?",
          sentAt: new Date(),
        });
      }
    }
  } catch (error) {
    console.log("Khách hàng mới hoặc chưa đăng nhập.");
  }
  setInterval(async () => {
    const now = Date.now();

    if (conversationId.value && now - lastActivity.value > CHAT_TIMEOUT) {
      try {
        await axios.put(
          `http://localhost:8080/api/conversations/${conversationId.value}/timeout`,
        );
      } catch (e) {
        console.log("Timeout API lỗi");
      }

      messages.value.push({
        id: Date.now(),
        senderType: "SYSTEM",
        senderName: "Hệ thống",
        content: "Phiên chat đã tự động kết thúc do không có tương tác.",
        sentAt: new Date(),
      });

      conversationId.value = null;
      chatStatus.value = "BOT";
      assignedNhanVien.value = null;

      if (stompClient.value) {
        stompClient.value.disconnect();
        connected.value = false;
      }

      scrollToBottom();
    }
  }, 60000);
});

const sendMessage = async () => {
  lastActivity.value = Date.now();
  if (!newMessage.value.trim() || !conversationId.value) return;

  const content = newMessage.value;
  newMessage.value = "";

  messages.value.push({
    id: Date.now() + "temp",
    senderId: senderId.value,
    senderType: senderType.value,
    senderName: "Bạn",
    content: content,
    sentAt: new Date(),
  });
  scrollToBottom();

  if (chatStatus.value === "BOT") {
    await callAI(content);
  } else {
    attemptSend(content);
  }
};

const attemptSend = (content) => {
  if (connected.value) {
    stompClient.value.send(
      "/app/chat.send",
      {},
      JSON.stringify({
        conversationId: conversationId.value,
        senderId: senderId.value,
        senderType: senderType.value,
        content: content,
      }),
    );
  } else {
    setTimeout(() => attemptSend(content), 200);
  }
};
</script>

<style scoped>
/* Giữ nguyên CSS cũ không thay đổi */
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
.request-staff-banner {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 15px;
  background: #fff3e0;
  border-bottom: 1px solid #ffe0b2;
  font-size: 13px;
  color: #d84315;
}
.request-staff-banner.waiting {
  justify-content: center;
  background: #e3f2fd;
  color: #1565c0;
  font-weight: 500;
}
.request-staff-banner button {
  background: #d84315;
  color: #fff;
  border: none;
  padding: 4px 10px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
}
.request-staff-banner button:hover {
  background: #bf360c;
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
.msg-wrapper.ai {
  justify-content: flex-start;
}
.msg-bubble {
  max-width: 80%;
  padding: 10px 14px;
  border-radius: 18px;
  position: relative;
  font-size: 14px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  white-space: pre-wrap;
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
.ai .msg-bubble {
  background: #f0e6ff;
  color: #4b0082;
  border-bottom-left-radius: 4px;
  border: 1px solid #e1bee7;
}
.system-bubble {
  background: #eeeeee !important;
  color: #757575 !important;
  border: none !important;
  font-size: 12px;
  text-align: center;
  border-radius: 8px;
  width: 100%;
  max-width: 100%;
  margin: 5px 0;
}
.system-bubble .sender-name {
  display: none;
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

.suggestions {
  display: flex;
  gap: 8px;
  padding: 8px 12px;
  border-top: 1px solid #eee;
  overflow-x: auto;
  overflow-y: hidden;
  white-space: nowrap;
  scrollbar-width: none;
  position: relative;
}

.suggestions::after {
  content: "";
  position: absolute;
  right: 0;
  top: 0;
  height: 100%;
  width: 30px;
  background: linear-gradient(to right, transparent, #fff);
  pointer-events: none;
}

.suggestions::-webkit-scrollbar {
  display: none;
}

.suggestion-btn {
  background: #f1f3f5;
  border: none;
  padding: 6px 12px;
  border-radius: 16px;
  font-size: 13px;
  cursor: pointer;
  transition: 0.2s;

  flex-shrink: 0;
}

.suggestion-btn:hover {
  background: #e0e0e0;
}

.end-chat-btn {
  background: #e53935;
  border: none;
  color: white;
  padding: 4px 10px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
}

.end-chat-btn:hover {
  background: #c62828;
}
</style>
