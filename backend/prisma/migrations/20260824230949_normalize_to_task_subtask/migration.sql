-- Create Task table (top-level items, parentItemId = NULL)
CREATE TABLE "tasks" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "listId" TEXT NOT NULL,
  "text" TEXT NOT NULL,
  "description" TEXT,
  "price" DECIMAL(65,30),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "tasks_listId_fkey" FOREIGN KEY ("listId") REFERENCES "lists" ("id") ON DELETE CASCADE
);

-- Create SubTask table (child items, parentItemId = NOT NULL)
CREATE TABLE "subtasks" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "taskId" TEXT NOT NULL,
  "text" TEXT NOT NULL,
  "price" DECIMAL(65,30),
  "done" BOOLEAN NOT NULL DEFAULT false,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "subtasks_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "tasks" ("id") ON DELETE CASCADE
);

-- Migrate data from items to tasks (where parentItemId IS NULL)
INSERT INTO "tasks" ("id", "listId", "text", "description", "price", "createdAt", "updatedAt")
SELECT "id", "listId", "text", NULL, "price", "createdAt", "updatedAt"
FROM "items"
WHERE "parentItemId" IS NULL;

-- Migrate data from items to subtasks (where parentItemId IS NOT NULL)
INSERT INTO "subtasks" ("id", "taskId", "text", "price", "done", "createdAt", "updatedAt")
SELECT "id", "parentItemId", "text", "price", "done", "createdAt", "updatedAt"
FROM "items"
WHERE "parentItemId" IS NOT NULL;

-- Create indexes
CREATE INDEX "tasks_listId_idx" ON "tasks"("listId");
CREATE INDEX "subtasks_taskId_idx" ON "subtasks"("taskId");

-- Drop old items table
DROP TABLE "items";
