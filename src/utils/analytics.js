// Google Analytics 이벤트 전송
export const sendGAEvent = (eventName, eventParams = {}) => {
  if (window.gtag) {
    window.gtag("event", eventName, eventParams);
  }
};

// 페이지뷰 추적 - process.env.환경변수명
export const sendGAPageView = (page) => {
  if (window.gtag) {
    window.gtag("config", process.env.REACT_APP_GA_MEASUREMENT_ID, {
      page_path: page,
    });
  }
};
