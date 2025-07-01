const modalOverlay = document.getElementById("modalOverlay");
const navbar = document.querySelector(".navbar");

function openModal() {
  modalOverlay.style.display = "flex";
  setTimeout(() => {
    modalOverlay.classList.add("show");
  }, 10);
}

function closeModal() {
  modalOverlay.classList.remove("show");
  setTimeout(() => {
    modalOverlay.style.display = "none";
  }, 200);
  navbar.style.marginTop = "0";
}

window.onclick = function (e) {
  if (e.target === modalOverlay) {
    closeModal();
  }
};

document.addEventListener("DOMContentLoaded", () => {
  const hamburger = document.getElementById("hamburger");
  const navLinks = document.getElementById("navLinks");

  hamburger.addEventListener("click", () => {
    navLinks.classList.toggle("show");
    navLinks.style.borderRadius = "30px 0 0 30px";
    hamburger.classList.toggle("opened");
  });

  const btn = document.getElementById("btn");
  if (btn) {
    btn.addEventListener("click", () => {
      window.location.href = "signup.html";
    });
  }

  const userMessage = document.getElementById("userMessage");

  if (userMessage) {
    userMessage.addEventListener("input", function () {
      this.style.height = "auto"; // reset height
      this.style.height = Math.min(this.scrollHeight, 120) + "px";
    });

    userMessage.addEventListener("keydown", function (e) {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
      }
    });
  }

  // Review form submit
  const reviewForm = document.getElementById("reviewForm");
  if (reviewForm) {
    reviewForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const name = reviewForm.querySelector("#name").value.trim();
      const grade = reviewForm.querySelector("#grade").value.trim();
      const message = reviewForm.querySelector("#message").value.trim();

      if (name && grade && message) {
        showToast("Review successfully submitted. Thank you!");
        reviewForm.reset();
      }
    });
  }

  const botHeader = document.getElementById("psepBotHeader");
  if (botHeader) {
    botHeader.addEventListener("click", () => {
      botHeader.classList.toggle("expanded");
    });
  }

  // Contact form submit with Google Apps Script
  const contactForm = document.getElementById("contactForm");

  if (contactForm) {
    contactForm.addEventListener("submit", (e) => {
      e.preventDefault();

      const name = document.getElementById("contactName").value.trim();
      const email = document.getElementById("contactEmail").value.trim();
      const message = document.getElementById("contactMessage").value.trim();

      if (!name || !email || !message) {
        showToast("Please fill out all fields before submitting.");
        return;
      }

      // Send to Render backend instead of Replit
      fetch("https://psep-backend.onrender.com/send-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: name,
          email: email,
          message: message,
        }),
      })
        .then((res) => {
          if (res.ok) {
            showToast("Message sent successfully. We'll reply shortly!");
            contactForm.reset();
          } else {
            showToast("Failed to send message. Try again.");
          }
        })
        .catch(() => {
          showToast("An error occurred. Please try again.");
        });
    });
  }
});

// Toast creation system that stacks messages
function showToast(messageText) {
  const toastContainer =
    document.getElementById("toast-container") || createToastContainer();
  const toast = document.createElement("div");
  toast.className = "toast";
  toast.innerHTML = `
    <span class="toast-message">${messageText}</span>
    <span class="toast-close">✖</span>
  `;

  const isMobile = window.innerWidth <= 768;
  const offset = isMobile ? 100 : 70;
  toast.style.marginTop = `${toastContainer.children.length * offset}px`;

  toastContainer.appendChild(toast);

  requestAnimationFrame(() => {
    toast.classList.add("show");
  });

  toast.querySelector(".toast-close").addEventListener("click", () => {
    toast.classList.remove("show");
    toast.classList.add("hide");
    setTimeout(() => {
      toast.remove();
      reflowToasts();
    }, 600);
  });

  setTimeout(() => {
    toast.classList.remove("show");
    toast.classList.add("hide");
    setTimeout(() => {
      toast.remove();
      reflowToasts();
    }, 600);
  }, 15000);
}

function reflowToasts() {
  const toastContainer = document.getElementById("toast-container");
  const isMobile = window.innerWidth <= 768;
  const spacing = isMobile ? 100 : 70;

  [...toastContainer.children].forEach((toast, index) => {
    toast.style.marginTop = `${index * spacing}px`;
  });
}

