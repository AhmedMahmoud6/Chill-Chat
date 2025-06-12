import {
  getCollectionRef,
  auth,
  observeAuthState,
  getAllUserNames,
  createDoc,
  setDoc,
  doc,
  db,
  getDoc,
  getDocs,
  collection,
} from "./firebase-auth.js";

import {
  setupMessageInputListeners,
  updateChatList,
  renderAllChatMsgs,
  setSenderId,
  listenToNewMessages,
} from "./functions.js";

import { displayFoundedUsers } from "./components/newChat.js";
import { realChat } from "./components/realChat.js";
import { tempChat } from "./components/tempChat.js";
import { createFriendInChatList } from "./components/renderFriendChatList.js";
import {
  yourMessageContainer,
  firstYourMessage,
  continuousYourMessage,
} from "./components/yourMessage.js";
import {
  friendMessageContainer,
  firstFriendMessage,
  continuousFriendMessage,
} from "./components/friendMessage.js";

let messagesSection = document.querySelector(".messages-section");
let chatSectionEmpty = document.querySelector(".section-chat-empty");
let allChatSection = document.querySelector(".section-all-chats");
let newChat = document.querySelector(".new-chat");
let newChatContainer = document.querySelector(".new-chat-container");
let newChatSearch = document.querySelector(".new-chat-search");
let foundedUsersDiv = document.querySelector(".founded-users");
let noUsersFound = document.querySelector(".no-users");
let loadingChatList = document.querySelector(".loading-chat-list");
let chatStartingPoint;

let userAuth = auth;
let allUsers;
let filteredUsers;
let currUserTalkedWith;

// check if there's a talkedWith user
observeAuthState(async (user) => {
  if (!user) return;

  const userDisplayName = user.displayName.toLowerCase();
  currUserTalkedWith = await updateChatList(
    userDisplayName,
    allChatSection,
    chatSectionEmpty,
    userAuth,
    loadingChatList
  );
  newChat.classList.remove("hidden");
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
    filteredUsers = allUsers
      .filter(
        (username) =>
          username.name?.toLowerCase().startsWith(newChatSearch.value) &&
          username.name !== userAuth.currentUser.displayName
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

    // update the chatStartingPoint
    chatStartingPoint = document.querySelector(".chat-start-point");
    let allMsgs = await getDocs(
      collection(db, "chats", currentChatId, "messages")
    );
    let allMsgsArray = allMsgs.docs.map((doc) => doc.data());
    allMsgsArray.sort((a, b) => a.timestamp.toDate() - b.timestamp.toDate());

    setSenderId("");

    // allMsgsArray.forEach((messageObj) => {
    //   renderAllChatMsgs(
    //     messageObj,
    //     yourUserId,
    //     userAuth,
    //     chatStartingPoint,
    //     selectedUser,
    //     currentSelectedUserId
    //   );
    // });

    const unsubscribe = listenToNewMessages(
      currentChatId,
      renderAllChatMsgs,
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
      allChatSection,
      chatSectionEmpty,
      loadingChatList,
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
  chatStartingPoint = document.querySelector(".chat-start-point");
  let msgListened = await setupMessageInputListeners(
    user,
    selectedUserId,
    userAuth,
    messagesSection,
    allChatSection,
    chatSectionEmpty,
    loadingChatList,
    chatStartingPoint,
    ""
  );

  if (msgListened) {
    currUserTalkedWith = await updateChatList(
      userAuth.currentUser.displayName.toLowerCase(),
      allChatSection,
      chatSectionEmpty,
      userAuth,
      loadingChatList
    );
  }
});
