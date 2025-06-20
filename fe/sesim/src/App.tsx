import { store } from "./store";
import { Provider } from "react-redux";
import { BrowserRouter } from "react-router-dom";
import { MainLayout } from "./layouts/MainLayout";

function App() {
  return (
    <Provider store={store}>
      <BrowserRouter>
        <MainLayout />
      </BrowserRouter>
    </Provider>
  );
};

export default App;
