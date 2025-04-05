import { BrowserRouter as Router, Routes, Route, BrowserRouter } from "react-router-dom";
//import Home from "./pages/Home";
import Catalog from "./pages/Catalog"; 
//import Account from "./pages/Account";
//import NotFound from "./pages/NotFound"; 
import Charts from "./pages/Charts";
import { PrimeReactProvider } from "primereact/api";
import { LayoutProvider } from "./layout/context/layoutcontext";
import Layout from "./layout/layout";
import Test from "./pages/test";
import LoginPage from "./pages/Login";



function App() {
  return (
    <PrimeReactProvider>
      <LayoutProvider>
        <BrowserRouter>
          <Layout>
            <Routes>
              <Route path="/catalog" element={<Catalog />} />
              <Route path="/charts" element={<Charts />} />
              <Route path="/test" element={<Test />} />
              <Route path="/login" element={<LoginPage />} />
              
            </Routes>
          </Layout>
        </BrowserRouter>
      </LayoutProvider>
    </PrimeReactProvider>
  );
}

export default App;
