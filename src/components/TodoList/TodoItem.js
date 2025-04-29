import React, { useCallback } from "react";
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
  isCompletedList,
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

  const handleMove = useCallback(
    (e) => {
      e.stopPropagation();
      onMove(id);
    },
    [id, onMove]
  );

  const handleDelete = useCallback(
    (e) => {
      e.stopPropagation();
      onDelete(id);
    },
    [id, onDelete]
  );

  const handleClick = useCallback((e) => e.stopPropagation(), []);

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`${styles.todoItem} ${isCompleted ? styles.completed : ""}`}
    >
      {!isInProgress && !isCompletedList && (
        <button
          className={`${styles.moveButton} ${styles.moveLeft}`}
          onClick={handleMove}
          title="진행 중인 작업으로 이동"
        >
          <FaArrowLeft />
        </button>
      )}
      <label className={styles.checkbox} onClick={handleClick}>
        <input type="checkbox" checked={isCompleted} onChange={onToggle} />
        <span className={styles.checkmark}></span>
      </label>
      <span className={styles.content} {...attributes} {...listeners}>
        {content}
      </span>
      {isInProgress && !isCompletedList && (
        <button
          className={`${styles.moveButton} ${styles.moveRight}`}
          onClick={handleMove}
          title="오늘 할 작업으로 이동"
        >
          <FaArrowRight />
        </button>
      )}
      <button className={styles.deleteButton} onClick={handleDelete}>
        <FaTrash />
      </button>
    </div>
  );
};

export default TodoItem;
