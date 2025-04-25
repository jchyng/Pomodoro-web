import React from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { FaTrash } from "react-icons/fa";
import styles from "./TodoList.module.css";

const TodoItem = ({ id, content, isCompleted, onToggle, onDelete }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`${styles.todoItem} ${isCompleted ? styles.completed : ""}`}
      {...attributes}
      {...listeners}
    >
      <label className={styles.checkbox}>
        <input
          type="checkbox"
          defaultChecked={isCompleted}
          onChange={onToggle}
        />
        <span className={styles.checkmark}></span>
      </label>
      <span className={styles.content}>{content}</span>
      <button className={styles.deleteButton} onClick={() => onDelete(id)}>
        <FaTrash />
      </button>
    </div>
  );
};

export default TodoItem;
