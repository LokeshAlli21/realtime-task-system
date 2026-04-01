CREATE UNIQUE INDEX idx_users_email ON users(email);

-- Filter by status
CREATE INDEX idx_tasks_status ON tasks(status);

-- Assigned tasks (very common query)
CREATE INDEX idx_tasks_assigned_to ON tasks(assigned_to);

-- Created by user
CREATE INDEX idx_tasks_created_by ON tasks(created_by);

-- Sorting / recent updates
CREATE INDEX idx_tasks_updated_at ON tasks(updated_at DESC);


CREATE INDEX idx_tasks_assigned_status 
ON tasks(assigned_to, status);

-- Get activities for a task
CREATE INDEX idx_activities_task_id ON activities(task_id);

-- Activity feed (latest first)
CREATE INDEX idx_activities_created_at 
ON activities(created_at DESC);

-- Activities by user
CREATE INDEX idx_activities_user_id ON activities(user_id);

CREATE INDEX idx_activities_task_created 
ON activities(task_id, created_at DESC);