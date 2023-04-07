// 宣告變數
const BASE_URL = "https://user-list.alphacamp.io";
const INDEX_URL = BASE_URL + "/api/v1/users/";
const dataPanel = document.querySelector("#data-panel");
const paginator = document.querySelector(".pagination");

let favoriteFriendList = [];
let filterFriendList = [];
const FRIENDS_PER_PAGE = 12;
const ulTag = document.querySelector("ul");

// 從local Storage get朋友資料
favoriteFriendList = JSON.parse(localStorage.getItem("favoriteFriend")) || [];

displayFriends(favoriteFriendList);

//display pagination
element(numberOfPages(favoriteFriendList.length), 1);
// display Friend
displayFriends(getFriendsByPage(1)); //一開始進來時先停留在第一頁

//function: 將朋友資料加入朋友區塊
function displayFriends(friends) {
  dataPanel.innerHTML = friends
    .map(
      (friend) =>
        `<div class="card col">
        <img
          src="${friend.avatar}"
          alt="friend"
          class="card-img"
        />
        <i class="fa-solid fa-square-minus fa-lg" data-id="${friend.id}"></i>
        <div class="intro">
          <h3 class="card-title">${friend.name}</h3>
          <p class="card-detail">
            <span class="info">Gender: ${friend.gender}</span><span class="info">Age: ${friend.age}</span>  
          </p>
          <i class="fa-solid fa-circle-info fa-lg" data-id="${friend.id}"></i>
        </div>
      </div>`
    )
    .join("");
}

/////////////////////////////search Bar toggle function////////////////
const searchIcon = document.querySelector(".searchIcon");
const searchBar = document.querySelector(".searchBar");
const mySearch = document.querySelector("#mySearch");

searchIcon.addEventListener("click", function () {
  searchBar.classList.toggle("active");
});

/////////////////////////mySearch/////////////////////
mySearch.addEventListener("keyup", function search(event) {
  const value = event.target.value.trim().toLowerCase();
  filterFriendList = favoriteFriendList.filter((friend) => {
    return friend.name.toLowerCase().includes(value);
  });
  //filter:把所有的item都比對過一次，並回把有符合條件的object都放到一個新的陣列，然後回傳此陣列

  if (filterFriendList.length === 0) {
    return alert(`您輸入的關鍵字：${value} 沒有符合條件的資料`);
  }
  displayFriends(filterFriendList);
  element(numberOfPages(filterFriendList.length), 1);
  // display Friend
  displayFriends(getFriendsByPage(1));
});

//////////dataPanel Event Listener for Popup and Favorite //////////////////////////
dataPanel.addEventListener("click", (event) => {
  if (event.target.matches(".fa-circle-info")) {
    // console.log(event.target.dataset.id);
    showPopup(Number(event.target.dataset.id));
  } else if (event.target.matches(".fa-square-minus")) {
    removeFromFavorite(Number(event.target.dataset.id));
  }
});

////////////////////////////////////Add to Favorite ///////////////////////////////////////
//remove Favorite Movie
function removeFromFavorite(id) {
  //錯誤處理:如果收藏清單favoriteFriendList是空的，則return結束這個函式。
  if (!favoriteFriendList || !favoriteFriendList.length) return;

  //找出所要刪除的movie在 favoriteMovieList這個陣列中的index，如果傳入的 id 在收藏清單中不存在則return結束這個函式
  const friendIndex = favoriteFriendList.findIndex((item) => item.id === id);
  if (friendIndex === -1) return;

  //刪除該筆電影
  favoriteFriendList.splice(friendIndex, 1);

  //把更新後的favoriteMovieList，透過直接更改"favoriteMovies"這個key所對應的value，把更新後的favoriteMovieList的資料存到value裡
  localStorage.setItem("favoriteFriend", JSON.stringify(favoriteFriendList));

  //即時更新頁面
  //display pagination
  element(numberOfPages(favoriteFriendList.length), 1);
  // display Friend
  displayFriends(getFriendsByPage(1)); //一開始進來時先停留在第一頁
}

//showPopup function
function showPopup(id) {
  const popup = document.querySelector("#popup");
  axios.get(INDEX_URL + id).then((res) => {
    const friendData = res.data;
    popup.innerHTML = `
      <div class='popup-row'>
        <img src="${friendData.avatar}" alt="friend" class="popup-img"/>
        <div class='col popup-detail'>
          <h2>${friendData.name}</h2>
          <p>Surname: ${friendData.surname} <br>
          Email: ${friendData.email}<br>
          Region: ${friendData.region}<br>
          Birthday: ${friendData.birthday}<br>
          Age: ${friendData.age}<br>
          </p>
        </div>
      </div>
      <span class="close-btn" onclick="toggle()">close</span>
    `;
  });

  toggle();
}

