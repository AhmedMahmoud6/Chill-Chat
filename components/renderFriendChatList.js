import { getTimeAgo } from "../functions.js";

export function createFriendInChatList(
  chatId,
  userid,
  userImg,
  username,
  lastMessage,
  timestamp,
  container
) {
  let friendHTML = `
    <div
        class="friend flex items-center gap-4 hover:bg-[#49494c] px-2 rounded-lg cursor-pointer"
        data-chatid=${chatId} data-userid="${userid}" >
        <div class="profile-pic w-[50px] h-[50px] flex-shrink-0">
            <img
            class="w-full h-full rounded-full object-cover"
            src="${userImg}"
            alt="profile-pic"
            />
        </div>
        <div
            class="info w-full flex justify-between items-center py-2 border-b-1 border-[#49494c]"
        >
            <div class="name-and-message">
            <h1 class="text-white">${username}</h1>
            <p class="text-gray-400">${lastMessage}</p>
            </div>
            <div class="message-date">
            <h1 class="text-white">${getTimeAgo(timestamp)}</h1>
            </div>
        </div>
    </div>
    `;
  container.insertAdjacentHTML("beforeend", friendHTML);
}
