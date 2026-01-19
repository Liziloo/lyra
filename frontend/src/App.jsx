import React, { useState } from "react";
import ChatBox from "./components/ChatBox";
import ModelSelector from "./components/ModelSelector";
import ProjectPanel from "./components/ProjectPanel";

const App = () => {
  const [selectedModel, setSelectedModel] = useState("codestral");
  const [activeProject, setActiveProject] = useState("my-project");
  const [fileContext, setFileContext] = useState(null);

  return (
    <div className="app">
      {/* 1. Model Selection */}
      <ModelSelector onSelect={setSelectedModel} />

      {/* 2. Project Selection (Temporary input to use setActiveProject) */}
      <div className="project-config">
        <input
          value={activeProject}
          onChange={(e) => setActiveProject(e.target.value)}
          placeholder="Project Name..."
        />
      </div>

      {selectedModel && (
        <div className="main-layout" style={{ display: "flex" }}>
          {/* 3. Chat Box: Now receives fileContext so it can "see" your code */}
          <ChatBox
            model={selectedModel}
            projectName={activeProject}
            fileContext={fileContext}
          />

          {/* 4. Project Panel: Updates the fileContext when a file is clicked */}
          <ProjectPanel
            projectName={activeProject}
            onSelect={(data) => setFileContext(data)}
          />
        </div>
      )}

      {/* Show a preview of the attached context if it exists */}
      {fileContext && (
        <div className="context-indicator">
          Attached File: {fileContext.fileName}
          <button onClick={() => setFileContext(null)}>x</button>
        </div>
      )}
    </div>
  );
};

// CRITICAL: This fixes the "Fast Refresh" error
export default App;
