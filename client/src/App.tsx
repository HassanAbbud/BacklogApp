import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
//import Home from "./pages/Home";
import Catalog from "./pages/Catalog"; 
//import Account from "./pages/Account";
//import NotFound from "./pages/NotFound"; 
import Charts from "./pages/Charts";

function App() {
  return (
    <Router>
      <div className="container">
        <h1 className="title">Game Backlog</h1>
        <div className="nav-buttons">
          <a href="/" className="btn red">Games</a>
          <a href="/catalog" className="btn blue">My Backlogs</a>
          <a href="/account" className="btn green">Account</a>
        </div>
        
        <Routes>
          {/* <Route path="/" element={<Home />} /> */}
          <Route path="/catalog" element={<Catalog />} />
          <Route path="/charts" element={<Charts />} />
          {/* <Route path="/account" element={<Account />} /> */}
          {/* <Route path="*" element={<NotFound />} /> */}
        </Routes>
      </div>
    </Router>
  );
}

export default App;
