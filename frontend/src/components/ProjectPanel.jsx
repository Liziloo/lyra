import React, { useState, useEffect } from "react";
import axios from "axios";

const ProjectPanel = ({ projectName }) => {
  const [files, setFiles] = useState([]);

  useEffect(() => {
    // Fetch project files from backend and update state
    axios
      .get(`/project/${projectName}`)
      .then((response) => setFiles(response.data));
  }, [projectName]);

  return <div className="project-panel">{/* Render project files here */}</div>;
};

export default ProjectPanel;
