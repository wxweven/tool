# 打卡小工具实施计划

这是根据 `.knowledge/prd/tools/clock-in.md` 需求文档制定的技术实施计划。该计划将专注于第一阶段（MVP）的开发，旨在构建一个功能完备的最小可行产品。

### 实施清单：

1.  **项目设置与结构 (Project Setup & Structure)**
    1.  在 `src/tools/` 目录下创建新工具的主组件文件：`ClockInTool.jsx`。
    2.  在 `src/context/` 目录下创建用于管理打卡数据状态的上下文文件：`ClockInContext.jsx`。
    3.  创建一个新的 `src/hooks/` 目录，并在其中创建用于本地存储交互的自定义Hook：`useLocalStorage.jsx`。
    4.  在 `src/tools/index.js` 中导出 `ClockInTool` 组件，使其在项目中可用。
    5.  在 `src/nav-items.jsx` 中添加新的导航项“打卡小工具”，配置其路由和图标。

2.  **数据持久化与状态管理 (Data Persistence & State Management)**
    1.  在 `src/hooks/useLocalStorage.jsx` 中，实现一个通用的 `useLocalStorage` Hook，用于将状态同步到浏览器的 `localStorage`。
    2.  在 `src/context/ClockInContext.jsx` 中，创建 `ClockInProvider`。
    3.  在 `ClockInProvider` 内部，使用 `useLocalStorage` Hook来管理 `goals` (目标列表) 和 `checkIns` (打卡记录) 两个状态数组。
    4.  在 `ClockInProvider` 中定义并提供以下数据管理函数：
        *   `addGoal(goalData)`: 添加新目标
        *   `updateGoal(goalId, updates)`: 更新现有目标
        *   `deleteGoal(goalId)`: 删除目标
        *   `addCheckIn(goalId, checkInData)`: 添加打卡记录
        *   `getGoalById(goalId)`: 获取单个目标信息
        *   `getCheckInsByGoal(goalId)`: 获取特定目标的打卡记录
        *   `getGoalStats(goalId)`: 计算并获取目标的统计数据
    5.  从 `ClockInContext.jsx` 导出 `ClockInProvider` 和一个自定义Hook `useClockIn()`，以便组件可以方便地访问上下文数据和函数。

3.  **核心UI组件 (Core UI Components)**
    1.  在 `ClockInTool.jsx` 中，使用 `ClockInProvider` 包裹所有子组件，确保它们可以访问打卡数据。
    2.  设计并实现 `ClockInTool.jsx` 的主布局，可以使用 `Card` 和 `Button` 等 `shadcn/ui` 组件。
    3.  创建 `GoalList.jsx` 组件，用于获取并展示所有打卡目标的列表。
    4.  创建 `GoalItem.jsx` 组件，用于渲染单个目标的信息，包括名称、进度，以及“打卡”、“详情”、“编辑”和“删除”等操作按钮。

4.  **目标管理功能 (Goal Management Features)**
    1.  创建 `GoalForm.jsx` 组件，用于创建和编辑目标。此表单将包含名称、描述等字段，并使用 `react-hook-form` 和 `zod` 进行表单处理与验证。
    2.  在 `GoalList.jsx` 中，通过 `Dialog` (shadcn/ui) 组件来包裹和触发 `GoalForm.jsx`，用于创建新目标。
    3.  在 `GoalItem.jsx` 中，实现编辑功能，点击后同样使用 `Dialog` 打开 `GoalForm.jsx` 并填充现有数据。
    4.  在 `GoalItem.jsx` 中，实现删除功能，点击后使用 `AlertDialog` (shadcn/ui) 组件进行二次确认，确认后调用上下文中的 `deleteGoal` 函数。

5.  **打卡功能 (Check-in Feature)**
    1.  在 `GoalItem.jsx` 组件中，为“打卡”按钮添加 `onClick` 事件处理器。
    2.  该处理器调用上下文中的 `addCheckIn` 函数，为当前目标创建一条新的打卡记录。
    3.  打卡成功后，使用 `sonner` 库（或 `react-hot-toast`）显示一条成功的提示消息。

6.  **统计展示功能 (Statistics Display Feature - MVP)**
    1.  创建 `GoalDetailsPage.jsx` 或 `GoalDetailsView` 组件，用于展示单个目标的详细信息和统计数据。可以通过点击 `GoalItem` 上的“详情”按钮导航或显示此视图。
    2.  在此组件中，调用 `getGoalStats` 函数获取并展示以下核心统计数据：
        *   总打卡天数
        *   当前连续打卡天数
        *   历史最高连续打卡天数
    3.  创建 `CheckInCalendar.jsx` 组件，使用 `Calendar` (shadcn/ui) 组件，并高亮显示所有已打卡的日期，为用户提供一个直观的打卡历史视图。