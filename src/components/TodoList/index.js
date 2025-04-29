import React, { useState, useCallback } from "react";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { useDroppable } from "@dnd-kit/core";
import { FaPlus } from "react-icons/fa";
import TodoItem from "./TodoItem";
import styles from "./TodoList.module.css";

const TodoList = ({
  id,
  title,
  todos,
  onToggle,
  onAdd,
  onDelete,
  onMove,
  onClear,
  emptyMessage,
  hideInput = false,
  isInProgress = false,
  isCompletedList = false,
}) => {
  const [newTodo, setNewTodo] = useState("");
  const { setNodeRef } = useDroppable({
    id: id,
  });

  const handleSubmit = useCallback(
    (e) => {
      e.preventDefault();
      if (newTodo.trim()) {
        onAdd(newTodo.trim());
        setNewTodo("");
      }
    },
    [newTodo, onAdd]
  );

  return (
    <div className={styles.todoList}>
      <div className={styles.title}>
        <h3>{title}</h3>
        {todos.length > 0 && (
          <button
            className={styles.clearButton}
            onClick={onClear}
            title="모든 항목 삭제"
          >
            Clear
          </button>
        )}
      </div>
      <div ref={setNodeRef} className={styles.list}>
        <SortableContext
          items={todos.map((todo) => todo.id)}
          strategy={verticalListSortingStrategy}
        >
          {todos.map((todo) => (
            <TodoItem
              key={todo.id}
              id={todo.id}
              content={todo.content}
              isCompleted={todo.isCompleted}
              onToggle={() => onToggle(todo.id)}
              onDelete={() => onDelete(todo.id)}
              onMove={onMove}
              isInProgress={isInProgress}
              isCompletedList={isCompletedList}
            />
          ))}
        </SortableContext>
        {todos.length === 0 && (
          <div className={styles.emptyList}>
            <p>{emptyMessage}</p>
          </div>
        )}
      </div>
      {!hideInput && (
        <form className={styles.addForm} onSubmit={handleSubmit}>
          <input
            type="text"
            value={newTodo}
            onChange={(e) => setNewTodo(e.target.value)}
            placeholder="새로운 작업 추가"
            className={styles.addInput}
          />
          <button type="submit" className={styles.addButton}>
            <FaPlus />
          </button>
        </form>
      )}
    </div>
  );
};

export default TodoList;
