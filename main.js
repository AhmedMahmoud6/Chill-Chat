import {
  getCollectionRef,
  subcollectionExists,
  auth,
  observeAuthState,
} from "./firebase-auth.js";

let chatSectionEmpty = document.querySelector(".section-chat-empty");
let allChatSection = document.querySelector(".section-all-chats");
let openedChat = document.querySelector(".opened-chat");

observeAuthState(async (user) => {
  if (!user) return;

  const userEmail = user.email;
  console.log(userEmail);

  const talkedWithUsers = await subcollectionExists(
    "users",
    userEmail,
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
