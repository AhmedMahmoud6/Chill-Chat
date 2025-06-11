import { getTimeAgo } from "../functions.js";

export function friendMessageContainer(friendPhoto, friendName, container) {
  let msgContainerHTML = `
    <div class="grid pb-4">
    <div class="flex gap-2.5 mb-4">
        <div class="sender-photo w-11 h-11">
            <img
            src="${friendPhoto}"
            alt="Friend image"
            class="w-full h-full rounded-full"
            />
        </div>
        <div class="friend-message-section grid">
            <h5
                class="text-white text-sm font-semibold leading-snug pb-1"
                >
                ${friendName}
            </h5>
        </div>

    </div>
    </div>
    `;

  container.insertAdjacentHTML("beforeend", msgContainerHTML);
}

export function firstFriendMessage(friendMsg, sentTime, container) {
  let msgContainerHTML = `
    <div
    class="first-msg w-max max-w-xs lg:max-w-sm xl:max-w-md grid"
    >
        <div
            class="px-3.5 py-2 bg-[#5d5d61] relative rounded justify-start items-center gap-3 inline-flex w-max"
        >
            <h5
            class="text-white text-sm font-normal leading-snug"
            >
            ${friendMsg}
            </h5>
        </div>
        <div
            class="justify-end items-center inline-flex mb-2.5"
        >
            <h6
            class="text-gray-400 text-xs font-normal leading-4 py-1"
            >
            ${getTimeAgo(sentTime)}
            </h6>
        </div>
    </div>
    `;
  container.insertAdjacentHTML("beforeend", msgContainerHTML);
}

export function continuousFriendMessage(friendMsg, sentTime, container) {
  let msgContainerHTML = `
    <div
        class="continuous-msg w-max max-w-xs lg:max-w-sm xl:max-w-md grid"
        >
        <div
            class="px-3.5 py-2 bg-[#5d5d61] relative rounded justify-start items-center gap-3 inline-flex"
        >
            <h5
            class="text-white text-sm font-normal leading-snug"
            >
            ${friendMsg}
            </h5>
        </div>
        <div
            class="justify-end items-center inline-flex mb-2.5"
        >
            <h6
            class="text-gray-400 text-xs font-normal leading-4 py-1"
            >
            ${getTimeAgo(sentTime)}
            </h6>
        </div>
    </div>
    `;
  container.insertAdjacentHTML("beforeend", msgContainerHTML);
}
