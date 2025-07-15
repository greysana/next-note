import React, { useState, useMemo } from "react";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  Calendar,
  CheckCircle2,
  Clock,
  AlertTriangle,
  TrendingUp,
  Target,
  Filter,
  ArrowRight,
  Trophy,
  Zap,
} from "lucide-react";
import { useTaskContext } from "@/hooks/TaskContext";

// Mock data - replace with your actual data from useTaskContext

const Dashboard = () => {
  const [timeFilter, setTimeFilter] = useState("week");
  const [chartType, setChartType] = useState("bar");
  const { mainTasks, subTasks, scheduledTasks, unscheduledTasks } =
    useTaskContext();
  const mockData = {
    mainTasks,
    subTasks,
    scheduledTasks,
    unscheduledTasks,
  };
  // Generate mock analytics data

  // const analyticsData = useMemo(() => {
  //   const days = timeFilter === "week" ? 7 : timeFilter === "month" ? 30 : 365;
  //   const data = [];

  //   // Combine all tasks for analysis
  //   const allTasks = [
  //     ...subTasks,
  //     ...scheduledTasks,
  //     ...unscheduledTasks
  //   ];

  //   for (let i = days - 1; i >= 0; i--) {
  //     const date = new Date();
  //     date.setDate(date.getDate() - i);

  //     // Set time to start of day for accurate comparison
  //     const startOfDay = new Date(date);
  //     startOfDay.setHours(0, 0, 0, 0);

  //     const endOfDay = new Date(date);
  //     endOfDay.setHours(23, 59, 59, 999);

  //     // Count completed tasks for this day
  //     const completedCount = allTasks.filter(task => {
  //       if (!task.lastCompleted) return false;

  //       const completedDate = new Date(task.lastCompleted);
  //       return completedDate >= startOfDay && completedDate <= endOfDay;
  //     }).length;

  //     // Count created tasks for this day
  //     const createdCount = allTasks.filter(task => {
  //       const createdDate = new Date(task.createdAt);
  //       return createdDate >= startOfDay && createdDate <= endOfDay;
  //     }).length;

  //     // Also count main tasks created on this day
  //     const mainTasksCreated = mainTasks.filter(task => {
  //       const createdDate = new Date(task.createdAt);
  //       return createdDate >= startOfDay && createdDate <= endOfDay;
  //     }).length;

  //     data.push({
  //       date: date.toLocaleDateString("en-US", {
  //         month: "short",
  //         day: "numeric",
  //         ...(timeFilter === "year" && { year: "2-digit" }),
  //       }),
  //       completed: completedCount,
  //       created: createdCount + mainTasksCreated,
  //     });
  //   }

  //   return data;
  // }, [timeFilter, mainTasks, subTasks, scheduledTasks, unscheduledTasks]);

  // Alternative version if you want more detailed analytics
  const analyticsData = useMemo(() => {
    const days = timeFilter === "week" ? 7 : timeFilter === "month" ? 30 : 365;
    const data = [];

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);

      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);

      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);

      // Separate counts by task type
      const subTasksCompleted = subTasks.filter((task) => {
        if (!task.lastCompleted) return false;
        const completedDate = new Date(task.lastCompleted);
        return completedDate >= startOfDay && completedDate <= endOfDay;
      }).length;

      const scheduledTasksCompleted = scheduledTasks.filter((task) => {
        if (!task.lastCompleted) return false;
        const completedDate = new Date(task.lastCompleted);
        return completedDate >= startOfDay && completedDate <= endOfDay;
      }).length;

      const unscheduledTasksCompleted = unscheduledTasks.filter((task) => {
        if (!task.lastCompleted) return false;
        const completedDate = new Date(task.lastCompleted);
        return completedDate >= startOfDay && completedDate <= endOfDay;
      }).length;

      // Count created tasks
      const subTasksCreated = subTasks.filter((task) => {
        const createdDate = new Date(task.createdAt);
        return createdDate >= startOfDay && createdDate <= endOfDay;
      }).length;

      const scheduledTasksCreated = scheduledTasks.filter((task) => {
        const createdDate = new Date(task.createdAt);
        return createdDate >= startOfDay && createdDate <= endOfDay;
      }).length;

      const unscheduledTasksCreated = unscheduledTasks.filter((task) => {
        const createdDate = new Date(task.createdAt);
        return createdDate >= startOfDay && createdDate <= endOfDay;
      }).length;

      const mainTasksCreated = mainTasks.filter((task) => {
        const createdDate = new Date(task.createdAt);
        return createdDate >= startOfDay && createdDate <= endOfDay;
      }).length;

      data.push({
        date: date.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          ...(timeFilter === "year" && { year: "2-digit" }),
        }),
        completed:
          subTasksCompleted +
          scheduledTasksCompleted +
          unscheduledTasksCompleted,
        created:
          subTasksCreated +
          scheduledTasksCreated +
          unscheduledTasksCreated +
          mainTasksCreated,
        // Optional: break down by type
        subTasksCompleted,
        scheduledTasksCompleted,
        unscheduledTasksCompleted,
        subTasksCreated,
        scheduledTasksCreated,
        unscheduledTasksCreated,
        mainTasksCreated,
      });
    }

    return data;
  }, [timeFilter, mainTasks, subTasks, scheduledTasks, unscheduledTasks]);

  // Calculate KPIs
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const todayScheduledTasks = mockData.scheduledTasks.filter((task) => {
    const taskDate = new Date(task.nextDue);
    taskDate.setHours(0, 0, 0, 0);
    return taskDate.getTime() === today.getTime();
  });

  const todayCompletedTasks =
    todayScheduledTasks.filter((task) => task.completed).length +
    mockData.unscheduledTasks.filter(
      (task) =>
        task.completed &&
        new Date(task.createdAt).toDateString() === new Date().toDateString()
    ).length;

  const todayRemainingTasks =
    todayScheduledTasks.filter((task) => !task.completed).length +
    mockData.unscheduledTasks.filter((task) => !task.completed).length;

  const totalCompletedTasks =
    mockData.subTasks.filter((task) => task.completed).length +
    mockData.scheduledTasks.filter((task) => task.completed).length +
    mockData.unscheduledTasks.filter((task) => task.completed).length;

  // Get upcoming and overdue tasks
  const upcomingTasks = mockData.scheduledTasks.filter((task) => {
    const dueDate = new Date(task.nextDue);
    const threeDaysFromNow = new Date();
    threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);
    return (
      dueDate > new Date() && dueDate <= threeDaysFromNow && !task.completed
    );
  });

  const overdueTasks = mockData.scheduledTasks.filter((task) => {
    const dueDate = new Date(task.nextDue);
    return dueDate < new Date() && !task.completed;
  });

  const formatDate = (date: Date) => {
    const now = new Date();
    const diffInHours = (date.getTime() - now.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 0) {
      const daysOverdue = Math.abs(Math.floor(diffInHours / 24));
      return daysOverdue === 0 ? "Today (Overdue)" : `${daysOverdue}d overdue`;
    } else if (diffInHours < 24) {
      return "Today";
    } else if (diffInHours < 48) {
      return "Tomorrow";
    } else {
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "text-red-600 bg-red-50 border-red-200";
      case "medium":
        return "text-yellow-600 bg-yellow-50 border-yellow-200";
      case "low":
        return "text-green-600 bg-green-50 border-green-200";
      default:
        return "text-gray-600 bg-gray-50 border-gray-200";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">
            Track your productivity and stay on top of your tasks
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 bg-white border border-gray-200 rounded-lg p-1">
            <button
              onClick={() => setChartType("bar")}
              className={`px-3 py-1 rounded text-sm transition-colors ${
                chartType === "bar"
                  ? "bg-blue-100 text-blue-700"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Bar
            </button>
            <button
              onClick={() => setChartType("line")}
              className={`px-3 py-1 rounded text-sm transition-colors ${
                chartType === "line"
                  ? "bg-blue-100 text-blue-700"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Line
            </button>
          </div>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-6 border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-600 text-sm font-medium">
                Completed Today
              </p>
              <p className="text-3xl font-bold text-blue-900 mt-1">
                {todayCompletedTasks}
              </p>
            </div>
            <div className="bg-blue-200 p-3 rounded-full">
              <CheckCircle2 className="w-6 h-6 text-blue-700" />
            </div>
          </div>
          <div className="flex items-center mt-4 text-blue-700">
            <Trophy className="w-4 h-4 mr-1" />
            <span className="text-sm">Great progress!</span>
          </div>
        </div>

        <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-6 border border-orange-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-600 text-sm font-medium">
                Remaining Today
              </p>
              <p className="text-3xl font-bold text-orange-900 mt-1">
                {todayRemainingTasks}
              </p>
            </div>
            <div className="bg-orange-200 p-3 rounded-full">
              <Clock className="w-6 h-6 text-orange-700" />
            </div>
          </div>
          <div className="flex items-center mt-4 text-orange-700">
            <Zap className="w-4 h-4 mr-1" />
            <span className="text-sm">Keep it up!</span>
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-6 border border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-600 text-sm font-medium">
                Total Completed
              </p>
              <p className="text-3xl font-bold text-green-900 mt-1">
                {totalCompletedTasks}
              </p>
            </div>
            <div className="bg-green-200 p-3 rounded-full">
              <Target className="w-6 h-6 text-green-700" />
            </div>
          </div>
          <div className="flex items-center mt-4 text-green-700">
            <TrendingUp className="w-4 h-4 mr-1" />
            <span className="text-sm">All time</span>
          </div>
        </div>

        <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-lg p-6 border border-red-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-red-600 text-sm font-medium">Overdue Tasks</p>
              <p className="text-3xl font-bold text-red-900 mt-1">
                {overdueTasks.length}
              </p>
            </div>
            <div className="bg-red-200 p-3 rounded-full">
              <AlertTriangle className="w-6 h-6 text-red-700" />
            </div>
          </div>
          <div className="flex items-center mt-4 text-red-700">
            <Clock className="w-4 h-4 mr-1" />
            <span className="text-sm">Needs attention</span>
          </div>
        </div>
      </div>

      {/* Analytics Chart */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-900">
            Task Completion Trends
          </h2>
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-500" />
            <select
              value={timeFilter}
              onChange={(e) => setTimeFilter(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="week">Last 7 Days</option>
              <option value="month">Last 30 Days</option>
              <option value="year">Last Year</option>
            </select>
          </div>
        </div>

        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            {chartType === "bar" ? (
              <BarChart data={analyticsData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                <XAxis dataKey="date" stroke="#6b7280" fontSize={12} />
                <YAxis stroke="#6b7280" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "white",
                    border: "1px solid #e5e7eb",
                    borderRadius: "8px",
                    boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                  }}
                />
                <Bar dataKey="completed" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                <Bar dataKey="created" fill="#e5e7eb" radius={[4, 4, 0, 0]} />
              </BarChart>
            ) : (
              <LineChart data={analyticsData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                <XAxis dataKey="date" stroke="#6b7280" fontSize={12} />
                <YAxis stroke="#6b7280" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "white",
                    border: "1px solid #e5e7eb",
                    borderRadius: "8px",
                    boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="completed"
                  stroke="#3b82f6"
                  strokeWidth={3}
                  dot={{ fill: "#3b82f6", strokeWidth: 2, r: 4 }}
                />
                <Line
                  type="monotone"
                  dataKey="created"
                  stroke="#9ca3af"
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  dot={{ fill: "#9ca3af", strokeWidth: 2, r: 3 }}
                />
              </LineChart>
            )}
          </ResponsiveContainer>
        </div>

        <div className="flex justify-center gap-6 mt-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-blue-500 rounded"></div>
            <span className="text-gray-600">Completed Tasks</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-gray-300 rounded"></div>
            <span className="text-gray-600">Created Tasks</span>
          </div>
        </div>
      </div>

      {/* Task Previews */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Today's Tasks */}
        <div className="bg-white rounded-lg border border-gray-200">
          <div className="flex justify-between items-center p-6 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <Calendar className="w-5 h-5 text-blue-600" />
              <h2 className="text-xl font-semibold text-gray-900">
                Today&#39;s Tasks
              </h2>
              <span className="bg-blue-100 text-blue-800 text-sm px-2 py-1 rounded-full">
                {todayScheduledTasks.length}
              </span>
            </div>
            <button className="text-blue-600 hover:text-blue-700 flex items-center gap-1 text-sm font-medium">
              View All
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="p-6">
            {todayScheduledTasks.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Calendar className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No tasks scheduled for today. Great job staying ahead!</p>
              </div>
            ) : (
              <div className="space-y-3">
                {todayScheduledTasks.slice(0, 5).map((task) => (
                  <div
                    key={task.id}
                    className={`flex items-center justify-between p-3 rounded-lg border transition-colors ${
                      task.completed
                        ? "bg-green-50 border-green-200"
                        : "bg-gray-50 border-gray-200 hover:bg-gray-100"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <CheckCircle2
                        className={`w-5 h-5 ${task?.completed ? "text-green-600" : "text-gray-400"}`}
                      />
                      <div>
                        <h3
                          className={`font-medium ${task.completed ? "text-green-900 line-through" : "text-gray-900"}`}
                        >
                          {task.title}
                        </h3>
                        <p className="text-sm text-gray-500">
                          {task.frequency}
                        </p>
                      </div>
                    </div>
                    <span
                      className={`text-xs px-2 py-1 rounded-full border ${getPriorityColor(task.priority)}`}
                    >
                      {task.priority}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Upcoming & Overdue */}
        <div className="bg-white rounded-lg border border-gray-200">
          <div className="flex justify-between items-center p-6 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 text-red-600" />
              <h2 className="text-xl font-semibold text-gray-900">
                Upcoming & Overdue
              </h2>
              <span className="bg-red-100 text-red-800 text-sm px-2 py-1 rounded-full">
                {upcomingTasks.length + overdueTasks.length}
              </span>
            </div>
            <button className="text-red-600 hover:text-red-700 flex items-center gap-1 text-sm font-medium">
              View All
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="p-6">
            {upcomingTasks.length === 0 && overdueTasks.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <CheckCircle2 className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>All caught up! No urgent tasks at the moment.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {[...overdueTasks, ...upcomingTasks].slice(0, 5).map((task) => {
                  const isOverdue = new Date(task.nextDue) < new Date();
                  return (
                    <div
                      key={task.id}
                      className={`flex items-center justify-between p-3 rounded-lg border transition-colors ${
                        isOverdue
                          ? "bg-red-50 border-red-200"
                          : "bg-yellow-50 border-yellow-200"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-2 h-2 rounded-full ${isOverdue ? "bg-red-500" : "bg-yellow-500"}`}
                        />
                        <div>
                          <h3 className="font-medium text-gray-900">
                            {task.title}
                          </h3>
                          <p
                            className={`text-sm ${isOverdue ? "text-red-600" : "text-yellow-600"}`}
                          >
                            {formatDate(new Date(task.nextDue))}
                          </p>
                        </div>
                      </div>
                      <span
                        className={`text-xs px-2 py-1 rounded-full border ${getPriorityColor(task.priority)}`}
                      >
                        {task.priority}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
