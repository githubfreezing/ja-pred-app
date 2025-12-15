//src/App.tsx
import './App.css';

import { BrowserRouter } from 'react-router-dom';
import AppRoutes from './routes';

import AppHeader from "./components/AppHeader";
import Box from "@mui/material/Box";

const App = () => {
  return (
      <BrowserRouter>
        <AppHeader />
          <Box sx={{ pt:8}}>
            <AppRoutes />
          </Box>
      </BrowserRouter>
  );
};

export default App;
