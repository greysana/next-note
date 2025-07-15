import { TaskProvider } from "@/hooks/TaskContext";
import React from "react";
import { TaskManager } from "@/components/tasks/main";

const page = () => {
  return (
    <TaskProvider>
      <TaskManager />
    </TaskProvider>
  );
};

export default page;
