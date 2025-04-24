import React from "react";
import styles from "./PomodoroSettings.module.css";

const PomodoroInput = ({ label, value, onChange, disabled }) => (
  <div className={styles.settingGroup}>
    <label>{label}</label>
    <input
      type="number"
      value={value}
      onChange={onChange}
      min="1"
      disabled={disabled}
    />
  </div>
);

const PomodoroSettings = ({
  workTime,
  breakTime,
  targetPomodoroCount,
  onWorkTimeChange,
  onBreakTimeChange,
  onTargetPomodoroCountChange,
  isRunning,
  isAuto,
  onToggleAuto,
}) => (
  <div className={styles.settings}>
    <PomodoroInput
      label="작업 시간"
      value={workTime}
      onChange={onWorkTimeChange}
      disabled={isRunning}
    />
    <PomodoroInput
      label="휴식 시간"
      value={breakTime}
      onChange={onBreakTimeChange}
      disabled={isRunning}
    />
    <PomodoroInput
      label="목표 횟수"
      value={targetPomodoroCount}
      onChange={onTargetPomodoroCountChange}
      disabled={isRunning}
    />
    <div className={styles.settingGroup}>
      <label>자동 실행</label>
      <label className={styles.toggleSwitch}>
        <input
          type="checkbox"
          checked={isAuto}
          onChange={onToggleAuto}
          disabled={isRunning}
        />
        <span className={styles.toggleSlider}></span>
      </label>
    </div>
  </div>
);

export default PomodoroSettings;
