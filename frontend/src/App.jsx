import React, { useState } from "react";
import ChatBox from "./components/ChatBox";
import ModelSelector from "./components/ModelSelector";
import ProjectPanel from "./components/ProjectPanel";

const App = () => {
  const [selectedModel, setSelectedModel] = useState(null);
  const [projectName, setProjectName] = useState(null); // Add project name state

  return (
    <div className="app">
      <ModelSelector onSelect={setSelectedModel} />
      {selectedModel && (
        <>
          <ChatBox model={selectedModel} projectName={projectName} />
          <ProjectPanel projectName={projectName} onSelect={setProjectName} />
        </>
      )}
    </div>
  );
};

export default App;
