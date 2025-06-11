import {
  createDoc,
  setDoc,
  getDoc,
  doc,
  db,
  subcollectionExists,
  getDocs,
  collection,
} from "./firebase-auth.js";
import { realChat } from "./components/realChat.js";
import { createFriendInChatList } from "./components/renderFriendChatList.js";
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

export function formattedTimestamp() {
  const now = new Date();
  const formattedTimestamp = now.toLocaleString("en-US", {
    dateStyle: "long", // "June 11, 2025"
    timeStyle: "short", // "2:23 PM"
  });
  return formattedTimestamp;
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
  allChatSection,
  chatSectionEmpty,
  loadingChatList,
  chatStartingPoint
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
      if (e.key === "Enter") {
        // new chat
        if (messagesSection.querySelector(".opened-chat")) {
          renderFirstMsg(user, chatStartingPoint, sendMessageInput.value);
          let msgHandled = await handleFirstSendMessage(
            sendMessageInput,
            selectedUserId,
            user,
            userAuth,
            messagesSection,
            allChatSection,
            chatSectionEmpty,
            loadingChatList
          );

          if (msgHandled) {
            resolve(true);
            return true;
          }
        }
        // existing chat
        else {
        }
      }
    });

    sendCurrentMessageIcon.addEventListener("click", async () => {
      // new chat
      if (messagesSection.querySelector(".opened-chat")) {
        renderFirstMsg(user, chatStartingPoint, sendMessageInput.value);
        let msgHandled = await handleFirstSendMessage(
          sendMessageInput,
          selectedUserId,
          user,
          userAuth,
          messagesSection,
          allChatSection,
          chatSectionEmpty,
          loadingChatList
        );

        if (msgHandled) {
          resolve(true);
          return true;
        }
      }
      // existing chat
      else {
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
  timestamp = ""
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
  user,
  userAuth,
  messagesSection,
  allChatSection,
  chatSectionEmpty,
  loadingChatList
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
      timestamp: formattedTimestamp(),
    },
  });

  const messageId = crypto.randomUUID();
  const messageRef = doc(db, "chats", chatRef.id, "messages", messageId);

  await setDoc(messageRef, {
    messageId,
    sentFrom: currentUser,
    content: sentMessage,
    timestamp: formattedTimestamp(),
  });

  await addToTalkedWith(currentUser, selectedUserId.toLowerCase(), chatRef.id);

  realChat(user.profilePic, user.name, chatRef.id, messagesSection);

  let startPoint = document.querySelector(".chat-start-point");

  renderFirstMsg(user, startPoint, sentMessage, formattedTimestamp());

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
  userAuth,
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
    chatSectionEmpty.classList.add("hidden");
    allChatSection.classList.remove("hidden");

    const allTalkedWith = await getDocs(
      collection(
        db,
        "users",
        userAuth.currentUser.displayName.toLowerCase(),
        "talkedWith"
      )
    );

    let allTalkedWithArray = [];

    allTalkedWith.forEach(async (element) => {
      let chatId = element.data().chatId;
      let userId = element.id;

      let getUser = await getDoc(doc(db, "users", userId));
      let userName = getUser.data().name;
      let userPic = getUser.data().profilePic;

      let getUserChat = await getDoc(doc(db, "chats", chatId));
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

      allTalkedWithArray.push({ username: userName, profilePic: userPic });
    });
    loadingChatList.classList.add("hidden");
    return allTalkedWithArray;
  }
}
