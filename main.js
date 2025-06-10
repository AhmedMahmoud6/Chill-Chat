import {
  getCollectionRef,
  subcollectionExists,
  auth,
  observeAuthState,
  getAllUserNames,
} from "./firebase-auth.js";

import { displayFoundedUsers } from "./components/newChat.js";

let chatSectionEmpty = document.querySelector(".section-chat-empty");
let allChatSection = document.querySelector(".section-all-chats");
let newChat = document.querySelector(".new-chat");
let newChatContainer = document.querySelector(".new-chat-container");
let newChatSearch = document.querySelector(".new-chat-search");
let openedChat = document.querySelector(".opened-chat");
let foundedUsersDiv = document.querySelector(".founded-users");
let noUsersFound = document.querySelector(".no-users");

let userAuth = auth;
let allUsers;

observeAuthState(async (user) => {
  if (!user) return;

  const userDisplayName = user.displayName;

  const talkedWithUsers = await subcollectionExists(
    "users",
    userDisplayName,
    "talkedWith"
  );

  // if chat list is empty
  if (!talkedWithUsers) {
    allChatSection.classList.add("hidden");
    chatSectionEmpty.classList.remove("hidden");
  } else {
    chatSectionEmpty.classList.add("hidden");
    allChatSection.classList.remove("hidden");
  }
});

newChat.addEventListener("click", async () => {
  newChatContainer.classList.remove("hidden");
  newChatSearch.focus();
  allUsers = await getAllUserNames();
});

newChatSearch.addEventListener("input", async () => {
  noUsersFound.classList.add("hidden");
  if (newChatSearch.value !== "") {
    foundedUsersDiv.innerHTML = "";
    let filteredUsers = allUsers
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

newChatContainer.addEventListener("click", (e) => {
  if (e.target.classList.contains("new-chat-container"))
    newChatContainer.classList.add("hidden");
});
