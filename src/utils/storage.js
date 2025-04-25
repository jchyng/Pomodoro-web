const STORAGE_KEYS = {
  TODAY_TODOS: "todayTodos",
  CURRENT_TODOS: "currentTodos",
  COMPLETED_TODOS: "completedTodos",
};

export const loadTodosFromStorage = () => {
  try {
    return {
      todayTodos:
        JSON.parse(localStorage.getItem(STORAGE_KEYS.TODAY_TODOS)) || [],
      currentTodos:
        JSON.parse(localStorage.getItem(STORAGE_KEYS.CURRENT_TODOS)) || [],
      completedTodos:
        JSON.parse(localStorage.getItem(STORAGE_KEYS.COMPLETED_TODOS)) || [],
    };
  } catch (error) {
    console.error("로컬 스토리지 데이터 로드 실패:", error);
    return { todayTodos: [], currentTodos: [], completedTodos: [] };
  }
};

export const saveTodosToStorage = (
  todayTodos,
  currentTodos,
  completedTodos
) => {
  try {
    localStorage.setItem(STORAGE_KEYS.TODAY_TODOS, JSON.stringify(todayTodos));
    localStorage.setItem(
      STORAGE_KEYS.CURRENT_TODOS,
      JSON.stringify(currentTodos)
    );
    localStorage.setItem(
      STORAGE_KEYS.COMPLETED_TODOS,
      JSON.stringify(completedTodos)
    );
  } catch (error) {
    console.error("로컬 스토리지 데이터 저장 실패:", error);
  }
};
