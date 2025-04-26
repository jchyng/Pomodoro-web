// Google Analytics 이벤트 전송
export const sendGAEvent = (eventName, eventParams = {}) => {
  if (window.gtag) {
    window.gtag("event", eventName, eventParams);
  }
};

// 페이지뷰 추적
export const sendGAPageView = (page) => {
  if (window.gtag) {
    window.gtag("config", "G-WJ3NJPZ9SG", {
      page_path: page,
    });
  }
};
