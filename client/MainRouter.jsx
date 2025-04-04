import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LoginPage from "./src/login/login";

const AppRouter = () => {
  return (
    <Routes>
      {/* //<Route path="/" element={<HomePage />} /> */}
      <Route path="/login" element={<LoginPage />} />
    </Routes>
  );
};

export default AppRouter;
