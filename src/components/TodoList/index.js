import React, { useState } from "react";
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
  emptyMessage,
}) => {
  const [newTodo, setNewTodo] = useState("");
  const { setNodeRef } = useDroppable({
    id: id,
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (newTodo.trim()) {
      onAdd(newTodo.trim());
      setNewTodo("");
    }
  };

  return (
    <div className={styles.todoList}>
      <h3 className={styles.title}>{title}</h3>
      <form className={styles.addForm} onSubmit={handleSubmit}>
        <input
          type="text"
          value={newTodo}
          onChange={(e) => setNewTodo(e.target.value)}
          placeholder="새로운 할 일 추가"
          className={styles.addInput}
        />
        <button type="submit" className={styles.addButton}>
          <FaPlus />
        </button>
      </form>
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
            />
          ))}
        </SortableContext>
        {todos.length === 0 && (
          <div className={styles.emptyList}>
            <p>{emptyMessage}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TodoList;
