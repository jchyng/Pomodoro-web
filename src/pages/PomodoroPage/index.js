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
    nowTodos: initialNow,
    completedTodos: initialCompleted,
  } = loadTodosFromStorage();

  const [todayTodos, setTodayTodos] = useState(initialToday);
  const [completedTodos, setCompletedTodos] = useState(initialCompleted);
  const [nowTodos, setNowTodos] = useState(initialNow);
  const [activeId, setActiveId] = useState(null);
  const [activeList, setActiveList] = useState(null);

  const todoListMap = {
    today: {
      todos: todayTodos,
      setTodos: setTodayTodos,
    },
    now: {
      todos: nowTodos,
      setTodos: setNowTodos,
    },
    completed: {
      todos: completedTodos,
      setTodos: setCompletedTodos,
    },
  };

  // TodoList 데이터 변경 시 저장
  useEffect(() => {
    saveTodosToStorage(todayTodos, nowTodos, completedTodos);
  }, [todayTodos, nowTodos, completedTodos]);

  const findTodoById = (id, list) => list.find((todo) => todo.id === id);

  const findListByTodoId = (id) => {
    if (findTodoById(id, todayTodos)) return "today";
    if (findTodoById(id, nowTodos)) return "now";
    if (findTodoById(id, completedTodos)) return "completed";
    return null;
  };

  const handleDragStart = (event) => {
    const { active } = event;
    setActiveId(active.id);
    setActiveList(findListByTodoId(active.id));
  };

  const getOverList = (over) => {
    let overList;
    for (const [listType, { todos }] of Object.entries(todoListMap)) {
      if (findTodoById(over.id, todos)) {
        overList = listType;
        break;
      }
    }
    return overList || over.id;
  };

  const handleSameListMove = (activeList, active, over) => {
    const { todos, setTodos } = todoListMap[activeList];
    const oldIndex = todos.findIndex((todo) => todo.id === active.id);
    const newIndex = todos.findIndex((todo) => todo.id === over.id);

    if (oldIndex !== newIndex) {
      setTodos(arrayMove(todos, oldIndex, newIndex));
    }
  };

  const handleDifferentListMove = (
    activeList,
    overList,
    active,
    over,
    activeTodo
  ) => {
    const { todos: targetTodos, setTodos: setTargetTodos } =
      todoListMap[overList];
    const { setTodos: setSourceTodos } = todoListMap[activeList];

    let overIndex;
    if (over.id === overList) {
      // 빈 리스트로 이동
      overIndex = targetTodos.length;
    } else {
      // 특정 아이템 위로 이동
      overIndex = targetTodos.findIndex((todo) => todo.id === over.id);
    }

    setSourceTodos((prev) => prev.filter((todo) => todo.id !== active.id));
    setTargetTodos((prev) => {
      const newTodos = [...prev];
      const updatedTodo = {
        ...activeTodo,
        isCompleted: overList === "completed",
      };
      newTodos.splice(overIndex, 0, updatedTodo);
      return newTodos;
    });
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;

    // 드래그가 취소되거나 유효하지 않은 위치에 놓인 경우
    if (!over) {
      setActiveId(null);
      setActiveList(null);
      return;
    }

    // 현재 드래그 중인 아이템
    const activeTodo = findTodoById(active.id, todoListMap[activeList]?.todos);
    const overList = getOverList(over);

    // 같은 리스트 내에서 순서 변경
    if (activeList === overList) {
      handleSameListMove(activeList, active, over);
    }
    // 다른 리스트로 이동
    else {
      handleDifferentListMove(activeList, overList, active, over, activeTodo);
    }

    setActiveId(null);
    setActiveList(null);
  };

  const handleTodoToggle = (list, id) => {
    if (list === "now") {
      // 진행 중인 작업 목록의 작업은 체크만 하고 이동하지 않음
      setNowTodos((prev) =>
        prev.map((todo) =>
          todo.id === id ? { ...todo, isCompleted: !todo.isCompleted } : todo
        )
      );
      return;
    }

    if (list === "completed") {
      // 완료된 작업을 다시 미완료로 - 오늘 할 작업으로 이동
      const todo = findTodoById(id, completedTodos);
      if (todo) {
        setCompletedTodos((prev) => prev.filter((t) => t.id !== id));
        setTodayTodos((prev) => [...prev, { ...todo, isCompleted: false }]);
      }
      return;
    }

    if (list === "today") {
      // 오늘 할 작업을 완료 처리 - 완료된 작업으로 이동
      const todo = findTodoById(id, todayTodos);
      if (todo) {
        setTodayTodos((prev) => prev.filter((t) => t.id !== id));
        setCompletedTodos((prev) => [...prev, { ...todo, isCompleted: true }]);
      }
    }
  };

  const handleTodoAdd = (list, content) => {
    const setTodos = list === "today" ? setTodayTodos : setNowTodos;
    setTodos((prev) => [
      ...prev,
      { id: Date.now(), content, isCompleted: false },
    ]);
  };

  const handleTodoDelete = (list, id) => {
    const setTodos =
      list === "today"
        ? setTodayTodos
        : list === "now"
        ? setNowTodos
        : setCompletedTodos;
    setTodos((prev) => prev.filter((todo) => todo.id !== id));
  };

  // 뽀모도로 휴식 시간 종료 시 진행 중인 작업 목록에서 완료된 항목들을 완료된 작업 목록으로 이동
  const handleBreakEnd = () => {
    const completedItems = nowTodos.filter((todo) => todo.isCompleted);
    const remainingItems = nowTodos.filter((todo) => !todo.isCompleted);

    if (completedItems.length > 0) {
      setNowTodos(remainingItems);
      setCompletedTodos((prev) => [...prev, ...completedItems]);
    }
  };

  const handleTodoMove = (list, id) => {
    if (list === "today") {
      // 오늘 할 작업에서 진행 중인 작업으로 이동
      const todo = findTodoById(id, todayTodos);
      if (todo) {
        setTodayTodos((prev) => prev.filter((t) => t.id !== id));
        setNowTodos((prev) => [...prev, todo]);
      }
    } else if (list === "now") {
      // 진행 중인 작업에서 오늘 할 작업으로 이동
      const todo = findTodoById(id, nowTodos);
      if (todo) {
        setNowTodos((prev) => prev.filter((t) => t.id !== id));
        // 체크된 항목은 체크를 해제하고 이동
        setTodayTodos((prev) => [...prev, { ...todo, isCompleted: false }]);
      }
    }
  };

  const handleTodoClear = (list) => {
    if (list === "today") {
      setTodayTodos([]);
    } else if (list === "now") {
      setNowTodos([]);
    } else if (list === "completed") {
      setCompletedTodos([]);
    }
  };

  const activeTodo =
    activeId &&
    findTodoById(
      activeId,
      activeList === "today"
        ? todayTodos
        : activeList === "now"
        ? nowTodos
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
            <Timer onBreakEnd={handleBreakEnd} />
            <TodoList
              id="now"
              title="진행 중인 작업"
              todos={nowTodos}
              onToggle={(id) => handleTodoToggle("now", id)}
              onDelete={(id) => handleTodoDelete("now", id)}
              onMove={(id) => handleTodoMove("now", id)}
              onClear={() => handleTodoClear("now")}
              emptyMessage="이번 뽀모도로에서는 어떤 작업을 하실건가요? 🤔"
              hideInput={true}
              isInProgress={true}
            />
          </div>
          <div className={styles.todoSection}>
            <TodoList
              id="today"
              title="오늘 할 작업"
              todos={todayTodos}
              onToggle={(id) => handleTodoToggle("today", id)}
              onAdd={(content) => handleTodoAdd("today", content)}
              onDelete={(id) => handleTodoDelete("today", id)}
              onMove={(id) => handleTodoMove("today", id)}
              onClear={() => handleTodoClear("today")}
              emptyMessage="야호! 모든 작업을 끝냈어요 👏👏"
              isInProgress={false}
            />
            <TodoList
              id="completed"
              title="완료된 작업"
              todos={completedTodos}
              onToggle={(id) => handleTodoToggle("completed", id)}
              onDelete={(id) => handleTodoDelete("completed", id)}
              onClear={() => handleTodoClear("completed")}
              emptyMessage="아직 완료된 작업이 없어요 😅"
              hideInput={true}
              isInProgress={false}
              isCompletedList={true}
            />
          </div>
          {/* DragOverlay 컴포넌트가 List 외부에 있는 이유는 id를 통해서 Ref를 찾을 수 있기 떄문 */}
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
