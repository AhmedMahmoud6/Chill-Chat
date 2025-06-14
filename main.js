import {
  auth,
  observeAuthState,
  getAllUserNames,
  db,
  getDocs,
  collection,
  serverTimestamp,
} from "./firebase-auth.js";

import {
  setupMessageInputListeners,
  renderChatMsg,
  setSenderId,
  listenToNewMessages,
  waitForFriend,
  listenToTalkedWith,
  listenToLastMsg,
  getTime,
  triggerChatMobileView,
} from "./functions.js";

import { displayFoundedUsers } from "./components/newChat.js";
import { realChat } from "./components/realChat.js";
import { tempChat } from "./components/tempChat.js";

let messagesSection = document.querySelector(".messages-section");
let chatSectionEmpty = document.querySelector(".section-chat-empty");
let allChatSection = document.querySelector(".section-all-chats");
let newChat = document.querySelector(".new-chat");
let newChatContainer = document.querySelector(".new-chat-container");
let newChatSearch = document.querySelector(".new-chat-search");
let foundedUsersDiv = document.querySelector(".founded-users");
let noUsersFound = document.querySelector(".no-users");
let loadingChatList = document.querySelector(".loading-chat-list");
let chatsSection = document.querySelector(".chats-section");
let sideSection = document.querySelector(".side-section");
let chatStartingPoint;

let unsubscribeFromMessages = null;
let userAuth = auth;
let allUsers;
let filteredUsers;
let currUserTalkedWith;

// check if there's a talkedWith user
observeAuthState(async (user) => {
  if (!user) return;

  const userDisplayName = user.displayName.toLowerCase();
  setSenderId("");
  listenToTalkedWith(
    userDisplayName,
    allChatSection,
    chatSectionEmpty,
    loadingChatList,
    (updatedUsers) => {
      currUserTalkedWith = updatedUsers || [];
      setTimeout(() => {
        newChat.classList.remove("hidden");
      }, 500);
    }
  );

  listenToLastMsg(userDisplayName, async (updatedDetails) => {
    let waiting = await waitForFriend("", updatedDetails.chatId);

    if (waiting) {
      let selectUpdatedFriend = document.querySelector(
        `.friend[data-chatid="${updatedDetails.chatId}"]`
      );
      let FriendLastMsg = selectUpdatedFriend.querySelector("p");
      let FriendLastMsgTime =
        selectUpdatedFriend.querySelector(".message-date h1");
      FriendLastMsg.textContent = updatedDetails.content;
      FriendLastMsgTime.textContent = getTime(updatedDetails.timestamp);
    }
  });
});

// open search users
newChat.addEventListener("click", async () => {
  newChatContainer.classList.remove("hidden");
  newChatSearch.disabled = true;
  allUsers = await getAllUserNames();
  if (allUsers) newChatSearch.disabled = false;
  newChatSearch.focus();
});

// search users
newChatSearch.addEventListener("input", async () => {
  noUsersFound.classList.add("hidden");
  if (newChatSearch.value !== "") {
    foundedUsersDiv.innerHTML = "";

    let cannotTalkWith = currUserTalkedWith.map((user) => user.name);

    filteredUsers = allUsers
      .filter(
        (username) =>
          username.name
            ?.toLowerCase()
            .startsWith(newChatSearch.value.toLowerCase()) &&
          username.name !== userAuth.currentUser.displayName &&
          !cannotTalkWith.includes(username.name)
      )
      .map((username) => {
        return {
          name: username.name,
          profilePic: username.profilePic,
        };
      });

    if (filteredUsers.length === 0) {
      noUsersFound.classList.remove("hidden");
    } else
      filteredUsers.forEach((user) => {
        displayFoundedUsers(user.name, user.profilePic, foundedUsersDiv);
      });
  } else {
    foundedUsersDiv.innerHTML = "";
  }
});

// close search users container
newChatContainer.addEventListener("click", (e) => {
  if (e.target.classList.contains("new-chat-container"))
    newChatContainer.classList.add("hidden");
});

document.addEventListener("click", async (e) => {
  const friendRef = e.target.closest(".friend");
  // if clicked on friend in the chatlist
  if (friendRef) {
    if (unsubscribeFromMessages) unsubscribeFromMessages();
    let currentChatId = friendRef.dataset.chatid;
    let currentSelectedUserId = friendRef.dataset.userid;
    let yourUserId = userAuth.currentUser.displayName.toLowerCase();

    let selectedUser = currUserTalkedWith.find(
      (user) => user.name.toLowerCase() === currentSelectedUserId
    );

    // create real chat
    realChat(
      selectedUser.profilePic,
      selectedUser.name,
      currentChatId,
      messagesSection
    );
    document.querySelector(".send-message-input").focus();

    // update the chatStartingPoint
    chatStartingPoint = document.querySelector(".chat-start-point");
    let allMsgs = await getDocs(
      collection(db, "chats", currentChatId, "messages")
    );
    let allMsgsArray = allMsgs.docs.map((doc) => doc.data());
    allMsgsArray.sort((a, b) => a.timestamp.toDate() - b.timestamp.toDate());

    setSenderId("");

    triggerChatMobileView(chatsSection, sideSection);

    unsubscribeFromMessages = listenToNewMessages(
      currentChatId,
      renderChatMsg,
      yourUserId,
      userAuth,
      chatStartingPoint,
      selectedUser,
      currentSelectedUserId
    );

    await setupMessageInputListeners(
      selectedUser,
      currentSelectedUserId,
      userAuth,
      messagesSection,
      chatStartingPoint,
      currentChatId
    );
  }

  const userElement = e.target.closest(".user");
  if (!userElement) return;

  const selectedUserId = userElement.dataset.userid;
  const user = filteredUsers.find((u) => u.name === selectedUserId);

  if (!user) return;

  newChatContainer.classList.add("hidden");

  tempChat(user.profilePic, user.name, selectedUserId, messagesSection);
  document.querySelector(".send-message-input").focus();

  triggerChatMobileView(chatsSection, sideSection);
  chatStartingPoint = document.querySelector(".chat-start-point");
  let msgListened = await setupMessageInputListeners(
    user,
    selectedUserId,
    userAuth,
    messagesSection,
    chatStartingPoint,
    serverTimestamp()
  );

  if (msgListened) {
    const friendToClick = await waitForFriend(msgListened, "");
    if (friendToClick) {
      friendToClick.click();
    }
  }
});
