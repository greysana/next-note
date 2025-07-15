"use client";
import React, { useState } from "react";
import { MainTask } from "@/types/task";
import NewMainTaskModal from "./NewMainTaskModal";
import NewSubTaskModal from "./NewSubTaskModal";
import NewScheduledTaskModal from "./NewScheduledTaskModal";
import NewUnscheduledTaskModal from "./NewUnscheduledTaskModal";
import MainView from "./views/MainView";
import CategoryView from "./views/CategoryView";
import ScheduledView from "./views/ScheduledView";
import UnscheduledView from "./views/UnscheduledView";

// Main App Component
export function TaskManager() {
  const [currentView, setCurrentView] = useState<
    "main" | "scheduled" | "unscheduled" | "category"
  >("main");
  const [selectedMainTask, setSelectedMainTask] = useState<MainTask | null>(
    null
  );
  const [showNewMainTaskModal, setShowNewMainTaskModal] = useState(false);
  const [showNewSubTaskModal, setShowNewSubTaskModal] = useState(false);
  const [showNewScheduledTaskModal, setShowNewScheduledTaskModal] =
    useState(false);
  const [selectedFrequency, setSelectedFrequency] = useState<
    "daily" | "weekly" | "monthly" | "yearly"
  >("daily");
  const [showNewUnscheduledTaskModal, setShowNewUnscheduledTaskModal] =
    useState(false);

  const colors = [
    "#3B82F6",
    "#10B981",
    "#F59E0B",
    "#EF4444",
    "#8B5CF6",
    "#F97316",
    "#06B6D4",
    "#84CC16",
    "#EC4899",
    "#6B7280",
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto p-6">
        {currentView === "main" && (
          <MainView
            setShowNewMainTaskModal={setShowNewMainTaskModal}
            setSelectedMainTask={setSelectedMainTask}
            setCurrentView={setCurrentView}
          />
        )}
        {currentView === "category" && (
          <CategoryView
            setShowNewSubTaskModal={setShowNewSubTaskModal}
            setCurrentView={setCurrentView}
            selectedMainTask={selectedMainTask}
          />
        )}
        {currentView === "scheduled" && (
          <ScheduledView
            setShowNewScheduledTaskModal={setShowNewScheduledTaskModal}
            setCurrentView={setCurrentView}
            setSelectedFrequency={setSelectedFrequency}
          />
        )}
        {currentView === "unscheduled" && (
          <UnscheduledView
            setCurrentView={setCurrentView}
            setShowNewUnscheduledTaskModal={setShowNewUnscheduledTaskModal}
          />
        )}

        {showNewMainTaskModal && (
          <NewMainTaskModal
            onClose={() => setShowNewMainTaskModal(false)}
            colors={colors}
          />
        )}

        {showNewSubTaskModal && selectedMainTask && (
          <NewSubTaskModal
            mainTaskId={selectedMainTask.id}
            onClose={() => setShowNewSubTaskModal(false)}
          />
        )}

        {showNewScheduledTaskModal && (
          <NewScheduledTaskModal
            frequency={selectedFrequency}
            onClose={() => setShowNewScheduledTaskModal(false)}
          />
        )}

        {showNewUnscheduledTaskModal && (
          <NewUnscheduledTaskModal
            onClose={() => setShowNewUnscheduledTaskModal(false)}
          />
        )}
      </div>
    </div>
  );
}
