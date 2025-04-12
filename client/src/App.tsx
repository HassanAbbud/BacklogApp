import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Catalog from "./pages/Catalog";
import Charts from "./pages/Charts";
import { PrimeReactProvider } from "primereact/api";
import { LayoutProvider } from "./layout/context/layoutcontext";
import Layout from "./layout/layout";
import Test from "./pages/Test";
import LoginPage from "./pages/Login";

function App() {
  return (
    <PrimeReactProvider>
      <LayoutProvider>
        <Router>
          <Routes>
            {/* Public route without layout */}
            <Route path="/login" element={<LoginPage />} />

            {/* Routes with layout */}
            <Route path="/*" element={<Layout />}>
              <Route path="catalog" element={<Catalog />} />
              <Route path="charts" element={<Charts />} />
              <Route path="test" element={<Test />} />
              {/* You can add more nested routes here */}
            </Route>
          </Routes>
        </Router>
      </LayoutProvider>
    </PrimeReactProvider>
  );
}

export default App;
