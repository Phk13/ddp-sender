import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import MappingManager from "./pages/MappingManager";
import MappingEditor from "./pages/MappingEditor";
import Preview from "./pages/Preview";

import ErrorBoundary from "./components/ErrorBoundary";

function App() {
  return (
    <ErrorBoundary>
      <Router>
        <Layout>
          <Routes>
            <Route path="/" element={<MappingManager />} />
            <Route path="/mappings" element={<MappingManager />} />
            <Route path="/mappings/:name" element={<MappingEditor />} />
            <Route path="/preview" element={<Preview />} />

            <Route
              path="/config"
              element={<div>Configuration (Coming Soon)</div>}
            />
          </Routes>
        </Layout>
      </Router>
    </ErrorBoundary>
  );
}

export default App;