//Modal toggle function
function toggle() {
  const blur = document.querySelector("#blur");
  const popup = document.querySelector("#popup");
  blur.classList.toggle("active");
  popup.classList.toggle("active");
}

///////////////////////////////////Pagination 分頁器 /////////////////////////////////////

///////////分頁器互動式動畫///////////////////////

function element(totalPages, page) {
  let liTag = "";
  let activeLi;
  let beforePages = page - 1; //5 -1 = 4
  let afterPages = page + 1; //5 + 1 = 6

  //1. 渲染Prev Button: 如果page number is greater than 1, add prev btn 如果小於1則不出現prev button
  if (page > 1) {
    liTag += `<li class="btn prev" data-page="${
      page - 1
    }" onclick="element(${totalPages}, ${page - 1})"><span data-page="${
      page - 1
    }"> <i class="fa-solid fa-angle-left"></i> Prev </span></li>`;
  }

  //4. 如果page數字大於3，加入先前頁數1和(...)
  if (page > 2) {
    //if page number is greater than 2 then add new li tag with 1 value
    liTag += `<li class="numb" data-page="1" onclick="element(${totalPages},1)"><span data-page="1">1</span></li>`;

    if (page > 3) {
      //if page number is greater than 3 then add new li tag with (...) value
      liTag += `<li class="dots"><span>...</span></li>`;
    }
  }

  //2. 讓頁面渲染page的前後數字
  for (let pageLength = beforePages; pageLength <= afterPages; pageLength++) {
    //5. 讓當next button 的onclick發動時，page的數字不可以被扣到負的，如果扣到為零則維持在第一頁
    if (pageLength > totalPages) {
      continue; //for loop省略接下來的動作直接結束
    }

    //5. 讓當prev button 的onclick發動時，page的數字不可以被扣到負的，如果扣到為零則維持在第一頁
    if (pageLength === 0) {
      // if pageLength is equal to 0 then add +1 in the pageLength value
      pageLength = pageLength + 1;
    }

    //3. 讓所在頁數page會一直亮著
    if (page === pageLength) {
      //if page value is equal to pageLength then assign the active string in the activeList variable
      activeLi = "active";
    } else {
      // else leave empty to the activeLi variable
      activeLi = "";
    }
    //2. 加入頁數li tag
    liTag += `<li class="numb ${activeLi}" data-page="${pageLength}" onclick="element(${totalPages},${pageLength})"><span data-page="${pageLength}">${pageLength}</span></li>`;
  }

  //4. 如果頁數小於 總頁數-2，加入之後頁數和(...)
  if (page < totalPages - 1) {
    //if page number is less than totalPages by -1 then show the last li or page which is 20
    if (page < totalPages - 2) {
      //if page number is less than totalPages by -2 then show the last (...) before last page
      liTag += `<li class="dots"><span>...</span></li>`;
    }
    liTag += `<li class="numb" data-page="${totalPages}" onclick="element(${totalPages},${totalPages})"><span data-page="${totalPages}">${totalPages}</span></li>`;
  }

  //1. 如果page的數字小於totalPages, add next btn，如果page大於如果page的數字小於totalPages則不出現next button
  if (page < totalPages) {
    liTag += `<li class="btn next" data-page="${
      page + 1
    }" onclick="element(${totalPages}, ${page + 1})"><span data-page="${
      page + 1
    }"> <i class="fa-solid fa-angle-right"></i> Next </span></li>`;
  }

  ulTag.innerHTML = liTag;
}

///////////////分頁器function///////////////

//Render Pagination
function numberOfPages(amount) {
  //計算總頁數
  const numberOfPages = Math.ceil(amount / FRIENDS_PER_PAGE);
  return numberOfPages;
}

///getFriendsByPage function
function getFriendsByPage(page) {
  //filterFriendList.length ? 是條件，如果filterFriendList為true則return filterFriendList，如果friends為true則return friends。如果搜尋結果有東西，條件判斷為 true ，會回傳 filterFriendList，然後用 data 保存回傳值，有就是「如果搜尋清單有東西，就取搜尋清單 filterFriendList，否則就還是取總清單 friends」
  const data = filterFriendList.length ? filterFriendList : favoriteFriendList;
  // console.log(data)
  //計算起始 index
  const startIndex = (page - 1) * FRIENDS_PER_PAGE;
  //回傳切割後的新陣列
  let renderList = data.slice(startIndex, startIndex + FRIENDS_PER_PAGE);
  return renderList;
}


//Add event listener to paginator//// return click page number
paginator.addEventListener("click", (event) => {
  // if (event.target.tagName !== "LI" || event.target.tagName !== "SPAN")
  //   return;

  //透過 dataset 取得被點擊的頁數
  const page = Number(event.target.dataset.page);

  //更新畫面
  displayFriends(getFriendsByPage(page));
});
