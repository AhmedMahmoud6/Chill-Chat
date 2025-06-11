import {
  getCollectionRef,
  subcollectionExists,
  auth,
  observeAuthState,
  getAllUserNames,
  createDoc,
  setDoc,
  doc,
  db,
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

document.addEventListener("click", (e) => {
  // selected a user to chat with
  if (e.target.closest(".user")) {
    let selectedUserId = e.target.closest(".user").dataset.userid;
    newChatContainer.classList.add("hidden");

    filteredUsers.forEach((user) => {
      if (user.name === selectedUserId) {
        tempChat(user.profilePic, user.name, selectedUserId, messagesSection);
        let sendVoiceMessage = document.querySelector(".send-voice-message");
        let sendCurrentMessageIcon = document.querySelector(
          ".send-current-message"
        );

        let sendMessageInput = document.querySelector(".send-message-input");

        if (sendMessageInput) {
          sendMessageInput.addEventListener("input", (e) => {
            // update the send icon and voice icon
            if (e.target.value === "") {
              sendVoiceMessage.classList.remove("hidden");
              sendCurrentMessageIcon.classList.add("hidden");
            } else {
              sendVoiceMessage.classList.add("hidden");
              sendCurrentMessageIcon.classList.remove("hidden");
            }
          });

          // send message by pressing enter
          sendMessageInput.addEventListener("keydown", async (e) => {
            if (e.key === "Enter") {
              let sentMessage = sendMessageInput.value;
              sendMessageInput.value = "";
              const now = new Date();
              const formattedTimestamp = now.toLocaleString("en-US", {
                dateStyle: "long", // "June 11, 2025"
                timeStyle: "short", // "2:23 PM"
              });

              // create chat collection and its chat document
              const chatRef = await createDoc("chats", {
                isGroup: false,
                participants: [
                  userAuth.currentUser.displayName,
                  selectedUserId,
                ],
                lastMessage: {
                  content: sentMessage,
                  timestamp: formattedTimestamp,
                },
              });

              // create messages subcollection in the chat id

              const messageId = crypto.randomUUID(); // generate a unique ID
              const messageRef = doc(
                db,
                "chats",
                chatRef.id,
                "messages",
                messageId
              );

              await setDoc(messageRef, {
                messageId: messageId,
                sentFrom: userAuth.currentUser.displayName,
                content: sentMessage,
                timestamp: formattedTimestamp,
              });

              // add user to talkedWith subcollection
              const youTalkedWithRef = doc(
                db,
                "users",
                userAuth.currentUser.displayName.toLowerCase(),
                "talkedWith",
                selectedUserId
              );

              const heTalkedWithRef = doc(
                db,
                "users",
                selectedUserId,
                "talkedWith",
                userAuth.currentUser.displayName.toLowerCase()
              );

              // adding the chatted with user to talkedWith list
              await setDoc(youTalkedWithRef, {
                chatId: chatRef.id,
              });
              // adding you to the user talkedWith list
              await setDoc(heTalkedWithRef, {
                chatId: chatRef.id,
              });

              realChat(user.profilePic, user.name, chatRef.id, messagesSection);
            }
          });

          // send message by clicking the send icon
          sendCurrentMessageIcon.addEventListener("click", () => {
            console.log("submitting Message");
          });
        }
        return;
      }
    });
  }
});
