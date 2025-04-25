const notificationSound = new Audio("/Blop Sound.mp3");

export const requestNotificationPermission = async () => {
  if ("Notification" in window) {
    await Notification.requestPermission();
  }
};

export const showNotification = (title, body) => {
  notificationSound.currentTime = 0;
  notificationSound
    .play()
    .catch((error) => console.log("효과음 재생 실패:", error));

  if ("Notification" in window && Notification.permission === "granted") {
    new Notification(title, {
      body,
      icon: "/favicon.ico",
    });
  }
};
