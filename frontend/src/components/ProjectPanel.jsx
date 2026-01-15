import React, { useState, useEffect } from "react";
import axios from "axios";

const ProjectPanel = ({ projectName, onSelect }) => {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false); // Add loading state

  useEffect(() => {
    const fetchProjectFiles = async () => {
      try {
        setLoading(true); // Set loading state to true before sending request
        const response = await axios.get(`/project/${projectName}`);
        setFiles(response.data);
      } catch (error) {
        console.error("Error fetching project files:", error);
      } finally {
        setLoading(false); // Set loading state to false after receiving response or catching error
      }
    };

    if (projectName) {
      fetchProjectFiles();
    }
  }, [projectName]);

  const handleSelect = async (fileName) => {
    try {
      const response = await axios.get(`/project/${projectName}/${fileName}`); // Read project file from backend
      console.log("File content:", response.data);
    } catch (error) {
      console.error("Error reading project file:", error);
    }
  };

  const handleSave = async (fileName, content) => {
    try {
      await axios.post(`/project/${projectName}/${fileName}`, {
        content,
      }); // Write project file to backend
      console.log("File saved successfully");
    } catch (error) {
      console.error("Error saving project file:", error);
    }
  };

  return (
    <div className="project-panel">
      {loading
        ? "Loading..."
        : files.map((file) => (
            <button key={file} onClick={() => handleSelect(file)}>
              {file}
            </button>
          ))}
    </div>
  );
};

export default ProjectPanel;
