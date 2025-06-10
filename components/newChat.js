export function displayFoundedUsers(userId, imageLink, container) {
  let foundedHTML = `
    <div class="flex items-center gap-4 hover:bg-[#49494c] p-2 rounded-lg cursor-pointer"
    id=${userId}
    >
        <div class="user-profile-pic w-[50px] h-[50px] flex-shrink-0">
        <img
            class="w-full h-full rounded-full object-cover"
            src="${imageLink}"
            alt="profile-pic"
        />
        </div>
        <div
        class="user-info w-full flex justify-between items-center py-2"
        >
        <div class="user-name">
            <h1 class="text-white">${userId}</h1>
        </div>
        </div>
    </div>
    `;

  container.insertAdjacentHTML("beforeend", foundedHTML);
}
