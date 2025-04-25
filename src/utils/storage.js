const STORAGE_KEYS = {
  TODAY_TODOS: "todayTodos",
  NOW_TODOS: "nowTodos",
  COMPLETED_TODOS: "completedTodos",
};

export const loadTodosFromStorage = () => {
  try {
    return {
      todayTodos:
        JSON.parse(localStorage.getItem(STORAGE_KEYS.TODAY_TODOS)) || [],
      currentTodos:
        JSON.parse(localStorage.getItem(STORAGE_KEYS.NOW_TODOS)) || [],
      completedTodos:
        JSON.parse(localStorage.getItem(STORAGE_KEYS.COMPLETED_TODOS)) || [],
    };
  } catch (error) {
    console.error("로컬 스토리지 데이터 로드 실패:", error);
    return { todayTodos: [], currentTodos: [], completedTodos: [] };
  }
};

export const saveTodosToStorage = (todayTodos, nowTodos, completedTodos) => {
  try {
    localStorage.setItem(STORAGE_KEYS.TODAY_TODOS, JSON.stringify(todayTodos));
    localStorage.setItem(STORAGE_KEYS.NOW_TODOS, JSON.stringify(nowTodos));
    localStorage.setItem(
      STORAGE_KEYS.COMPLETED_TODOS,
      JSON.stringify(completedTodos)
    );
  } catch (error) {
    console.error("로컬 스토리지 데이터 저장 실패:", error);
  }
};
