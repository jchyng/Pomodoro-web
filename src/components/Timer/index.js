import React, { useState, useEffect, useCallback, useRef } from "react";
import styles from "./Timer.module.css";
import PomodoroSettings from "../PomodoroSettings";
import { FaPlay, FaPause, FaUndo, FaHistory } from "react-icons/fa";
import {
  showNotification,
  requestNotificationPermission,
  saveSettingsToStorage,
  loadSettingsFromStorage,
  saveNowPomodoro,
  loadNowPomodoro,
  saveTimerState,
  loadTimerState,
  sendGAEvent,
} from "../../utils";

// 상수 정의
const TIMER_UPDATE_INTERVAL = 100;
const NOTIFICATION_MESSAGES = {
  WORK_COMPLETE: {
    title: "작업 시간 종료!",
    message: "잠시 휴식을 취하고 다음 작업을 준비해보세요. 😊",
  },
  BREAK_COMPLETE: {
    title: "휴식 시간 종료!",
    message: "다시 작업을 시작할 시간이에요. 화이팅! 💪",
  },
};

// 설정 관련 훅
const useTimerSettings = () => {
  const savedSettings = loadSettingsFromStorage();
  const [workTime, setWorkTime] = useState(savedSettings.workTime);
  const [breakTime, setBreakTime] = useState(savedSettings.breakTime);
  const [targetPomodoro, setTargetPomodoro] = useState(
    savedSettings.targetPomodoro
  );
  const [isAuto, setIsAuto] = useState(savedSettings.isAuto);

  useEffect(() => {
    saveSettingsToStorage({
      workTime,
      breakTime,
      targetPomodoro,
      isAuto,
    });
  }, [workTime, breakTime, targetPomodoro, isAuto]);

  return {
    workTime,
    setWorkTime,
    breakTime,
    setBreakTime,
    targetPomodoro,
    setTargetPomodoro,
    isAuto,
    setIsAuto,
  };
};

// 타이머 상태 관련 훅
const useTimerState = (workTime, breakTime) => {
  const savedTimerState = loadTimerState();
  const [time, setTime] = useState(savedTimerState.time);
  const [isRunning, setIsRunning] = useState(savedTimerState.isRunning);
  const [isBreakTime, setIsBreakTime] = useState(savedTimerState.isBreakTime);
  const [nowPomodoro, setNowPomodoro] = useState(loadNowPomodoro());
  const [displayTime, setDisplayTime] = useState(time);
  const lastUpdateTimeRef = useRef(Date.now());

  useEffect(() => {
    saveTimerState({
      time,
      isBreakTime,
      isRunning,
    });
  }, [time, isBreakTime, isRunning]);

  return {
    time,
    setTime,
    isRunning,
    setIsRunning,
    isBreakTime,
    setIsBreakTime,
    nowPomodoro,
    setNowPomodoro,
    displayTime,
    setDisplayTime,
    lastUpdateTimeRef,
  };
};

