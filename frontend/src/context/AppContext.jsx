import { createContext, useState } from "react";

export const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loadingTasks, setLoadingTasks] = useState(false);

  return (
    <AppContext.Provider
      value={{
        user,
        setUser,
        tasks,
        setTasks,
        loadingTasks,
        setLoadingTasks,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};