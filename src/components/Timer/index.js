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

const Timer = ({ onBreakEnd }) => {
  const savedSettings = loadSettingsFromStorage();
  const savedTimerState = loadTimerState();

  const [workTime, setWorkTime] = useState(savedSettings.workTime);
  const [breakTime, setBreakTime] = useState(savedSettings.breakTime);
  const [time, setTime] = useState(savedTimerState.time);
  const [targetPomodoro, setTargetPomodoro] = useState(
    savedSettings.targetPomodoro
  );
  const [nowPomodoro, setNowPomodoro] = useState(loadNowPomodoro());
  const [isRunning, setIsRunning] = useState(savedTimerState.isRunning);
  const [isBreakTime, setIsBreakTime] = useState(savedTimerState.isBreakTime);
  const [isAuto, setIsAuto] = useState(savedSettings.isAuto);
  const lastUpdateTimeRef = useRef(Date.now());
  const [displayTime, setDisplayTime] = useState(time);

  // 시간 포맷팅
  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes.toString().padStart(2, "0")}:${remainingSeconds
      .toString()
      .padStart(2, "0")}`;
  };

  // 작업 시간 완료 처리
  const handleWorkComplete = useCallback(() => {
    showNotification(
      "작업 시간 종료!",
      "잠시 휴식을 취하고 다음 작업을 준비해보세요. 😊"
    );

    const newPomodoro = nowPomodoro + 1;
    setNowPomodoro(newPomodoro);
    saveNowPomodoro(newPomodoro);
    setTime(breakTime * 60);
    setIsBreakTime(true);

    // 뽀모도로 완료 이벤트 추적
    sendGAEvent("pomodoro_completed", {
      pomodoro: newPomodoro,
      work_duration: workTime,
    });
  }, [nowPomodoro, workTime, breakTime]);

  // 휴식 시간 완료 처리
  const handleBreakComplete = useCallback(() => {
    showNotification(
      "휴식 시간 종료!",
      "다시 작업을 시작할 시간이에요. 화이팅! 💪"
    );
    setTime(workTime * 60);
    setIsBreakTime(false);
    onBreakEnd();

    // 휴식 시간 종료 이벤트 추적
    sendGAEvent("break_completed", {
      break_duration: breakTime,
    });
  }, [workTime, breakTime, onBreakEnd]);

  //====================  S: Settings 핸들러 =======================//
  // 작업 시간 변경 이벤트 핸들러
  const handleWorkTimeChange = (e) => {
    const value = parseInt(e.target.value);
    if (!isNaN(value) && value > 0) {
      setWorkTime(value);
      if (!isRunning && !isBreakTime) {
        setTime(value * 60);
        setDisplayTime(value * 60);
      }
      // 작업 시간 변경 이벤트만 전송
      sendGAEvent("settings_changed", {
        work_time: value,
      });
    }
  };

  // 휴식 시간 변경 이벤트 핸들러
  const handleBreakTimeChange = (e) => {
    const value = parseInt(e.target.value);
    if (!isNaN(value) && value > 0) {
      setBreakTime(value);
      if (!isRunning && isBreakTime) {
        setTime(value * 60);
        setDisplayTime(value * 60);
      }
      // 휴식 시간 변경 이벤트만 전송
      sendGAEvent("settings_changed", {
        break_time: value,
      });
    }
  };

  // 포모도로 완료 횟수 변경 이벤트 핸들러
  const handleTargetPomodoroChange = (e) => {
    const value = parseInt(e.target.value);
    if (!isNaN(value) && value > 0) {
      setTargetPomodoro(value);
      sendGAEvent("settings_changed", {
        target_pomodoro: value,
      });
    }
  };

  // 자동 시작 설정 변경 핸들러
  const handleAutoToggle = () => {
    const newIsAuto = !isAuto;
    setIsAuto(newIsAuto);
    // 자동 시작 설정 변경 이벤트만 전송
    sendGAEvent("settings_changed", {
      is_auto: newIsAuto,
    });
  };

  //====================  S: controls 핸들러 =======================//
  // 전체 초기화 버튼 핸들러 수정
  const handleFullReset = () => {
    setIsRunning(false);
    setTime(workTime * 60);
    setIsBreakTime(false);
    setNowPomodoro(0);
    saveNowPomodoro(0);
    // 타이머 상태도 초기화
    saveTimerState({
      time: workTime * 60,
      isBreakTime: false,
      isRunning: false,
    });
  };

  // 타이머 시작/일시정지 이벤트 추적
  const handleTimerToggle = () => {
    const newIsRunning = !isRunning;
    setIsRunning(newIsRunning);

    if (newIsRunning) {
      // 타이머 시작 시 정확한 시간 설정
      lastUpdateTimeRef.current = Date.now();
      setDisplayTime(time);
    }

    sendGAEvent("timer_" + (newIsRunning ? "start" : "pause"), {
      is_break: isBreakTime,
      remaining_time: time,
    });
  };

  // 현재 시간 초기화 핸들러
  const handleResetNowTime = () => {
    setIsRunning(false);
    setTime(isBreakTime ? breakTime * 60 : workTime * 60);
  };

  //====================  S:useEffect =======================//
  // 알림 권한 요청
  useEffect(() => {
    requestNotificationPermission();
  }, []);

  // 설정이 변경될 때마다 저장
  useEffect(() => {
    saveSettingsToStorage({
      workTime,
      breakTime,
      targetPomodoro,
      isAuto,
    });
  }, [workTime, breakTime, targetPomodoro, isAuto]);

  // 타이머 상태 저장
  useEffect(() => {
    saveTimerState({
      time,
      isBreakTime,
      isRunning,
    });
  }, [time, isBreakTime, isRunning]);

  // 타이틀 업데이트
  const updateTitle = (remainingTime) => {
    const title = isBreakTime ? "휴식 시간" : "작업 시간";
    document.title = `${formatTime(remainingTime)} - ${title}`;
  };

  // 타이머 상태 업데이트
  const updateTimerState = (remaining) => {
    setTime(remaining);
    setDisplayTime(remaining);
    updateTitle(remaining);
  };

  // 타이머 종료 처리
  const handleTimerComplete = () => {
    updateTimerState(0);
    setIsRunning(false);
  };

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
      timerInterval = setInterval(updateTimer, 100);
    } else {
      updateTimerState(time);
    }

    return () => {
      if (timerInterval) {
        clearInterval(timerInterval);
      }
    };
  }, [isRunning, time, isBreakTime]);

  // 타이머 종료 후 처리
  useEffect(() => {
    if (!isRunning && time <= 0) {
      if (isBreakTime) {
        handleBreakComplete();
      } else {
        handleWorkComplete();
      }

      if (isAuto) {
        const nextTime = isBreakTime ? workTime * 60 : breakTime * 60;
        setTime(nextTime);
        setDisplayTime(nextTime);
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
  ]);

  return (
    <div className={styles.timerContainer}>
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
      <div className={styles.timer}>{formatTime(displayTime)}</div>
      <div className={styles.status}>
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
