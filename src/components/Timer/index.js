import React, { useState, useEffect } from "react";
import styles from "./Timer.module.css";
import PomodoroSettings from "../PomodoroSettings";
import { FaPlay, FaPause, FaUndo, FaHistory } from "react-icons/fa";
import TodoList from "../TodoList";
import {
  showNotification,
  requestNotificationPermission,
} from "../../utils/notification";
import {
  saveSettingsToStorage,
  loadSettingsFromStorage,
  saveCurrentPomodoroCount,
  loadCurrentPomodoroCount,
  saveTimerState,
  loadTimerState,
} from "../../utils/storage";
import { sendGAEvent } from "../../utils/analytics";

const Timer = ({ currentTodos, onTodoToggle, onTodoDelete, onBreakEnd }) => {
  const savedSettings = loadSettingsFromStorage();
  const savedTimerState = loadTimerState();

  const [workTime, setWorkTime] = useState(savedSettings.workTime);
  const [breakTime, setBreakTime] = useState(savedSettings.breakTime);
  const [time, setTime] = useState(savedTimerState.time);
  const [targetPomodoroCount, setTargetPomodoroCount] = useState(
    savedSettings.targetPomodoroCount
  );
  const [currentPomodoro, setCurrentPomodoro] = useState(
    loadCurrentPomodoroCount()
  );
  const [isRunning, setIsRunning] = useState(savedTimerState.isRunning);
  const [isBreakTime, setIsBreakTime] = useState(savedTimerState.isBreakTime);
  const [isAuto, setIsAuto] = useState(savedSettings.isAuto);

  // 설정이 변경될 때마다 저장
  useEffect(() => {
    saveSettingsToStorage({
      workTime,
      breakTime,
      targetPomodoroCount,
      isAuto,
    });
  }, [workTime, breakTime, targetPomodoroCount, isAuto]);

  useEffect(() => {
    requestNotificationPermission();
  }, []);

  useEffect(() => {
    let timer;

    if (isRunning && time > 0) {
      timer = setInterval(() => {
        setTime((prevTime) => {
          const newTime = prevTime - 1;
          return newTime;
        });
      }, 1000);
    } else if (time === 0 && isRunning) {
      if (!isAuto) {
        setIsRunning(false);
      }

      if (isBreakTime) {
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
      } else {
        showNotification(
          "작업 시간 종료!",
          "잠시 휴식을 취하고 다음 작업을 준비해보세요. 😊"
        );
        const newPomodoroCount = currentPomodoro + 1;
        setCurrentPomodoro(newPomodoroCount);
        saveCurrentPomodoroCount(newPomodoroCount);
        setTime(breakTime * 60);
        setIsBreakTime(true);

        // 뽀모도로 완료 이벤트 추적
        sendGAEvent("pomodoro_completed", {
          pomodoro_count: newPomodoroCount,
          work_duration: workTime,
        });
      }
    }
    return () => clearInterval(timer);
  }, [
    workTime,
    isRunning,
    time,
    breakTime,
    currentPomodoro,
    isBreakTime,
    isAuto,
    onBreakEnd,
  ]);

  // 타이머 상태 저장
  useEffect(() => {
    saveTimerState({
      time,
      isBreakTime,
      isRunning,
    });
  }, [time, isBreakTime, isRunning]);

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
        // 타이머 상태 업데이트
        saveTimerState({
          time: value * 60,
          isBreakTime,
          isRunning,
        });
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

  // 전체 초기화 버튼 핸들러 수정
  const handleFullReset = () => {
    setIsRunning(false);
    setTime(workTime * 60);
    setIsBreakTime(false);
    setCurrentPomodoro(0);
    saveCurrentPomodoroCount(0);
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

    sendGAEvent("timer_" + (newIsRunning ? "start" : "pause"), {
      is_break: isBreakTime,
      remaining_time: time,
    });
  };

  // 설정 변경 이벤트 추적
  const handleSettingsChange = () => {
    sendGAEvent("settings_changed", {
      work_time: workTime,
      break_time: breakTime,
      target_count: targetPomodoroCount,
      is_auto: isAuto,
    });
  };

  return (
    <div className={styles.timerContainer}>
      <PomodoroSettings
        workTime={workTime}
        breakTime={breakTime}
        targetPomodoroCount={targetPomodoroCount}
        onWorkTimeChange={(e) => {
          handleWorkTimeChange(e);
          handleSettingsChange();
        }}
        onBreakTimeChange={(e) => {
          handleBreakTimeChange(e);
          handleSettingsChange();
        }}
        onTargetPomodoroCountChange={(e) => {
          handleTargetPomodoroCountChange(e);
          handleSettingsChange();
        }}
        onToggleAuto={() => {
          setIsAuto(!isAuto);
          handleSettingsChange();
        }}
        isRunning={isRunning}
        isAuto={isAuto}
      />

      <div className={styles.timer}>{formatTime(time)}</div>

      <div className={styles.status}>
        {isBreakTime ? "휴식 시간" : "작업 시간"} ({currentPomodoro}/
        {targetPomodoroCount})
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
          onClick={handleFullReset}
          className={styles.button}
          title="뽀모도로 전체 초기화"
        >
          <FaHistory />
        </button>
      </div>

      <div className={styles.currentWork}>
        <TodoList
          id="now"
          title="진행 중인 작업"
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
