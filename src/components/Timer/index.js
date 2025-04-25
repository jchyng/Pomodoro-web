import React, { useState, useEffect, useCallback } from "react";
import styles from "./Timer.module.css";
import PomodoroSettings from "../PomodoroSettings";
import { FaPlay, FaPause, FaUndo, FaHistory } from "react-icons/fa";
import TodoList from "../TodoList";

const Timer = ({ currentTodos, onTodoToggle, onTodoDelete, onBreakEnd }) => {
  const [workTime, setWorkTime] = useState(0.05);
  const [breakTime, setBreakTime] = useState(0.05);
  const [time, setTime] = useState(workTime * 60);
  const [targetPomodoroCount, setTargetPomodoroCount] = useState(2);
  const [currentPomodoro, setCurrentPomodoro] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [isBreakTime, setIsBreakTime] = useState(false);
  const [isAuto, setIsAuto] = useState(false);
  const [audio] = useState(new Audio("/Blop Sound.mp3"));

  // 알림 권한 요청
  useEffect(() => {
    if ("Notification" in window) {
      Notification.requestPermission();
    }
  }, []);

  const showNotification = useCallback(
    (title, body) => {
      audio.currentTime = 0;
      audio.play().catch((error) => console.log("효과음 재생 실패:", error));

      if ("Notification" in window && Notification.permission === "granted") {
        new Notification(title, { body, icon: "/favicon.ico" });
      }
    },
    [audio]
  );

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
        showNotification(
          "휴식 시간 종료!",
          "다시 작업을 시작할 시간이에요. 화이팅! 💪"
        );
        setTime(workTime * 60);
        setIsBreakTime(false);
        onBreakEnd();
      }
      // 작업 시간 종료
      else {
        showNotification(
          "작업 시간 종료!",
          "잠시 휴식을 취하고 다음 작업을 준비해보세요. 😊"
        );
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
    onBreakEnd,
    audio,
    showNotification,
  ]);

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
      if (!isRunning && !isBreakTime) {
        setTime(value * 60);
      }
    }
  };

  // 휴식 시간 변경 이벤트 핸들러
  const handleBreakTimeChange = (e) => {
    const value = parseInt(e.target.value);
    if (!isNaN(value) && value > 0) {
      setBreakTime(value);
      if (!isRunning && isBreakTime) {
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
        onToggleAuto={() => setIsAuto(!isAuto)}
      />

      <div className={styles.timer}>{formatTime(time)}</div>

      <div className={styles.status}>
        {isBreakTime ? "휴식 시간" : "작업 시간"} ({currentPomodoro}/
        {targetPomodoroCount})
      </div>

      <div className={styles.controls}>
        <button
          onClick={() => setIsRunning(!isRunning)}
          className={styles.button}
          title={isRunning ? "일시정지" : "시작"}
        >
          {isRunning ? <FaPause /> : <FaPlay />}
        </button>

        <button
          onClick={() => {
            setIsRunning(false);
            setTime(isBreakTime ? breakTime * 60 : workTime * 60);
          }}
          className={styles.button}
          title="현재 시간만 초기화"
        >
          <FaUndo />
        </button>

        <button
          onClick={() => {
            setIsRunning(false);
            setTime(workTime * 60);
            setIsBreakTime(false);
            setCurrentPomodoro(0);
          }}
          className={styles.button}
          title="뽀모도로 전체 초기화"
        >
          <FaHistory />
        </button>
      </div>

      <div className={styles.currentWork}>
        <TodoList
          id="current"
          title="현재 작업"
          todos={currentTodos}
          onToggle={onTodoToggle}
          onDelete={onTodoDelete}
          emptyMessage="이번 뽀모도로에서는 어떤 작업을 하실건가요? 🤔"
          hideInput={true}
        />
      </div>
    </div>
  );
};

export default Timer;
