export function realChat(userImg, username, chatId, messagesSection) {
  messagesSection.innerHTML = "";
  let realChatHTML = `
              <div
            class="real-chat h-full min-w-120 flex flex-col max-[875px]:min-w-0 flex-1 max-[875px]:flex-0"
            data-chatid="${chatId}"
          >
            <div
              class="contact-info relative bg-[#49494c] w-full h-16 flex justify-between items-center px-8"
            >
              <div class="contact-title flex gap-4 items-center min-w-0">
              <button class="back w-11 h-11 flex justify-center items-center bg-gray-400/0 cursor-pointer focus:bg-gray-400/50 rounded-lg text-2xl text-white hidden"><i class="fa-solid fa-left-long"></i></button>
                <div class="contact-img w-[45px] h-[45px] flex-shrink-0">
                  <img
                    class="w-full h-full rounded-full object-cover"
                    src="${userImg}"
                    alt="profile-pic"
                  />
                </div>
                <div class="flex flex-col">
                <h1 class="contact-name text-sm text-white truncate">${username}</h1>
                <h1 class="contact-status text-sm text-gray-400 truncate">Loading...</h1>
                </div>
              </div>
              <div class="contact-more cursor-pointer p-2">
                <i class="fa-solid fa-ellipsis-vertical text-white text-xl"></i>
              </div>
            </div>

            <div class="chat flex-1 p-8 max-[500px]:p-3 relative overflow-y-auto">
            <div class="chat-start-point w-full"></div>
            </div>


            <div
              class="send-message-section relative bg-[#49494c] flex justify-between items-center gap-4 w-full h-18 px-6"
            >
              <div class="add-icon flex justify-center items-center">
                <i class="fa-solid fa-plus text-white text-2xl"></i>
              </div>
              <div class="send-message w-full h-8/12">
                <input
                  type="text"
                  class="send-message-input p-2 px-4 w-full placeholder:text-gray-300 outline-none text-white bg-[#65656a] w-full h-full rounded-lg"
                  placeholder="Type a message"
                />
              </div>
              <div class="send-voice-message max-w-[20px] text-center cursor-pointer">
                <i class="fa-solid fa-microphone text-white text-xl w-[20px]"></i>
              </div>
              <div class="send-current-message cursor-pointer hidden"><i class="fa-solid fa-paper-plane text-white text-xl"></i></div>
            </div>
          </div>
    `;
  messagesSection.insertAdjacentHTML("beforeend", realChatHTML);
}
