const socket = io();

//Elements
const $messageForm = document.querySelector("form");
const $messageFormInput = $messageForm.querySelector("input");
const $messageFormButton = $messageForm.querySelector("button");
const $locationButton = document.querySelector("#send-location");
const $messages = document.querySelector("#messages");

//Templates
const messageTemplate = document.querySelector("#message-template").innerHTML;
const locationTemplate = document.querySelector("#location-template").innerHTML;
const sidebarTemplate = document.querySelector("#sidebar-template").innerHTML;

//Options
const {userName, room} = Qs.parse(location.search, { ignoreQueryPrefix : true})

const autoScroll = () => {
    const $newMessage = $messages.lastElementChild

    //Height of the new message
    const newMessageStyles =getComputedStyle($newMessage)
    const newMessageMargin = parseInt(newMessageStyles.marginBottom)
    const newMessageHeight = $newMessage.offsetHeight + newMessageMargin

    //visible height
    const visibleHeight = $messages.offsetHeight

    //height of mes container
    const containerHeight = $messages.scrollHeight

    //how far have i scrolled
    const scrollOffset = $messages.scrollTop + visibleHeight

    if(containerHeight - newMessageHeight <= scrollOffset){
        $messages.scrollTop = $messages.scrollHeight
    }
}
socket.on("message", (message) => {
  console.log(message);
  const html = Mustache.render(messageTemplate, {
    userName: message.userName,
    message: message.text,
    createdAt: moment(message.createdAt).format("h:mm a"),
  });
  $messages.insertAdjacentHTML("beforeend", html);
  autoScroll()
});

socket.on("locationMessage", (message) => {
  const html = Mustache.render(locationTemplate, {
    userName: message.userName,
    location: message.text,
    createdAt: moment(message.createdAt).format("h:mm a"),
  });
  $messages.insertAdjacentHTML("beforeend", html);
  autoScroll()
});

$messageForm.addEventListener("submit", (e) => {
  e.preventDefault();
  //disabling so that disabled till mes is send
  $messageFormButton.setAttribute("disabled", "disabled");
  socket.emit("messageData", e.target.elements.message.value, (error) => {
    $messageFormButton.removeAttribute("disabled");
    $messageFormInput.value = "";
    $messageFormInput.focus();
    if (error) {
      return console.log(error);
    }
    console.log("message delivered");
  });
});

$locationButton.addEventListener("click", () => {
  $locationButton.setAttribute("disabled", "disabled");
  if (!navigator.geolocation) {
    return alert("geolocation is not supported by your browser");
  }

  navigator.geolocation.getCurrentPosition((position) => {
    const location = {
      longitude: position.coords.longitude,
      latitude: position.coords.latitude,
    };
    //has acknowledgement with callback
    socket.emit("location", location, (message) => {
      console.log(message);
      $locationButton.removeAttribute("disabled");
    });
  });
});

socket.emit('join',{userName, room} , (error) => {
   if(error) {
    alert(error)
    location.href = '/'
   }
})

socket.on('roomData', ({room, users}) => {
    const html = Mustache.render(sidebarTemplate, {
        room: room,
        users: users
      });
      document.querySelector('#sidebar').innerHTML = html
})