import { BrowserRouter } from "react-router-dom";
import { MainLayout } from "./layouts/MainLayout";
import { Provider } from "react-redux";
import { store } from "./store";

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
