import React, { useState } from "react";
import styles from "./TodoList.module.css";
import { FaPlus, FaTrash } from "react-icons/fa";

const TodoItem = ({ content, isCompleted, onToggle, onDelete }) => (
  <div className={`${styles.todoItem} ${isCompleted ? styles.completed : ""}`}>
    <label className={styles.checkbox}>
      <input type="checkbox" checked={isCompleted} onChange={onToggle} />
      <span className={styles.checkmark}></span>
    </label>
    <span className={styles.content}>{content}</span>
    <button className={styles.deleteButton} onClick={onDelete}>
      <FaTrash />
    </button>
  </div>
);

const TodoList = ({ title, todos, onToggle, onAdd, onDelete }) => {
  const [newTodo, setNewTodo] = useState("");

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
      <div className={styles.list}>
        {todos.map((todo) => (
          <TodoItem
            key={todo.id}
            content={todo.content}
            isCompleted={todo.isCompleted}
            onToggle={() => onToggle(todo.id)}
            onDelete={() => onDelete(todo.id)}
          />
        ))}
      </div>
    </div>
  );
};

export default TodoList;
