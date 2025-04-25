import React, { useState } from "react";
import { DndContext, DragOverlay, closestCorners } from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";
import styles from "./PomodoroPage.module.css";
import Timer from "../../components/Timer";
import TodoList from "../../components/TodoList";
import TodoItem from "../../components/TodoList/TodoItem";

const PomodoroPage = () => {
  const [todayTodos, setTodayTodos] = useState([
    { id: 1, content: "프로젝트 기획서 작성", isCompleted: false },
    { id: 2, content: "디자인 시스템 구축", isCompleted: false },
    { id: 3, content: "API 연동", isCompleted: false },
  ]);

  const [completedTodos, setCompletedTodos] = useState([]);
  const [currentTodos, setCurrentTodos] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [activeList, setActiveList] = useState(null);

  const findTodoById = (id, list) => list.find((todo) => todo.id === id);
  const findListByTodoId = (id) => {
    if (findTodoById(id, todayTodos)) return "today";
    if (findTodoById(id, currentTodos)) return "current";
    if (findTodoById(id, completedTodos)) return "completed";
    return null;
  };

  const handleDragStart = (event) => {
    const { active } = event;
    setActiveId(active.id);
    setActiveList(findListByTodoId(active.id));
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;

    if (!over) {
      setActiveId(null);
      setActiveList(null);
      return;
    }

    const activeTodo = findTodoById(
      active.id,
      activeList === "today" ? todayTodos : currentTodos
    );
    const overTodoInToday = findTodoById(over.id, todayTodos);
    const overTodoInCurrent = findTodoById(over.id, currentTodos);
    const overList = overTodoInToday
      ? "today"
      : overTodoInCurrent
      ? "current"
      : over.id;

    if (activeList === overList) {
      // 같은 리스트 내에서 이동
      const todos = activeList === "today" ? todayTodos : currentTodos;
      const oldIndex = todos.findIndex((todo) => todo.id === active.id);
      const newIndex = todos.findIndex((todo) => todo.id === over.id);

      if (oldIndex !== newIndex) {
        const newTodos = arrayMove(todos, oldIndex, newIndex);
        if (activeList === "today") {
          setTodayTodos(newTodos);
        } else {
          setCurrentTodos(newTodos);
        }
      }
    } else {
      // 다른 리스트로 이동
      const targetList = overList;
      const targetTodos = targetList === "today" ? todayTodos : currentTodos;
      let overIndex;

      if (over.id === targetList) {
        // 빈 리스트로 이동
        overIndex = targetTodos.length;
      } else {
        // 특정 아이템 위로 이동
        overIndex = targetTodos.findIndex((todo) => todo.id === over.id);
      }

      if (activeList === "today") {
        setTodayTodos((prev) => prev.filter((todo) => todo.id !== active.id));
        setCurrentTodos((prev) => {
          const newTodos = [...prev];
          newTodos.splice(overIndex, 0, activeTodo);
          return newTodos;
        });
      } else {
        setCurrentTodos((prev) => prev.filter((todo) => todo.id !== active.id));
        setTodayTodos((prev) => {
          const newTodos = [...prev];
          newTodos.splice(overIndex, 0, activeTodo);
          return newTodos;
        });
      }
    }

    setActiveId(null);
    setActiveList(null);
  };

  const handleTodoToggle = (list, id) => {
    const setTodos = list === "today" ? setTodayTodos : setCurrentTodos;
    const todo = findTodoById(id, list === "today" ? todayTodos : currentTodos);

    if (todo) {
      if (todo.isCompleted) {
        // 완료 취소
        setTodos((prev) =>
          prev.map((t) => (t.id === id ? { ...t, isCompleted: false } : t))
        );
      } else {
        // 완료 처리
        setTodos((prev) => prev.filter((t) => t.id !== id));
        setCompletedTodos((prev) => [...prev, { ...todo, isCompleted: true }]);
      }
    }
  };

  const handleTodoAdd = (list, content) => {
    const setTodos = list === "today" ? setTodayTodos : setCurrentTodos;
    setTodos((prev) => [
      ...prev,
      { id: Date.now(), content, isCompleted: false },
    ]);
  };

  const handleTodoDelete = (list, id) => {
    const setTodos = list === "today" ? setTodayTodos : setCurrentTodos;
    setTodos((prev) => prev.filter((todo) => todo.id !== id));
  };

  const activeTodo =
    activeId &&
    findTodoById(activeId, activeList === "today" ? todayTodos : currentTodos);

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <DndContext
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
          collisionDetection={closestCorners}
        >
          <div className={styles.timerSection}>
            <Timer
              currentTodos={currentTodos}
              onTodoToggle={(id) => handleTodoToggle("current", id)}
              onTodoDelete={(id) => handleTodoDelete("current", id)}
            />
          </div>
          <div className={styles.todoSection}>
            <TodoList
              id="today"
              title="오늘의 할 일"
              todos={todayTodos}
              onToggle={(id) => handleTodoToggle("today", id)}
              onAdd={(content) => handleTodoAdd("today", content)}
              onDelete={(id) => handleTodoDelete("today", id)}
              emptyMessage="야호! 할 일을 모두 끝냈어요 👏👏"
            />
            <TodoList
              id="completed"
              title="완료된 할 일"
              todos={completedTodos}
              onToggle={(id) => handleTodoToggle("completed", id)}
              onDelete={(id) => handleTodoDelete("completed", id)}
              emptyMessage="아직 완료된 할 일이 없어요 😅"
              hideInput={true}
            />
          </div>
          <DragOverlay
            dropAnimation={{
              duration: 200,
              easing: "cubic-bezier(0.18, 0.67, 0.6, 1.22)",
              scale: 1.05,
            }}
          >
            {activeId && activeTodo ? (
              <TodoItem
                id={activeTodo.id}
                content={activeTodo.content}
                isCompleted={activeTodo.isCompleted}
              />
            ) : null}
          </DragOverlay>
        </DndContext>
      </div>
    </div>
  );
};

export default PomodoroPage;
