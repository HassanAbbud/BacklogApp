import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { PrimeReactProvider } from "primereact/api"; 

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <PrimeReactProvider
      value={{
        ripple: true,
        inputStyle: "outlined", 
      }}
    >
      <App />
    </PrimeReactProvider>
  </React.StrictMode>
);