function createToastContainer() {
  const container = document.createElement("div");
  container.id = "toast-container";
  container.style.position = "fixed";
  container.style.top = "20px";
  container.style.right = "20px";
  container.style.display = "flex";
  container.style.flexDirection = "column";
  container.style.gap = "10px";
  container.style.zIndex = 9999;
  document.body.appendChild(container);
  return container;
}

function toggleChat() {
  const chatBox = document.getElementById("chatBox");

  if (chatBox.classList.contains("show")) {
    // hide with animation
    chatBox.classList.remove("show");
    setTimeout(() => {
      chatBox.style.display = "none";
    }, 400); // match CSS transition duration
  } else {
    chatBox.style.display = "flex";
    requestAnimationFrame(() => {
      chatBox.classList.add("show");
    });
  }
}

function sendMessage() {
  const input = document.getElementById("userMessage");
  const text = input.value.trim();
  if (!text) return;

  addMessage("user", text);
  input.value = "";

  input.style.transition = "height 0.2s ease";
  input.style.height = "auto";

  // Create typing placeholder
  const typingIndicator = document.createElement("div");
  typingIndicator.classList.add("message", "bot", "typing-indicator");
  typingIndicator.innerHTML = `
    <div class="message-label">Psep AI</div>
    <div class="message-text typing-bubble">
      AI is typing<span class="dots">.</span><span class="dots">.</span><span class="dots">.</span>
    </div>
  `;
  chatMessages.appendChild(typingIndicator);
  chatMessages.scrollTop = chatMessages.scrollHeight;

  // ✅ CALL your PHP proxy to connect to GPT-4
  fetch(
    "https://d088d9a8-22ae-4c87-9cc3-af4b7959b0dd-00-27guo4y302m4r.sisko.replit.dev/chat",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: text }),
    },
  )
    .then((res) => res.json())
    .then(async (data) => {
      console.log("GPT response:", JSON.stringify(data, null, 2));
      const message = data?.choices?.[0]?.message?.content;

      if (message) {
        // Replace typingIndicator's content with actual message
        typingIndicator.innerHTML = "";

        const messageText = document.createElement("div");
        messageText.classList.add("message-text");
        messageText.textContent = message.trim();

        const timestamp = document.createElement("div");
        timestamp.classList.add("timestamp");
        const now = new Date();
        timestamp.textContent = now.toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        });

        typingIndicator.appendChild(label);       // 👈 Add label first
        typingIndicator.appendChild(messageText); // 👈 Then message
        typingIndicator.appendChild(timestamp);   // 👈 Then timestamp
      } else {
        typingIndicator.textContent =
          "❌ OpenAI didn't return a proper message.";
      }
    });
}

function addMessage(sender, text) {
  const messageWrapper = document.createElement("div");
  messageWrapper.classList.add("message", sender);

  // ✅ Label on top of each message
  const label = document.createElement("div");
  label.classList.add("message-label");
  label.textContent = sender === "user" ? "You" : "Psep AI";
  messageWrapper.appendChild(label);

  // Message bubble
  const messageText = document.createElement("div");
  messageText.classList.add("message-text");
  messageText.innerHTML = text.replace(/\n/g, "<br>");
  messageWrapper.appendChild(messageText);

  // Optional meta (timestamp, tick)
  if (sender === "user") {
    const metaWrapper = document.createElement("div");
    metaWrapper.classList.add("meta-wrapper");

    const timestamp = document.createElement("span");
    timestamp.classList.add("timestamp");
    timestamp.textContent = new Date().toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });

    const tick = document.createElement("span");
    tick.classList.add("sent-icon");
    tick.textContent = "✓";

    metaWrapper.appendChild(timestamp);
    metaWrapper.appendChild(tick);
    messageWrapper.appendChild(metaWrapper);
  }

  const chatMessages = document.getElementById("chatMessages");
  chatMessages.appendChild(messageWrapper);

  // ✅ Smooth scroll to bottom
  chatMessages.scrollTo({
    top: chatMessages.scrollHeight,
    behavior: "smooth"
  });
}
