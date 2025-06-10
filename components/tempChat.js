export function tempChat(userImg, username) {
  let tempChatHTML = `
              <div
            class="opened-chat h-full min-w-120 flex flex-col max-[875px]:min-w-0 flex-1 max-[875px]:flex-0 hidden"
          >
            <div
              class="contact-info relative bg-[#49494c] w-full h-16 flex justify-between items-center px-8"
            >
              <div class="contact-title flex gap-4 items-center">
                <div class="contact-img w-[45px] h-[45px] flex-shrink-0">
                  <img
                    class="w-full h-full rounded-full object-cover"
                    src="${userImg}"
                    alt="profile-pic"
                  />
                </div>
                <h1 class="contact-name text-white">${username}</h1>
              </div>
              <div class="contact-more cursor-pointer p-2">
                <i class="fa-solid fa-ellipsis-vertical text-white text-xl"></i>
              </div>
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
                  class="p-2 px-4 w-full placeholder:text-gray-300 outline-none text-white bg-[#65656a] w-full h-full rounded-lg"
                  placeholder="Type a message"
                />
              </div>
              <div class="send-voice-message">
                <i class="fa-solid fa-microphone text-white text-xl"></i>
              </div>
            </div>
          </div>
    `;
}
