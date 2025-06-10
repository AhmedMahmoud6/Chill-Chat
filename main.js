import {
  getCollectionRef,
  subcollectionExists,
  auth,
  observeAuthState,
  getAllUserNames,
} from "./firebase-auth.js";

import { displayFoundedUsers } from "./components/newChat.js";
import { realChat } from "./components/realChat.js";
import { tempChat } from "./components/tempChat.js";
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
let openedChat = document.querySelector(".opened-chat");
let foundedUsersDiv = document.querySelector(".founded-users");
let noUsersFound = document.querySelector(".no-users");

let userAuth = auth;
let allUsers;
let filteredUsers;

// check if there's a talkedWith user
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
  newChat.classList.remove("hidden");
});

// open search users
newChat.addEventListener("click", async () => {
  newChatContainer.classList.remove("hidden");
  newChatSearch.focus();
  allUsers = await getAllUserNames();
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

document.addEventListener("click", (e) => {
  // selected a user to chat with
  if (e.target.closest(".user")) {
    let selectedUserId = e.target.closest(".user").dataset.userid;
    newChatContainer.classList.add("hidden");

    filteredUsers.forEach((user) => {
      if (user.name === selectedUserId) {
        tempChat(user.profilePic, user.name, messagesSection);
        return;
      }
    });
  }
});
