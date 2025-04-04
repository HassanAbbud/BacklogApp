import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import RootLayout from "./layout/layout";
import LoginPage from "./login/login";
import 'primereact/resources/themes/saga-blue/theme.css';  // theme
import 'primereact/resources/primereact.min.css';           // core styles
import 'primeicons/primeicons.css';                         // icons
import '../styles/layout.scss';
import { LayoutProvider } from "./layout/context/layoutcontext";

function App() {
  return (
    <LayoutProvider> 
      <Router>
        <RootLayout>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            {/* <Route path="/" element={<HomePage />} /> */}
          </Routes>
        </RootLayout>
      </Router>
    </LayoutProvider>
  );
}

export default App;
