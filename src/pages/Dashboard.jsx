import Navbar from "../components/Navbar";
import ConfirmModal from "../components/ConfirmModal";
import TaskModal from "../components/dashboard/TaskModal";
import TaskDetailModal from "../components/dashboard/TaskDetailModal";
import CategoryModal from "../components/dashboard/CategoryModal";
import NavigationTabs from "../components/NavigationTabs";
import TaskFilters from "../components/dashboard/TaskFilters";
import TaskList from "../components/dashboard/TaskList";
import useDashboardData from "../hooks/useDashboardData";
import "../styles/pages/dashboard-user.css";

export default function Dashboard({ token, user, onLogout, onNavigateReport, onNavigateTrash, onOpenProfile, onNavigateDashboard }) {
  const {
    tasks,
    categories,
    loading,
    search,
    setSearch,
    filterCategory,
    setFilterCategory,
    filterPriority,
    setFilterPriority,
    filterStatus,
    setFilterStatus,
    sortBy,
    setSortBy,
    viewMode,
    setViewMode,
    showTaskModal,
    showDetailModal,
    setShowDetailModal,
    showCategoryModal,
    setShowCategoryModal,
    closingModals,
    selectedTask,
    setSelectedTask,
    editingTask,
    confirmModal,
    taskSubmitting,
    categorySubmitting,
    toast,
    closeModal,
    handleToggleCompleted,
    handleTaskSubmit,
    handleCategorySubmit,
    handleDeleteCategory,
    handleDeleteTask,
    openAddTask,
    openEditTask,
    filteredTasks,
    groupedTasks
  } = useDashboardData(token);

  return (
    <div>
      {/* NAVBAR */}
      <Navbar
        title="DoneRight"
        subtitle={`Selamat datang, ${user ? (user.nama || user.username) : "Pengguna"}`}
        user={user}
        onOpenProfile={onOpenProfile}
        onLogout={onLogout}
        token={token}
        showNotifBell={true}
        tasks={tasks}
        setSelectedTask={setSelectedTask}
        setShowDetailModal={setShowDetailModal}
        onNavigateDashboard={() => {
          setSearch("");
          setFilterCategory("");
          setFilterPriority("");
          setFilterStatus("");
          window.scrollTo({ top: 0, behavior: "smooth" });
          if (onNavigateDashboard) onNavigateDashboard();
        }}
      />

      {/* MAIN CONTAINER */}
      <div className="dashboard-container">
        {/* NAVIGATION SLIDER TABS */}
        <NavigationTabs
          activeTab="dashboard"
          onNavigate={(target) => {
            if (target === "report") onNavigateReport();
            else if (target === "trash") onNavigateTrash();
          }}
        />

        {/* DAFTAR TUGAS FILTER BOARD */}
        <TaskFilters
          viewMode={viewMode}
          setViewMode={setViewMode}
          setShowCategoryModal={setShowCategoryModal}
          openAddTask={openAddTask}
          search={search}
          setSearch={setSearch}
          filterCategory={filterCategory}
          setFilterCategory={setFilterCategory}
          categories={categories}
          filterPriority={filterPriority}
          setFilterPriority={setFilterPriority}
          filterStatus={filterStatus}
          setFilterStatus={setFilterStatus}
          sortBy={sortBy}
          setSortBy={setSortBy}
        />

        {/* TASK LIST OR GROUPED BOARD */}
        <TaskList
          loading={loading}
          filteredTasks={filteredTasks}
          groupedTasks={groupedTasks}
          viewMode={viewMode}
          openAddTask={openAddTask}
          handleToggleCompleted={handleToggleCompleted}
          setSelectedTask={setSelectedTask}
          setShowDetailModal={setShowDetailModal}
          handleDeleteTask={handleDeleteTask}
        />

        {/* TASK DETAIL MODAL */}
        <TaskDetailModal
          show={showDetailModal}
          closingModal={closingModals.detail ? "detail" : ""}
          closeModal={closeModal}
          selectedTask={selectedTask}
          task={selectedTask}
          onDeleteTask={handleDeleteTask}
          handleDeleteTask={handleDeleteTask}
          onEditTask={openEditTask}
          openEditTask={openEditTask}
        />

        {/* TASK ADD / EDIT MODAL */}
        <TaskModal
          show={showTaskModal}
          closingModal={closingModals.task ? "task" : ""}
          closeModal={closeModal}
          editingTask={editingTask}
          categories={categories}
          taskSubmitting={taskSubmitting}
          onSubmit={handleTaskSubmit}
        />

        {/* CATEGORY MANAGEMENT MODAL */}
        <CategoryModal
          show={showCategoryModal}
          closingModal={closingModals.category ? "category" : ""}
          closeModal={closeModal}
          categories={categories}
          categorySubmitting={categorySubmitting}
          onSubmit={handleCategorySubmit}
          onDeleteCategory={handleDeleteCategory}
        />

        {/* CUSTOM CONFIRMATION MODAL */}
        <ConfirmModal
          show={confirmModal.show}
          title={confirmModal.title}
          message={confirmModal.message}
          confirmText={confirmModal.confirmText}
          cancelText={confirmModal.cancelText}
          isDanger={confirmModal.isDanger}
          isCategoryDelete={confirmModal.isCategoryDelete}
          onConfirm={confirmModal.onConfirm}
          onCancel={confirmModal.onCancel}
          onKeepTasks={confirmModal.onKeepTasks}
          onDeleteTasks={confirmModal.onDeleteTasks}
          closingModal={closingModals.confirm ? "confirm" : ""}
          closeModal={closeModal}
        />
      </div>

      {/* TOAST NOTIFICATION */}
      <div className={`toast-notification ${toast.show ? "active" : ""} ${toast.type}`}>
        <div className="toast-message">{toast.message}</div>
      </div>
    </div>
  );
}
