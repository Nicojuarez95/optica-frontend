import { RouterProvider } from 'react-router-dom';
import { Provider } from 'react-redux'; // De react-redux
import { router } from './Pages/index.js'; // Asegúrate que esta ruta sea correcta
import { store } from './store/store.js';

function App() {
    return (
      <Provider store={store}>
          <RouterProvider router={router}/>
      </Provider>
    );
}
export default App;