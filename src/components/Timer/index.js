import React, { useState, useEffect } from "react";
import styles from "./Timer.module.css";
import PomodoroSettings from "../PomodoroSettings";
import { FaPlay, FaPause, FaUndo, FaHistory } from "react-icons/fa";

const Timer = () => {
  const [workTime, setWorkTime] = useState(0.05);
  const [breakTime, setBreakTime] = useState(0.05);
  const [time, setTime] = useState(workTime * 60);
  const [targetPomodoroCount, setTargetPomodoroCount] = useState(2);
  const [currentPomodoro, setCurrentPomodoro] = useState(0);

  const [isRunning, setIsRunning] = useState(false);
  const [isBreakTime, setIsBreakTime] = useState(false);
  const [isAuto, setIsAuto] = useState(false);

  useEffect(() => {
    let timer;

    // 카운트다운 중
    if (isRunning && time > 0) {
      timer = setInterval(() => {
        setTime((prevTime) => prevTime - 1);
      }, 1000);
    }
    // 카운트다운 종료
    else if (time === 0 && isRunning) {
      if (!isAuto) {
        setIsRunning(false);
      }

      // 휴식 시간 종료
      if (isBreakTime) {
        setTime(workTime * 60);
        setIsBreakTime(false);
      }
      // 작업 시간 종료
      else {
        setCurrentPomodoro((prev) => prev + 1);
        setTime(breakTime * 60);
        setIsBreakTime(true);
      }
    }
    return () => clearInterval(timer);
  }, [
    workTime,
    isRunning,
    time,
    breakTime,
    currentPomodoro,
    targetPomodoroCount,
    isBreakTime,
    isAuto,
  ]);

  const toggleTimer = () => {
    setIsRunning(!isRunning);
  };

  const toggleAuto = () => {
    setIsAuto(!isAuto);
  };

  const initTimer = () => {
    setIsRunning(false);
    setTime(isBreakTime ? breakTime * 60 : workTime * 60);
  };

  const resetTimer = () => {
    setIsRunning(false);
    setTime(workTime * 60);
    setIsBreakTime(false);
    setCurrentPomodoro(0);
  };

  // 시간 포맷팅 => MM:ss
  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, "0")}:${remainingSeconds
      .toString()
      .padStart(2, "0")}`;
  };

  // 작업 시간 변경 이벤트 핸들러
  const handleWorkTimeChange = (e) => {
    const value = parseInt(e.target.value);
    if (!isNaN(value) && value > 0) {
      setWorkTime(value);
      if (!isRunning) {
        setTime(value * 60);
      }
    }
  };

  // 휴식 시간 변경 이벤트 핸들러
  const handleBreakTimeChange = (e) => {
    const value = parseInt(e.target.value);
    if (!isNaN(value) && value > 0) {
      setBreakTime(value);
      if (isRunning) {
        setTime(value * 60);
      }
    }
  };

  // 포모도로 완료 횟수 변경 이벤트 핸들러
  const handleTargetPomodoroCountChange = (e) => {
    const value = parseInt(e.target.value);
    if (!isNaN(value) && value > 0) {
      setTargetPomodoroCount(value);
    }
  };

  return (
    <div className={styles.timerContainer}>
      <PomodoroSettings
        workTime={workTime}
        breakTime={breakTime}
        targetPomodoroCount={targetPomodoroCount}
        onWorkTimeChange={handleWorkTimeChange}
        onBreakTimeChange={handleBreakTimeChange}
        onTargetPomodoroCountChange={handleTargetPomodoroCountChange}
        isRunning={isRunning}
        isAuto={isAuto}
        onToggleAuto={toggleAuto}
      />

      <div className={styles.timer}>{formatTime(time)}</div>

      <div className={styles.status}>
        {isBreakTime ? "휴식 시간" : "작업 시간"} ({currentPomodoro}/
        {targetPomodoroCount})
      </div>

      <div className={styles.controls}>
        <button
          onClick={toggleTimer}
          className={styles.button}
          title={isRunning ? "일시정지" : "시작"}
        >
          {isRunning ? <FaPause /> : <FaPlay />}
        </button>

        <button
          onClick={initTimer}
          className={styles.button}
          title="현재 시간만 초기화"
        >
          <FaUndo />
        </button>

        <button
          onClick={resetTimer}
          className={styles.button}
          title="뽀모도로 전체 초기화"
        >
          <FaHistory />
        </button>
      </div>
    </div>
  );
};

export default Timer;
