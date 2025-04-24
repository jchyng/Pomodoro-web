import React from "react";
import styles from "./TimerPage.module.css";
import Timer from "../../components/Timer";

const TimerPage = () => {
  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <div className={styles.timerSection}>
          <Timer />
        </div>
      </div>
    </div>
  );
};

export default TimerPage;
