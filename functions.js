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
  serverTimestamp,
  query,
  orderBy,
  onSnapshot,
} from "./firebase-auth.js";
import { realChat } from "./components/realChat.js";
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

// export function formattedTimestamp() {
//   const now = new Date();
//   const formattedTimestamp = now.toLocaleString("en-US", {
//     dateStyle: "long", // "June 11, 2025"
//     timeStyle: "short", // "2:23 PM"
//   });
//   return formattedTimestamp;
// }

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
          await handleContinuousSendMessage(sendMessageInput, userAuth, chatId);
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
        await handleContinuousSendMessage(sendMessageInput, userAuth, chatId);
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
  messagesSection
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

  realChat(user.profilePic, user.name, chatRef.id, messagesSection);

  let startPoint = document.querySelector(".chat-start-point");

  renderFirstMsg(user, startPoint, sentMessage, getTime(serverTimestamp()));

  return true;
}

export async function handleContinuousSendMessage(inputEl, userAuth, chatId) {
  const sentMessage = inputEl.value.trim();
  if (!sentMessage) return;

  inputEl.value = "";

  const currentUser = userAuth.currentUser.displayName.toLowerCase();

  // const chatRef = await createDoc("chats", {
  //   isGroup: false,
  //   lastMessage: {
  //     content: sentMessage,
  //     timestamp: formattedTimestamp(),
  //   },
  // });

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

export function renderAllChatMsgs(
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
      continuousYourMessage(
        messageObj.content,
        messageObj.timestamp || "sending",
        document.querySelector(".your-msg-container")
      );
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
    }
  }
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

  const unsubscribe = onSnapshot(q, (snapshot) => {
    snapshot.docChanges().forEach((change) => {
      if (["added", "modified"].includes(change.type)) {
        const messageData = change.doc.data();

        if (!messageData.timestamp) return;

        const message = {
          id: change.doc.id,
          ...change.doc.data(),
        };

        console.log("message", message);

        renderSingleMessage(
          message,
          yourUserId,
          userAuth,
          chatStartingPoint,
          selectedUser,
          currentSelectedUserId
        );
      }
    });
  });

  return unsubscribe;
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
