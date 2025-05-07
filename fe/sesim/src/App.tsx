import { BrowserRouter } from "react-router-dom";
import { Provider } from "react-redux";
import { MainLayout } from "./layouts/MainLayout";
import store from "./redux/store";
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
