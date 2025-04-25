import React, { useState, useEffect } from "react";
import { DndContext, DragOverlay, closestCorners } from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";
import styles from "./PomodoroPage.module.css";
import Timer from "../../components/Timer";
import TodoList from "../../components/TodoList";
import TodoItem from "../../components/TodoList/TodoItem";
import { loadTodosFromStorage, saveTodosToStorage } from "../../utils/storage";

const PomodoroPage = () => {
  const {
    todayTodos: initialToday,
    currentTodos: initialCurrent,
    completedTodos: initialCompleted,
  } = loadTodosFromStorage();

  const [todayTodos, setTodayTodos] = useState(initialToday);
  const [completedTodos, setCompletedTodos] = useState(initialCompleted);
  const [currentTodos, setCurrentTodos] = useState(initialCurrent);
  const [activeId, setActiveId] = useState(null);
  const [activeList, setActiveList] = useState(null);

  // 데이터 변경시 저장
  useEffect(() => {
    saveTodosToStorage(todayTodos, currentTodos, completedTodos);
  }, [todayTodos, currentTodos, completedTodos]);

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
      activeList === "today"
        ? todayTodos
        : activeList === "current"
        ? currentTodos
        : completedTodos
    );

    const overTodoInToday = findTodoById(over.id, todayTodos);
    const overTodoInCurrent = findTodoById(over.id, currentTodos);
    const overTodoInCompleted = findTodoById(over.id, completedTodos);

    const overList = overTodoInToday
      ? "today"
      : overTodoInCurrent
      ? "current"
      : overTodoInCompleted
      ? "completed"
      : over.id;

    if (activeList === overList) {
      // 같은 리스트 내에서 이동
      const todos =
        activeList === "today"
          ? todayTodos
          : activeList === "current"
          ? currentTodos
          : completedTodos;
      const setTodos =
        activeList === "today"
          ? setTodayTodos
          : activeList === "current"
          ? setCurrentTodos
          : setCompletedTodos;

      const oldIndex = todos.findIndex((todo) => todo.id === active.id);
      const newIndex = todos.findIndex((todo) => todo.id === over.id);

      if (oldIndex !== newIndex) {
        setTodos(arrayMove(todos, oldIndex, newIndex));
      }
    } else {
      // 다른 리스트로 이동
      const targetList = overList;
      const targetTodos =
        targetList === "today"
          ? todayTodos
          : targetList === "current"
          ? currentTodos
          : completedTodos;
      const setTargetTodos =
        targetList === "today"
          ? setTodayTodos
          : targetList === "current"
          ? setCurrentTodos
          : setCompletedTodos;
      const setSourceTodos =
        activeList === "today"
          ? setTodayTodos
          : activeList === "current"
          ? setCurrentTodos
          : setCompletedTodos;

      let overIndex;
      if (over.id === targetList) {
        // 빈 리스트로 이동
        overIndex = targetTodos.length;
      } else {
        // 특정 아이템 위로 이동
        overIndex = targetTodos.findIndex((todo) => todo.id === over.id);
      }

      setSourceTodos((prev) => prev.filter((todo) => todo.id !== active.id));
      setTargetTodos((prev) => {
        const newTodos = [...prev];
        // 완료된 할 일 목록으로 이동할 때는 항상 완료 상태로 설정
        const updatedTodo =
          targetList === "completed"
            ? { ...activeTodo, isCompleted: true }
            : { ...activeTodo, isCompleted: false };
        newTodos.splice(overIndex, 0, updatedTodo);
        return newTodos;
      });
    }

    setActiveId(null);
    setActiveList(null);
  };

  const handleTodoToggle = (list, id) => {
    if (list === "current") {
      // 현재 작업 목록의 할 일은 체크만 하고 이동하지 않음
      setCurrentTodos((prev) =>
        prev.map((todo) =>
          todo.id === id ? { ...todo, isCompleted: !todo.isCompleted } : todo
        )
      );
      return;
    }

    if (list === "completed") {
      // 완료된 할 일을 다시 미완료로 - 오늘의 할 일로 이동
      const todo = findTodoById(id, completedTodos);
      if (todo) {
        setCompletedTodos((prev) => prev.filter((t) => t.id !== id));
        setTodayTodos((prev) => [...prev, { ...todo, isCompleted: false }]);
      }
      return;
    }

    if (list === "today") {
      // 오늘의 할 일을 완료 처리 - 완료된 할 일로 이동
      const todo = findTodoById(id, todayTodos);
      if (todo) {
        setTodayTodos((prev) => prev.filter((t) => t.id !== id));
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
    const setTodos =
      list === "today"
        ? setTodayTodos
        : list === "current"
        ? setCurrentTodos
        : setCompletedTodos;
    setTodos((prev) => prev.filter((todo) => todo.id !== id));
  };

  const handleBreakEnd = () => {
    // 현재 작업 목록에서 완료된 항목들을 찾아서 완료된 할 일로 이동
    const completedItems = currentTodos.filter((todo) => todo.isCompleted);
    const remainingItems = currentTodos.filter((todo) => !todo.isCompleted);

    if (completedItems.length > 0) {
      setCurrentTodos(remainingItems);
      setCompletedTodos((prev) => [...prev, ...completedItems]);
    }
  };

  const activeTodo =
    activeId &&
    findTodoById(
      activeId,
      activeList === "today"
        ? todayTodos
        : activeList === "current"
        ? currentTodos
        : completedTodos
    );

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
              onBreakEnd={handleBreakEnd}
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
