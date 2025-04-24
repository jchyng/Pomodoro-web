import React, { useState } from "react";
import styles from "./TimerPage.module.css";
import Timer from "../../components/Timer";
import TodoList from "../../components/TodoList";

const TimerPage = () => {
  const [todayTodos, setTodayTodos] = useState([
    { id: 1, content: "프로젝트 기획서 작성", isCompleted: false },
    { id: 2, content: "디자인 시스템 구축", isCompleted: false },
    { id: 3, content: "API 연동", isCompleted: false },
  ]);

  const [currentTodos, setCurrentTodos] = useState([
    { id: 1, content: "프로젝트 기획서 작성", isCompleted: false },
  ]);

  const handleTodayTodoToggle = (id) => {
    setTodayTodos((prev) =>
      prev.map((todo) =>
        todo.id === id ? { ...todo, isCompleted: !todo.isCompleted } : todo
      )
    );
  };

  const handleCurrentTodoToggle = (id) => {
    setCurrentTodos((prev) =>
      prev.map((todo) =>
        todo.id === id ? { ...todo, isCompleted: !todo.isCompleted } : todo
      )
    );
  };

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <div className={styles.timerSection}>
          <Timer />
        </div>
        <div className={styles.todoSection}>
          <TodoList
            title="오늘의 할 일"
            todos={todayTodos}
            onToggle={handleTodayTodoToggle}
          />
          <TodoList
            title="현재 작업"
            todos={currentTodos}
            onToggle={handleCurrentTodoToggle}
          />
        </div>
      </div>
    </div>
  );
};

export default TimerPage;
