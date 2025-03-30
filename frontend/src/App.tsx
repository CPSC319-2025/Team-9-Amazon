// import { useState } from 'react'
// import reactLogo from './assets/react.svg'
// import viteLogo from '/vite.svg'
import { SnackbarProvider } from "notistack";

import AppRoutes from "./routes/AppRoutes"

function App() {
  return (
    <SnackbarProvider
      maxSnack={3}
      anchorOrigin={{
        vertical: "top",
        horizontal: "center",
      }}
      autoHideDuration={3000}
    >
      <div className="App bg-[#f9f9f9] min-h-screen">
        <AppRoutes />
      </div>
    </SnackbarProvider>
  );
}

export default App
