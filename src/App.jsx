import { RouterProvider } from 'react-router-dom';
import { Provider } from 'react-redux'; // De react-redux
import { router } from './Pages/index.js'; // Asegúrate que esta ruta sea correcta
import { store } from './store/store.js';

function App() {
    return (
      <Provider store={store}>
          <RouterProvider router={router}/>
          <div id="elemento-para-imprimir-prescripcion" style={{ position: 'absolute', left: '-9999px', top: '-9999px', width: '210mm', background: 'white', color: 'black' }}></div>
      </Provider>
    );
}
export default App;