const Timer = ({ onBreakEnd }) => {
  const {
    workTime,
    setWorkTime,
    breakTime,
    setBreakTime,
    targetPomodoro,
    setTargetPomodoro,
    isAuto,
    setIsAuto,
  } = useTimerSettings();

  const {
    time,
    setTime,
    isRunning,
    setIsRunning,
    isBreakTime,
    setIsBreakTime,
    nowPomodoro,
    setNowPomodoro,
    displayTime,
    setDisplayTime,
    lastUpdateTimeRef,
  } = useTimerState(workTime, breakTime);

  // 시간 포맷팅
  const formatTime = useCallback((seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes.toString().padStart(2, "0")}:${remainingSeconds
      .toString()
      .padStart(2, "0")}`;
  }, []);

  // 작업 시간 완료 처리
  const handleWorkComplete = useCallback(() => {
    showNotification(
      NOTIFICATION_MESSAGES.WORK_COMPLETE.title,
      NOTIFICATION_MESSAGES.WORK_COMPLETE.message
    );

    const newPomodoro = nowPomodoro + 1;
    setNowPomodoro(newPomodoro);
    saveNowPomodoro(newPomodoro);
    setTime(breakTime * 60);
    setIsBreakTime(true);

    sendGAEvent("pomodoro_completed", {
      pomodoro: newPomodoro,
      work_duration: workTime,
    });
  }, [
    nowPomodoro,
    workTime,
    breakTime,
    setNowPomodoro,
    setTime,
    setIsBreakTime,
  ]);

  // 휴식 시간 완료 처리
  const handleBreakComplete = useCallback(() => {
    showNotification(
      NOTIFICATION_MESSAGES.BREAK_COMPLETE.title,
      NOTIFICATION_MESSAGES.BREAK_COMPLETE.message
    );
    setTime(workTime * 60);
    setIsBreakTime(false);
    onBreakEnd();

    sendGAEvent("break_completed", {
      break_duration: breakTime,
    });
  }, [workTime, breakTime, onBreakEnd, setTime, setIsBreakTime]);

  // 설정 변경 핸들러
  const handleWorkTimeChange = useCallback(
    (e) => {
      const value = parseInt(e.target.value);
      if (!isNaN(value) && value > 0) {
        setWorkTime(value);
        if (!isRunning && !isBreakTime) {
          setTime(value * 60);
          setDisplayTime(value * 60);
        }
        sendGAEvent("settings_changed", { work_time: value });
      }
    },
    [isRunning, isBreakTime, setWorkTime, setTime, setDisplayTime]
  );

  const handleBreakTimeChange = useCallback(
    (e) => {
      const value = parseInt(e.target.value);
      if (!isNaN(value) && value > 0) {
        setBreakTime(value);
        if (!isRunning && isBreakTime) {
          setTime(value * 60);
          setDisplayTime(value * 60);
        }
        sendGAEvent("settings_changed", { break_time: value });
      }
    },
    [isRunning, isBreakTime, setBreakTime, setTime, setDisplayTime]
  );

  const handleTargetPomodoroChange = useCallback(
    (e) => {
      const value = parseInt(e.target.value);
      if (!isNaN(value) && value > 0) {
        setTargetPomodoro(value);
        sendGAEvent("settings_changed", { target_pomodoro: value });
      }
    },
    [setTargetPomodoro]
  );

  const handleAutoToggle = useCallback(() => {
    const newIsAuto = !isAuto;
    setIsAuto(newIsAuto);
    sendGAEvent("settings_changed", { is_auto: newIsAuto });
  }, [isAuto, setIsAuto]);

  // 타이머 컨트롤 핸들러
  const handleFullReset = useCallback(() => {
    setIsRunning(false);
    setTime(workTime * 60);
    setIsBreakTime(false);
    setNowPomodoro(0);
    saveNowPomodoro(0);
    saveTimerState({
      time: workTime * 60,
      isBreakTime: false,
      isRunning: false,
    });
  }, [workTime, setIsRunning, setTime, setIsBreakTime, setNowPomodoro]);

  const handleTimerToggle = useCallback(() => {
    const newIsRunning = !isRunning;
    setIsRunning(newIsRunning);

    if (newIsRunning) {
      lastUpdateTimeRef.current = Date.now();
      setDisplayTime(time);
    }

    sendGAEvent("timer_" + (newIsRunning ? "start" : "pause"), {
      is_break: isBreakTime,
      remaining_time: time,
    });
  }, [
    isRunning,
    isBreakTime,
    time,
    setIsRunning,
    lastUpdateTimeRef,
    setDisplayTime,
  ]);

  const handleResetNowTime = useCallback(() => {
    setIsRunning(false);
    setTime(isBreakTime ? breakTime * 60 : workTime * 60);
  }, [isBreakTime, breakTime, workTime, setIsRunning, setTime]);

  // 타이틀 업데이트
  const updateTitle = useCallback(
    (remainingTime) => {
      const title = isBreakTime ? "휴식 시간" : "작업 시간";
      document.title = `${formatTime(remainingTime)} - ${title}`;
    },
    [isBreakTime, formatTime]
  );

  // 타이머 상태 업데이트
  const updateTimerState = useCallback(
    (remaining) => {
      setTime(remaining);
      setDisplayTime(remaining);
      updateTitle(remaining);
    },
    [updateTitle, setTime, setDisplayTime]
  );

  // 타이머 종료 처리
  const handleTimerComplete = useCallback(() => {
    updateTimerState(0);
    setIsRunning(false);
  }, [updateTimerState, setIsRunning]);

  // 알림 권한 요청
  useEffect(() => {
    requestNotificationPermission();
  }, []);

  // 타이머 실행
  useEffect(() => {
    let timerInterval;
    let startTime = Date.now();
    let expectedTime = time;

    const updateTimer = () => {
      const now = Date.now();
      const elapsed = (now - startTime) / 1000;
      const remaining = Math.max(0, expectedTime - elapsed);

      if (isRunning && remaining > 0) {
        updateTimerState(remaining);
      } else if (isRunning && remaining <= 0) {
        handleTimerComplete();
      }
    };

    if (isRunning && time > 0) {
      startTime = Date.now();
      expectedTime = time;
      updateTimerState(time);
      timerInterval = setInterval(updateTimer, TIMER_UPDATE_INTERVAL);
    } else {
      updateTimerState(time);
    }

    return () => {
      if (timerInterval) {
        clearInterval(timerInterval);
      }
    };
  }, [isRunning, time, isBreakTime, updateTimerState, handleTimerComplete]);

  // 타이머 종료 후 처리
  useEffect(() => {
    if (!isRunning && time <= 0) {
      if (isBreakTime) {
        handleBreakComplete();
      } else {
        handleWorkComplete();
      }

      if (nowPomodoro === targetPomodoro) {
        setIsAuto(false);
      } else if (isAuto) {
        const nextTime = isBreakTime ? workTime * 60 : breakTime * 60;
        setTime(nextTime);
        setDisplayTime(nextTime);
        lastUpdateTimeRef.current = Date.now();
        setIsRunning(true);
      }
    }
  }, [
    isRunning,
    time,
    isBreakTime,
    isAuto,
    handleBreakComplete,
    handleWorkComplete,
    workTime,
    breakTime,
    nowPomodoro,
    targetPomodoro,
    setIsAuto,
    setTime,
    setDisplayTime,
    lastUpdateTimeRef,
    setIsRunning,
  ]);

  // 프로그레스 계산
  const calculateProgress = useCallback(() => {
    const totalTime = isBreakTime ? breakTime * 60 : workTime * 60;
    return (time / totalTime) * 100;
  }, [isBreakTime, breakTime, workTime, time]);

  // SVG 원형 프로그레스 바 컴포넌트
  const CircularProgress = useCallback(() => {
    const progress = calculateProgress();
    const radius = 140;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (progress / 100) * circumference;

    return (
      <svg className={styles.progressRing} width="350" height="350">
        <circle
          className={styles.progressRingCircleBackground}
          strokeWidth="12"
          stroke="currentColor"
          fill="transparent"
          r={radius}
          cx="175"
          cy="175"
        />
        <circle
          className={`${styles.progressRingCircle} ${
            isRunning
              ? isBreakTime
                ? styles.break
                : styles.work
              : styles.paused
          }`}
          strokeWidth="12"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          stroke="currentColor"
          fill="transparent"
          r={radius}
          cx="175"
          cy="175"
        />
      </svg>
    );
  }, [isRunning, isBreakTime, calculateProgress]);

  return (
    <div
      className={`${styles.timerContainer} ${
        isRunning ? (isBreakTime ? styles.break : styles.work) : styles.paused
      }`}
    >
      <PomodoroSettings
        workTime={workTime}
        breakTime={breakTime}
        targetPomodoro={targetPomodoro}
        onWorkTimeChange={handleWorkTimeChange}
        onBreakTimeChange={handleBreakTimeChange}
        onTargetPomodoroChange={handleTargetPomodoroChange}
        onToggleAuto={handleAutoToggle}
        isRunning={isRunning}
        isAuto={isAuto}
      />
      <div className={styles.timerWrapper}>
        <CircularProgress />
        <div
          className={`${styles.timer} ${
            isRunning
              ? isBreakTime
                ? styles.break
                : styles.work
              : styles.paused
          }`}
        >
          {formatTime(displayTime)}
        </div>
      </div>
      <div
        className={`${styles.status} ${
          isRunning ? (isBreakTime ? styles.break : styles.work) : styles.paused
        }`}
      >
        {isBreakTime ? "휴식 시간" : "작업 시간"} ({nowPomodoro}/
        {targetPomodoro})
      </div>
      <div className={styles.controls}>
        <button
          onClick={handleTimerToggle}
          className={styles.button}
          title={isRunning ? "일시정지" : "시작"}
        >
          {isRunning ? <FaPause /> : <FaPlay />}
        </button>
        <button
          onClick={handleResetNowTime}
          className={styles.button}
          title="현재 시간만 초기화"
        >
          <FaUndo />
        </button>
        <button
          onClick={handleFullReset}
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
