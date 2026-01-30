//src/App.tsx
import './App.css';
import bg from "./assets/bg2.png";

import { BrowserRouter } from 'react-router-dom';
import AppRoutes from './routes';

import AppHeader from "./components/AppHeader";
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";

const App = () => {
  return (
      <BrowserRouter>
        <AppHeader />

          <Toolbar />

          <Box
            sx={{ 
              minHeight: "calc(100vh - 64px)",
              width: "100%",
              backgroundImage: `url(${bg})`,
              backgroundRepeat: "no-repeat",
              backgroundPosition: "center",
              backgroundSize: "cover",
            }}
          >
            <AppRoutes />
          </Box>
      </BrowserRouter>
  );
};

export default App;
