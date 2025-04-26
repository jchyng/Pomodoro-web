import React, { useEffect } from "react";

const AdComponent = ({ adSlot }) => {
  useEffect(() => {
    try {
      // AdSense가 로드되었는지 확인
      if (window.adsbygoogle) {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
      }
    } catch (err) {
      console.error("AdSense 로드 실패:", err);
    }
  }, []);

  return (
    <ins
      className="adsbygoogle"
      style={{ display: "block" }}
      data-ad-client="ca-pub-9941289231330540"
      data-ad-slot={adSlot}
      data-ad-format="auto"
      data-full-width-responsive="true"
    />
  );
};

export default AdComponent;
