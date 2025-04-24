import React from "react";
import styles from "./TodoList.module.css";

const TodoItem = ({ content, isCompleted, onToggle }) => (
  <div className={`${styles.todoItem} ${isCompleted ? styles.completed : ""}`}>
    <label className={styles.checkbox}>
      <input type="checkbox" checked={isCompleted} onChange={onToggle} />
      <span className={styles.checkmark}></span>
    </label>
    <span className={styles.content}>{content}</span>
  </div>
);

const TodoList = ({ title, todos, onToggle }) => {
  return (
    <div className={styles.todoList}>
      <h3 className={styles.title}>{title}</h3>
      <div className={styles.list}>
        {todos.map((todo) => (
          <TodoItem
            key={todo.id}
            content={todo.content}
            isCompleted={todo.isCompleted}
            onToggle={() => onToggle(todo.id)}
          />
        ))}
      </div>
    </div>
  );
};

export default TodoList;
