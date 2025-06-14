import { getTime as getTime } from "../functions.js";

export function yourMessageContainer(yourPhoto, container) {
  let msgContainerHTML = `
    <div class="flex gap-2.5 justify-end pb-4">
        <div class="your-msg-container">
        
        </div>    


        <div class="your-photo w-11 h-11">
            <img
                src="${yourPhoto}"
                alt="Shanay image"
                class="w-full h-full rounded-full"
            />
        </div>

    </div>
    `;
  container.insertAdjacentHTML("beforeend", msgContainerHTML);
}

export function firstYourMessage(yourMsg, sentTime, container) {
  let msgContainerHTML = `
    <div class="${
      sentTime === "sending" ? "dummy" : ""
    } w-max max-w-xs xl:max-w-md grid mb-2 ml-auto">
        <h5
        class="text-right text-white text-sm font-semibold leading-snug pb-1"
        >
        You
        </h5>
        <div class="px-3 py-2 bg-[#6366f1] relative rounded ml-auto">
        <h2 class="text-white text-sm font-normal leading-snug">
            ${yourMsg}
        </h2>
        </div>
        <div class="justify-start items-center inline-flex">
        <h3
            class="text-gray-400 text-xs font-normal leading-4 py-1"
        >
            ${
              sentTime === "sending"
                ? "sending"
                : sentTime === "sent"
                ? "sent"
                : getTime(sentTime)
            }
        </h3>
        </div>
    </div>
    `;
  container.insertAdjacentHTML("beforeend", msgContainerHTML);
}

export function continuousYourMessage(yourMsg, sentTime, container) {
  let msgContainerHTML = `
    <div class="justify-center">
        <div class="w-max max-w-xs xl:max-w-md grid ml-auto mb-4">
        <div class="px-3 py-2 bg-[#6366f1] relative rounded">
            <h2
            class="text-white text-sm font-normal leading-snug"
            >
            ${yourMsg}
            </h2>
        </div>
        <div class="justify-start items-center inline-flex">
            <h3
            class="text-gray-400 text-xs font-normal leading-4 py-1"
            >
            ${
              sentTime === "sending"
                ? "sending"
                : sentTime === "sent"
                ? "sent"
                : getTime(sentTime)
            }
            </h3>
        </div>
        </div>
    </div>
    `;
  container.insertAdjacentHTML("beforeend", msgContainerHTML);
}
