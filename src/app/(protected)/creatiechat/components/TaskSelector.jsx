import React from "react";
import { useI18n } from "../i18nContext.jsx";

const TaskSelector = ({ taskType, onTaskChange }) => {
  const { t } = useI18n();
  const tasks = [
    { value: "draft", labelKey: "task.draft", icon: "✍️" },
    { value: "rewrite", labelKey: "task.rewrite", icon: "🔄" },
    { value: "brainstorm", labelKey: "task.brainstorm", icon: "💡" },
  ];

  return (
    <div className="flex flex-col sm:flex-row gap-2">
      {tasks.map((task) => (
        <button
          key={task.value}
          onClick={() => onTaskChange(task.value)}
          className={`flex-1 px-3 md:px-4 py-2 md:py-2.5 rounded-lg font-medium transition-all text-sm md:text-base ${
            taskType === task.value
              ? "bg-[#23BD92] text-white shadow-md"
              : "bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200"
          }`}
        >
          <span className="mr-2">{task.icon}</span>
          {t(task.labelKey)}
        </button>
      ))}
    </div>
  );
};

export default TaskSelector;
