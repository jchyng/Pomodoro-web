import React from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { FaTrash, FaArrowRight, FaArrowLeft } from "react-icons/fa";
import styles from "./TodoList.module.css";

const TodoItem = ({
  id,
  content,
  isCompleted,
  onToggle,
  onDelete,
  onMove,
  isInProgress,
}) => {
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
    >
      {!isInProgress && (
        <button
          className={`${styles.moveButton} ${styles.moveLeft}`}
          onClick={(e) => {
            e.stopPropagation();
            onMove(id);
          }}
          title="진행 중인 작업으로 이동"
        >
          <FaArrowLeft />
        </button>
      )}
      <label className={styles.checkbox} onClick={(e) => e.stopPropagation()}>
        <input type="checkbox" checked={isCompleted} onChange={onToggle} />
        <span className={styles.checkmark}></span>
      </label>
      <span className={styles.content} {...attributes} {...listeners}>
        {content}
      </span>
      {isInProgress && (
        <button
          className={`${styles.moveButton} ${styles.moveRight}`}
          onClick={(e) => {
            e.stopPropagation();
            onMove(id);
          }}
          title="오늘 할 작업으로 이동"
        >
          <FaArrowRight />
        </button>
      )}
      <button
        className={styles.deleteButton}
        onClick={(e) => {
          e.stopPropagation();
          onDelete(id);
        }}
      >
        <FaTrash />
      </button>
    </div>
  );
};

export default TodoItem;
