import React, { useState } from 'react';
import ChatBox from './components/ChatBox';
import ModelSelector from './components/ModelSelector';
import ProjectPanel from './components/ProjectPanel';

const App = () => {
    const [selectedModel, setSelectedModel] = useState(null);

    return (
        <div className="app">
            <ModelSelector onSelect={setSelectedModel} />
            {selectedModel && (
                <>
                    <ChatBox model={selectedModel} />
                    <ProjectPanel projectName={/* Pass the current project name */} />
                </>
            )}
        </div>
    );
};

export default App;
