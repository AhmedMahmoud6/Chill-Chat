import {
  createDoc,
  setDoc,
  getDoc,
  doc,
  db,
  subcollectionExists,
  getDocs,
  collection,
  updateDocument,
  updateDoc,
  serverTimestamp,
  query,
  orderBy,
  onSnapshot,
  where,
  ref,
  onDisconnect,
  set,
  rtdb,
} from "./firebase-auth.js";
import { createFriendInChatList } from "./components/renderFriendChatList.js";
import {
  friendMessageContainer,
  continuousFriendMessage,
  firstFriendMessage,
} from "./components/friendMessage.js";
import {
  yourMessageContainer,
  continuousYourMessage,
  firstYourMessage,
} from "./components/yourMessage.js";

export function isValidFullName(name) {
  const regex = /^[A-Za-z][A-Za-z0-9\s'-@_.!$%*#&()]*$/;
  return regex.test(name.trim());
}

export function isValidEmail(email) {
  const regex = /^[\w.-]+@[a-zA-Z\d.-]+\.[a-zA-Z]{2,}$/;
  return regex.test(email);
}

export function isValidPassword(password) {
  const regex = /^.{6,13}$/;
  return regex.test(password);
}

export function checkPasswordLength(password) {
  const minLength = 6;
  const maxLength = 13;

  if (password.length < minLength) {
    return "Minimum 6 characters required.";
  } else if (password.length > maxLength) {
    return "Maximum 13 characters allowed.";
  } else {
    return "Password length is valid.";
  }
}

export function validateFields(
  isValidField,
  fieldName,
  fieldNameError,
  errMsg = "Invalid Field"
) {
  // if not valid full name
  if (!isValidField(fieldName.value)) {
    fieldName.classList.add("outline-red-400");
    fieldNameError.textContent = errMsg;
    fieldNameError.classList.remove("hidden");
    return false;
  } else {
    fieldName.classList.remove("outline-red-400");
    fieldNameError.classList.add("hidden");
    return true;
  }
}

export async function setupMessageInputListeners(
  user,
  selectedUserId,
  userAuth,
  messagesSection,
  chatStartingPoint,
  chatId
) {
  const sendVoiceMessage = document.querySelector(".send-voice-message");
  const sendCurrentMessageIcon = document.querySelector(
    ".send-current-message"
  );
  const sendMessageInput = document.querySelector(".send-message-input");

  if (!sendMessageInput) return;

  sendMessageInput.addEventListener("input", (e) => {
    const isEmpty = e.target.value === "";
    toggleSendIcons(sendVoiceMessage, sendCurrentMessageIcon, isEmpty);
  });

  return new Promise((resolve) => {
    sendMessageInput.addEventListener("keydown", async (e) => {
      if (e.key === "Enter" && sendMessageInput.value.trim() !== "") {
        const sentMsg = sendMessageInput.value;
        // new chat
        if (messagesSection.querySelector(".opened-chat")) {
          renderFirstMsg(
            user,
            chatStartingPoint,
            sendMessageInput.value,
            "sending"
          );
          let msgHandled = await handleFirstSendMessage(
            sendMessageInput,
            selectedUserId,
            userAuth
          );

          if (msgHandled) {
            resolve(
              messagesSection.querySelector(".opened-chat").dataset.userid
            );
            return true;
          }
        }
        // existing chat
        else {
          renderDummyChatMsg(
            sentMsg,
            userAuth.currentUser.displayName.toLowerCase(),
            userAuth,
            chatStartingPoint
          );
          scrollToBottom();
          await handleContinuousSendMessage(sendMessageInput, userAuth, chatId);
          resolve(true);
        }
      }
    });
    sendCurrentMessageIcon.addEventListener("click", async () => {
      if (sendMessageInput.value.trim() === "") return;
      const sentMsg = sendMessageInput.value;
      // new chat
      if (messagesSection.querySelector(".opened-chat")) {
        renderFirstMsg(
          user,
          chatStartingPoint,
          sendMessageInput.value,
          "sending"
        );
        let msgHandled = await handleFirstSendMessage(
          sendMessageInput,
          selectedUserId,
          userAuth
        );

        if (msgHandled) {
          resolve(messagesSection.querySelector(".opened-chat").dataset.userid);
          return true;
        }
      }
      // existing chat
      else {
        renderDummyChatMsg(
          sentMsg,
          userAuth.currentUser.displayName.toLowerCase(),
          userAuth,
          chatStartingPoint
        );
        scrollToBottom();
        await handleContinuousSendMessage(sendMessageInput, userAuth, chatId);
        resolve(true);
      }
    });
  });
}

export function toggleSendIcons(voiceIcon, sendIcon, showVoice) {
  voiceIcon.classList.toggle("hidden", !showVoice);
  sendIcon.classList.toggle("hidden", showVoice);
}

export function renderFirstMsg(
  user,
  chatStartingPoint,
  sendMessageInput,
  timestamp = "sending"
) {
  yourMessageContainer(user.profilePic, chatStartingPoint);
  firstYourMessage(
    sendMessageInput,
    timestamp,
    document.querySelector(".your-msg-container")
  );
}

export async function handleFirstSendMessage(
  inputEl,
  selectedUserId,
  userAuth
) {
  const sentMessage = inputEl.value.trim();
  if (!sentMessage) return;

  inputEl.value = "";

  const currentUser = userAuth.currentUser.displayName.toLowerCase();
  const chatRef = await createDoc("chats", {
    isGroup: false,
    participants: [currentUser, selectedUserId.toLowerCase()],
    lastMessage: {
      content: sentMessage,
      timestamp: serverTimestamp(),
    },
  });

  const messageId = crypto.randomUUID();
  const messageRef = doc(db, "chats", chatRef.id, "messages", messageId);

  await setDoc(messageRef, {
    messageId,
    sentFrom: currentUser,
    content: sentMessage,
    timestamp: serverTimestamp(),
  });

  await addToTalkedWith(currentUser, selectedUserId.toLowerCase(), chatRef.id);

  return true;
}

export async function handleContinuousSendMessage(inputEl, userAuth, chatId) {
  const sentMessage = inputEl.value.trim();
  if (!sentMessage) return;

  inputEl.value = "";

  const currentUser = userAuth.currentUser.displayName.toLowerCase();

  const messageId = crypto.randomUUID();
  const messageRef = doc(db, "chats", chatId, "messages", messageId);

  await setDoc(messageRef, {
    messageId,
    sentFrom: currentUser,
    content: sentMessage,
    timestamp: serverTimestamp(),
  });

  await updateDocument("chats", chatId, {
    lastMessage: {
      content: sentMessage,
      timestamp: serverTimestamp(),
    },
  });

  return true;
}

export async function addToTalkedWith(currentUser, otherUser, chatId) {
  const youTalkedWithRef = doc(
    db,
    "users",
    currentUser,
    "talkedWith",
    otherUser
  );
  const heTalkedWithRef = doc(
    db,
    "users",
    otherUser,
    "talkedWith",
    currentUser
  );

  await Promise.all([
    setDoc(youTalkedWithRef, { chatId }),
    setDoc(heTalkedWithRef, { chatId }),
  ]);
}

export async function updateChatList(
  userDisplayName,
  allChatSection,
  chatSectionEmpty,
  loadingChatList
) {
  const talkedWithUsers = await subcollectionExists(
    "users",
    userDisplayName,
    "talkedWith"
  );

  // if chat list is empty
  if (!talkedWithUsers) {
    allChatSection.classList.add("hidden");
    chatSectionEmpty.classList.remove("hidden");
    loadingChatList.classList.add("hidden");
  } else {
    allChatSection.innerHTML = "";
    chatSectionEmpty.classList.add("hidden");
    allChatSection.classList.remove("hidden");

    const allTalkedWith = await getDocs(
      collection(db, "users", userDisplayName.toLowerCase(), "talkedWith")
    );

    let allTalkedWithArray = [];

    allTalkedWith.forEach(async (element) => {
      let chatId = element.data().chatId;
      let userId = element.id;

      let getUser = await getDoc(doc(db, "users", userId));
      let userName = getUser.data().name;
      let userPic = getUser.data().profilePic;

      let getUserChat = await getDoc(doc(db, "chats", chatId));
      if (!getUserChat.data()) {
        loadingChatList.classList.add("hidden");
        return false;
      }
      let lastMessage = getUserChat.data().lastMessage.content;
      let timestamp = getUserChat.data().lastMessage.timestamp;

      createFriendInChatList(
        chatId,
        userId,
        userPic,
        userName,
        lastMessage,
        timestamp,
        allChatSection
      );

      allTalkedWithArray.push({ name: userName, profilePic: userPic });
    });
    loadingChatList.classList.add("hidden");
    return allTalkedWithArray;
  }
}

export function renderChatMsg(
  messageObj,
  yourUserId,
  userAuth,
  chatStartingPoint,
  selectedUser,
  currentSelectedUserId
) {
  // if the message sent by you
  if (messageObj.sentFrom === yourUserId) {
    if (document.querySelector(".friend-message-section"))
      document
        .querySelector(".friend-message-section")
        .classList.remove("friend-message-section");
    // if the last user who sent the message is not you (starting from the first of the messages)
    if (getSenderId() !== yourUserId) {
      if (document.querySelector(".dummy"))
        document.querySelector(".dummy").closest(".pb-4").remove();
      yourMessageContainer(userAuth.currentUser.photoURL, chatStartingPoint);
      firstYourMessage(
        messageObj.content,
        messageObj.timestamp || "sending",
        document.querySelector(".your-msg-container")
      );
      setSenderId(yourUserId);
    }
    // if the last user who sent the message is sent by you
    else {
      if (document.querySelector(".dummy"))
        document.querySelector(".dummy").remove();
      continuousYourMessage(
        messageObj.content,
        messageObj.timestamp || "sending",
        document.querySelector(".your-msg-container")
      );
      setSenderId(yourUserId);
    }
  }
  // if the message is not sent by you
  else {
    if (document.querySelector(".your-msg-container"))
      document
        .querySelector(".your-msg-container")
        .classList.remove("your-msg-container");
    // if the last user who sent the message is you
    if (getSenderId() !== currentSelectedUserId) {
      friendMessageContainer(
        selectedUser.profilePic,
        selectedUser.name,
        chatStartingPoint
      );
      firstFriendMessage(
        messageObj.content,
        messageObj.timestamp || "sending",
        document.querySelector(".friend-message-section")
      );
      setSenderId(currentSelectedUserId);
    }
    // if the last user who sent the message is sent by your friend
    else {
      continuousFriendMessage(
        messageObj.content,
        messageObj.timestamp || "sending",
        document.querySelector(".friend-message-section")
      );
      setSenderId(currentSelectedUserId);
    }
  }
}

export function renderDummyChatMsg(
  sentMessage,
  yourUserId,
  userAuth,
  chatStartingPoint
) {
  let realSender = getSenderId();
  // if the message sent by you
  if (yourUserId) {
    if (document.querySelector(".friend-message-section"))
      document
        .querySelector(".friend-message-section")
        .classList.remove("friend-message-section");

    // if the last user who sent the message is not you (starting from the first of the messages)
    if (getSenderId() !== yourUserId) {
      yourMessageContainer(userAuth.currentUser.photoURL, chatStartingPoint);
      firstYourMessage(
        sentMessage,
        "sending",
        document.querySelector(".your-msg-container")
      );
      setSenderId(yourUserId);
    }
    // if the last user who sent the message is sent by you
    else {
      continuousYourMessage(
        sentMessage,
        "sending",
        document.querySelector(".your-msg-container")
      );
    }
  }

  setSenderId(realSender);
}

export function getSenderId() {
  return JSON.parse(sessionStorage.getItem("lastSenderId")) || "";
}

export function setSenderId(value) {
  sessionStorage.setItem("lastSenderId", JSON.stringify(value));
}

export function listenToNewMessages(
  chatId,
  renderSingleMessage,
  yourUserId,
  userAuth,
  chatStartingPoint,
  selectedUser,
  currentSelectedUserId
) {
  const messagesRef = collection(db, "chats", chatId, "messages");
  const q = query(messagesRef, orderBy("timestamp", "asc"));
  let isFirstLoad = true;

  const unsubscribe = onSnapshot(q, (snapshot) => {
    snapshot.docChanges().forEach((change) => {
      const messageData = change.doc.data();

      if (!messageData.timestamp) return;

      const message = {
        id: change.doc.id,
        ...change.doc.data(),
      };
      if (isFirstLoad) {
        renderSingleMessage(
          message,
          yourUserId,
          userAuth,
          chatStartingPoint,
          selectedUser,
          currentSelectedUserId
        );
      } else {
        renderSingleMessage(
          message,
          yourUserId,
          userAuth,
          chatStartingPoint,
          selectedUser,
          currentSelectedUserId
        );

        setSenderId(message.sentFrom);
      }

      setTimeout(() => {
        scrollToBottom();
      }, 1);
    });

    isFirstLoad = false;
  });

  return unsubscribe;
}

export function listenToTalkedWith(
  yourUserId,
  allChatSection,
  chatSectionEmpty,
  loadingChatList,
  onUpdate
) {
  const talkedWithRef = collection(db, "users", yourUserId, "talkedWith");
  const q = query(talkedWithRef);

  const unsubscribe = onSnapshot(q, async () => {
    const talkedWithUsers = await updateChatList(
      yourUserId,
      allChatSection,
      chatSectionEmpty,
      loadingChatList
    );

    onUpdate(talkedWithUsers);
  });

  return unsubscribe;
}

export function listenToLastMsg(yourUserId, updateUi) {
  const chatsRef = collection(db, "chats");
  const q = query(
    chatsRef,
    where("participants", "array-contains", yourUserId)
  );

  const unsubscribe = onSnapshot(q, async (snapshot) => {
    snapshot.docChanges().forEach((change) => {
      if (["added", "modified"].includes(change.type)) {
        const chat = change.doc.data();

        if (!chat.lastMessage.timestamp) return;

        const chatId = change.doc.id;

        if (chat.lastMessage) {
          const updateDetails = {
            chatId,
            ...chat.lastMessage,
          };
          updateUi(updateDetails);
        }
      }
    });
  });

  return unsubscribe;
}

export function listenToTalkingWithStatus(selectedUserId, callback) {
  const userDocRef = doc(db, "users", selectedUserId);

  const unsubscribe = onSnapshot(userDocRef, async (docSnapShot) => {
    if (docSnapShot.exists()) {
      console.log("test");
      const data = docSnapShot.data();
      callback(
        data.status,
        data.lastSeen,
        document.querySelector(".contact-status")
      );
    }
  });

  return unsubscribe;
}

export function handleUserStatus(status, lastSeen, statusElement) {
  if (status === "online") {
    statusElement.textContent = "Online";
  } else {
    const lastSeenDate = lastSeen?.toDate?.();
    statusElement.textContent = `Last seen: ${lastSeenDate?.toLocaleString()}`;
  }
}

export function scrollToBottom() {
  const messagesContainer = document.querySelector(".chat");
  if (messagesContainer) {
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  }
}

export const waitForFriend = async (userid, chatid) => {
  return new Promise((resolve) => {
    const interval = setInterval(() => {
      const firstFriendUserId = document.querySelector(
        `.friend[data-userid="${userid.toLowerCase()}"]`
      );
      const firstFriendChatId = document.querySelector(
        `.friend[data-chatid="${chatid}"]`
      );

      if (firstFriendUserId) {
        clearInterval(interval);
        resolve(firstFriendUserId);
      }
      if (firstFriendChatId) {
        clearInterval(interval);
        resolve(firstFriendChatId);
      }
    }, 100);

    // Optional: stop after 1s
    setTimeout(() => {
      clearInterval(interval);
      resolve(null);
    }, 2000);
  });
};

export function triggerChatMobileView(chatsSection, sideSection) {
  let backBtn = document.querySelector(".back");
  if (window.innerWidth <= 875) {
    chatsSection.classList.replace("translate-x-[0vw]", "translate-x-[-130vw]");
    sideSection.classList.replace("translate-x-[0vw]", "translate-x-[-130vw]");

    if (backBtn) {
      backBtn.classList.remove("hidden");
    }

    backBtn.addEventListener("click", () => {
      chatsSection.classList.replace(
        "translate-x-[-130vw]",
        "translate-x-[0vw]"
      );
      sideSection.classList.replace(
        "translate-x-[-130vw]",
        "translate-x-[0vw]"
      );
    });
  }
}

export async function setUserOnline(userId) {
  const userRef = doc(db, "users", userId);
  await updateDoc(userRef, {
    status: "online",
    lastSeen: serverTimestamp(),
  });
}

export function setupPresence(userId) {
  const userStatusDatabaseRef = ref(rtdb, `/status/${userId}`);
  const userStatusFirestoreRef = doc(db, "users", userId);

  // Values for Realtime DB
  const isOfflineForRTDB = {
    state: "offline",
    lastChanged: serverTimestamp(),
  };
  const isOnlineForRTDB = {
    state: "online",
    lastChanged: serverTimestamp(),
  };

  // Values for Firestore
  const isOfflineForFirestore = {
    status: "offline",
    lastSeen: serverTimestamp(),
  };
  const isOnlineForFirestore = {
    status: "online",
    lastSeen: serverTimestamp(),
  };

  onDisconnect(userStatusDatabaseRef).set(isOfflineForRTDB);

  // When online, update both
  set(userStatusDatabaseRef, isOnlineForRTDB);
  setDoc(userStatusFirestoreRef, isOnlineForFirestore, { merge: true });

  // Handle tab closing explicitly
  window.addEventListener("beforeunload", () => {
    setDoc(userStatusFirestoreRef, isOfflineForFirestore, { merge: true });
  });
}

export function getTime(timestamp) {
  const date = timestamp.toDate(); // Firebase Timestamp to JS Date

  let hours = date.getHours();
  const minutes = date.getMinutes();
  const ampm = hours >= 12 ? "PM" : "AM";

  hours = hours % 12;
  hours = hours ? hours : 12; // the hour '0' should be '12'

  const paddedMinutes = minutes < 10 ? "0" + minutes : minutes;

  return `${hours}:${paddedMinutes} ${ampm}`;
}
