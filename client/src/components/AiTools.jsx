import React from 'react';
import { AiToolsData } from '../assets/assets'; // Import your data with icons
import { useNavigate } from 'react-router-dom';

const AiTools = () => {
  const navigate = useNavigate();

  return (
    <div className="my-8 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <h2 className="text-3xl font-bold text-center mb-6 text-gray-900">
        AI Tools
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
        {AiToolsData.map((tool, index) => {
          const Icon = tool.Icon; // Icon component from lucide-react

          return (
            <div
              key={index}
              onClick={() => navigate(tool.path)}
              className="cursor-pointer p-6 rounded-lg shadow-md hover:shadow-xl transition-shadow bg-gradient-to-br"
              style={{
                backgroundImage: `linear-gradient(to bottom right, ${tool.bg.from}, ${tool.bg.to})`,
              }}
            >
              <div className="flex items-center gap-4 mb-4">
                <Icon size={36} className="text-white" />
                <h3 className="text-xl font-semibold text-white">{tool.title}</h3>
              </div>
              <p className="text-white text-sm">{tool.description}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default AiTools;
