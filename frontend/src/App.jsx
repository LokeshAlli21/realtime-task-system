import Login from "./pages/Login.jsx";
import TestTask from "./pages/TestTask.jsx";

function App() {
  const token = localStorage.getItem("token");

  return (
    <>
      {!token ? <Login /> : <TestTask />}
    </>
  );
}

export default App;