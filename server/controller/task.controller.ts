import ErrorHandler from "../utils/errorHandler";
import { catchAsyncError } from "../middleware/catchAsyncError";
import { NextFunction, Request, Response } from "express";
import cloudinary from "cloudinary";
import dotenv from "dotenv";
import Task, { ITask, IAttachment } from "../model/Task.model";
import Notification from "../model/Notification.model";
dotenv.config();

// Helper function to upload attachments to Cloudinary
const uploadAttachmentsToCloudinary = async (
  fileAttachments: any[]
): Promise<IAttachment[]> => {
  const uploadedAttachments: IAttachment[] = [];

  for (const file of fileAttachments) {
    if (!file.data) continue; // Skip if no file data

    try {
      // Upload to Cloudinary - using resource_type "auto" for various file types
      const uploadResult = await cloudinary.v2.uploader.upload(file.data, {
        folder: "task-attachments",
        resource_type: "auto", // Will handle PDFs, DOCs, images, etc.
      });

      // Create attachment object from upload result
      const attachment: IAttachment = {
        public_id: uploadResult.public_id,
        url: uploadResult.secure_url,
        filename: file.name || "Unnamed file",
        fileType: file.type || uploadResult.format || "unknown",
        size: uploadResult.bytes,
      };

      uploadedAttachments.push(attachment);
    } catch (uploadError: any) {
      console.error("File upload error:", uploadError);
      // Continue with other files if one fails
    }
  }

  return uploadedAttachments;
};

// Helper function to delete attachments from Cloudinary
export const deleteAttachmentsFromCloudinary = async (
  attachments: IAttachment[]
): Promise<void> => {
  if (!attachments || attachments.length === 0) return;

  for (const attachment of attachments) {
    try {
      await cloudinary.v2.uploader.destroy(attachment.public_id);
    } catch (error) {
      console.error(
        `Failed to delete attachment ${attachment.public_id} from Cloudinary:`,
        error
      );
    }
  }
};

// Helper function to create notifications for assigned users
const createNotificationsForUsers = async (
  userIds: string[],
  title: string,
  message: string
) => {
  try {
    const notificationPromises = userIds.map((userId: string) =>
      Notification.create({
        userId: userId,
        title: title,
        message: message,
        status: "unread", // Explicitly set to match model default
      })
    );
    await Promise.all(notificationPromises);
  } catch (error) {
    console.error("Error creating notifications:", error);
  }
};

// @desc    Create a new task with optional attachments
// @route   POST /api/v1/tasks
// @access  Private (Admin)
export const createTask = catchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const {
        title,
        description,
        priority,
        assignedTo,
        dueDate,
        todoChecklist,
        fileAttachments, // This will contain an array of file data
      } = req.body;

      if (!Array.isArray(assignedTo)) {
        return next(
          new ErrorHandler("assignedTo must be an array of user IDs", 400)
        );
      }

      // Prepare task data
      const taskData: any = {
        title,
        description,
        priority,
        dueDate,
        assignedTo,
        createdBy: req.user._id,
        todoChecklist: todoChecklist || [],
      };

      // Handle optional file attachments
      if (
        fileAttachments &&
        Array.isArray(fileAttachments) &&
        fileAttachments.length > 0
      ) {
        const uploadedAttachments = await uploadAttachmentsToCloudinary(
          fileAttachments
        );

        // Add attachments to task data if any were successfully uploaded
        if (uploadedAttachments.length > 0) {
          taskData.attachments = uploadedAttachments;
        }
      }

      // Create the task with all data including attachments
      const task = await Task.create(taskData);

      // Create notifications for all assigned users
      await createNotificationsForUsers(
        assignedTo,
        "New Task Assigned",
        `You have been assigned a new task: "${task.title}"`
      );

      res.status(201).json({
        success: true,
        message: "Task created successfully",
        task,
      });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 400));
    }
  }
);

// @desc    Update an existing task and its attachments
// @route   PUT /api/v1/tasks/:id
// @access  Private (Admin)
export const updateTask = catchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const taskId = req.params.id;
      const {
        title,
        description,
        priority,
        assignedTo,
        status,
        dueDate,
        todoChecklist,
        progress,
        fileAttachments,
        removeAttachments,
      } = req.body;

      // Find the task
      const task = await Task.findById(taskId);
      if (!task) {
        return next(new ErrorHandler("Task not found", 404));
      }

      // Store original assignedTo for comparison
      const originalAssignedTo = task.assignedTo.map((id) => id.toString());
      const newAssignedTo = assignedTo
        ? assignedTo.map((id: string) => id.toString())
        : originalAssignedTo;

      // Prepare update data
      const updateData: any = {};

      // Update basic fields if provided
      if (title !== undefined) updateData.title = title;
      if (description !== undefined) updateData.description = description;
      if (priority !== undefined) updateData.priority = priority;
      if (assignedTo !== undefined) updateData.assignedTo = assignedTo;
      if (status !== undefined) updateData.status = status;
      if (dueDate !== undefined) updateData.dueDate = dueDate;
      if (todoChecklist !== undefined) updateData.todoChecklist = todoChecklist;
      if (progress !== undefined) updateData.progress = progress;

      // Handle attachment removals if specified
      if (
        removeAttachments &&
        Array.isArray(removeAttachments) &&
        removeAttachments.length > 0
      ) {
        // Find attachments to remove
        const attachmentsToRemove =
          task.attachments?.filter((att) =>
            removeAttachments.includes(att.public_id)
          ) || [];

        // Delete from Cloudinary
        await deleteAttachmentsFromCloudinary(attachmentsToRemove);

        // Filter out removed attachments from the task
        updateData.attachments = task.attachments?.filter(
          (att) => !removeAttachments.includes(att.public_id)
        );
      } else {
        // Keep existing attachments if no removals specified
        updateData.attachments = task.attachments || [];
      }

      // Handle new attachments if any
      if (
        fileAttachments &&
        Array.isArray(fileAttachments) &&
        fileAttachments.length > 0
      ) {
        const newAttachments = await uploadAttachmentsToCloudinary(
          fileAttachments
        );

        // Add new attachments to existing ones
        updateData.attachments = [
          ...(updateData.attachments || []),
          ...newAttachments,
        ];
      }

      // Update the task with new data
      const updatedTask = await Task.findByIdAndUpdate(taskId, updateData, {
        new: true,
        runValidators: true,
      })
        .populate("assignedTo", "name email")
        .populate("createdBy", "name email");

      // Send notifications for task updates
      let notifyUsers: string[] = [];
      let notificationTitle = "";
      let notificationMessage = "";

      // Check if assignedTo changed (new users added)
      const newlyAssignedUsers = newAssignedTo.filter(
        (userId: string) => !originalAssignedTo.includes(userId)
      );

      if (newlyAssignedUsers.length > 0) {
        // Notify newly assigned users
        await createNotificationsForUsers(
          newlyAssignedUsers,
          "New Task Assignment",
          `You have been assigned to task: "${updatedTask?.title}"`
        );
      }

      // Notify all current assigned users about significant updates
      const hasSignificantUpdates =
        title || description || priority || dueDate || status;

      if (hasSignificantUpdates) {
        const updateDetails = [];
        if (title) updateDetails.push("title");
        if (description) updateDetails.push("description");
        if (priority) updateDetails.push("priority");
        if (dueDate) updateDetails.push("due date");
        if (status) updateDetails.push("status");

        await createNotificationsForUsers(
          newAssignedTo,
          "Task Updated",
          `Task "${
            updatedTask?.title
          }" has been updated. Changes: ${updateDetails.join(", ")}`
        );
      }

      res.status(200).json({
        success: true,
        message: "Task updated successfully",
        task: updatedTask,
      });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 400));
    }
  }
);

// @desc    Delete a task and all its attachments
// @route   DELETE /api/v1/tasks/:id
// @access  Private (Admin)
export const deleteTask = catchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const taskId = req.params.id;

      // Find the task
      const task = await Task.findById(taskId);
      if (!task) {
        return next(new ErrorHandler("Task not found", 404));
      }

      // Notify assigned users about task deletion
      await createNotificationsForUsers(
        task.assignedTo.map((id) => id.toString()),
        "Task Deleted",
        `Task "${task.title}" has been deleted`
      );

      // Delete all attachments from Cloudinary
      if (task.attachments && task.attachments.length > 0) {
        await deleteAttachmentsFromCloudinary(task.attachments);
      }

      // Delete the task from database
      await Task.findByIdAndDelete(taskId);

      res.status(200).json({
        success: true,
        message: "Task and all its attachments deleted successfully",
      });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 400));
    }
  }
);

// @desc    Update task attachments
// @route   PUT /api/v1/tasks/:id/attachments
// @access  Private
export const updateTaskAttachments = catchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const taskId = req.params.id;
      const { fileAttachments, removeAttachments } = req.body;

      // Find the task
      const task = await Task.findById(taskId);
      if (!task) {
        return next(new ErrorHandler("Task not found", 404));
      }

      // Handle attachment removals if specified
      if (
        removeAttachments &&
        Array.isArray(removeAttachments) &&
        removeAttachments.length > 0
      ) {
        for (const attachmentId of removeAttachments) {
          // Find the attachment to remove
          const attachmentToRemove = task.attachments?.find(
            (att) => att.public_id === attachmentId
          );

          if (attachmentToRemove) {
            // Delete from Cloudinary
            await cloudinary.v2.uploader.destroy(attachmentToRemove.public_id);

            // Remove from the task's attachments array
            task.attachments = task.attachments?.filter(
              (att) => att.public_id !== attachmentId
            );
          }
        }
      }

      // Handle new attachments if any
      if (
        fileAttachments &&
        Array.isArray(fileAttachments) &&
        fileAttachments.length > 0
      ) {
        // Initialize attachments array if it doesn't exist
        if (!task.attachments) {
          task.attachments = [];
        }

        const newAttachments = await uploadAttachmentsToCloudinary(
          fileAttachments
        );
        task.attachments.push(...newAttachments);

        // Notify assigned users about new attachments
        if (newAttachments.length > 0) {
          await createNotificationsForUsers(
            task.assignedTo.map((id) => id.toString()),
            "Task Attachments Updated",
            `New attachments have been added to task: "${task.title}"`
          );
        }
      }

      // Save the updated task
      await task.save();

      res.status(200).json({
        success: true,
        message: "Task attachments updated successfully",
        task,
      });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 400));
    }
  }
);

// @desc    Get a task with its attachments
// @route   GET /api/v1/task/:id
// @access  Private
export const getTask = catchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const task = await Task.findById(req.params.id)
        .populate("assignedTo", "name email avatar")
        .populate("createdBy", "name email avatar");

      if (!task) {
        return next(new ErrorHandler("Task not found", 404));
      }

      res.status(200).json({
        success: true,
        task,
      });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 400));
    }
  }
);

// @desc    Delete a single attachment from a task
// @route   DELETE /api/v1/tasks/:id/attachments/:attachmentId
// @access  Private
export const deleteTaskAttachment = catchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id, attachmentId } = req.params;

      // Find the task
      const task = await Task.findById(id);
      if (!task) {
        return next(new ErrorHandler("Task not found", 404));
      }

      // Find the attachment
      const attachmentToRemove = task.attachments?.find(
        (att) =>
          att.public_id === attachmentId ||
          att.public_id === `task-attachments/${attachmentId}`
      );

      if (!attachmentToRemove) {
        return next(new ErrorHandler("Attachment not found", 404));
      }

      // Delete from Cloudinary
      await cloudinary.v2.uploader.destroy(attachmentToRemove.public_id);

      // Remove from the task's attachments array
      task.attachments = task.attachments?.filter(
        (att) => att.public_id !== attachmentToRemove.public_id
      );

      // Save the updated task
      await task.save();

      res.status(200).json({
        success: true,
        message: "Attachment deleted successfully",
      });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 400));
    }
  }
);

// @desc    Get all task (Admin: all, User: only assigned tasks)
// @route   GET /api/v1/tasks
// @access  Private
export const getTasks = catchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { status } = req.query;
      let filter: { status?: string } = {};

      if (status) {
        filter.status = status as string;
      }

      let tasks;

      if (req.user.role === "admin") {
        tasks = await Task.find(filter).populate(
          "assignedTo",
          "name email avatar"
        );
      } else {
        tasks = await Task.find({
          ...filter,
          assignedTo: req.user._id,
        }).populate("assignedTo", "name email avatar");
      }

      // Add completed todoChecklist count to each task
      tasks = await Promise.all(
        tasks.map(async (task) => {
          const completedCount = task.todoChecklist.filter(
            (item) => item.completed
          ).length;
          return { ...task.toObject(), completedTodoCount: completedCount };
        })
      );

      // Status summary counts
      const allTasks = await Task.countDocuments(
        req.user.role === "admin" ? {} : { assignedTo: req.user._id }
      );

      const pendingTasks = await Task.countDocuments({
        ...filter,
        status: "Pending",
        ...(req.user.role !== "admin" && { assignedTo: req.user._id }),
      });

      const inProgressTasks = await Task.countDocuments({
        ...filter,
        status: "In Progress",
        ...(req.user.role !== "admin" && { assignedTo: req.user._id }),
      });

      const completedTasks = await Task.countDocuments({
        ...filter,
        status: "Completed",
        ...(req.user.role !== "admin" && { assignedTo: req.user._id }),
      });

      res.json({
        success: true,
        tasks,
        statusSummary: {
          all: allTasks,
          pendingTasks,
          inProgressTasks,
          completedTasks,
        },
      });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 400));
    }
  }
);

// @desc    Update task status
// @route   PUT /api/v1/tasks/:id/status
// @access  Private
export const updateTaskStatus = catchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const task = await Task.findById(req.params.id);
      if (!task) return next(new ErrorHandler("Task not found", 404));

      const isAssigned =
        Array.isArray(task.assignedTo) &&
        task.assignedTo.some(
          (userId) => userId.toString() === req.user._id.toString()
        );

      if (!isAssigned && req.user.role !== "admin") {
        return next(new ErrorHandler("Not authorized", 403));
      }

      const oldStatus = task.status;
      task.status = req.body.status || task.status;

      if (task.status === "Completed") {
        task.todoChecklist.forEach((item) => (item.completed = true));
        task.progress = 100;
      }

      await task.save();

      // Notify assigned users if status changed significantly
      if (oldStatus !== task.status) {
        const assignedUsers = task.assignedTo
          .map((id) => id.toString())
          .filter((userId) => userId !== req.user._id.toString()); // Don't notify the user who made the change

        if (assignedUsers.length > 0) {
          await createNotificationsForUsers(
            assignedUsers,
            "Task Status Updated",
            `Task "${task.title}" status changed from "${oldStatus}" to "${task.status}"`
          );
        }

        // If task is completed, notify the creator (if it's not the same person)
        if (
          task.status === "Completed" &&
          task.createdBy.toString() !== req.user._id.toString()
        ) {
          await createNotificationsForUsers(
            [task.createdBy.toString()],
            "Task Completed",
            `Task "${task.title}" has been completed by ${
              req.user.name || "a team member"
            }`
          );
        }
      }

      res.json({ message: "Task status updated", task });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 400));
    }
  }
);

// @desc    Update task checklist
// @route   PUT /api/v1/tasks/:id/todo
// @access  Private
export const updateTaskChecklist = catchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { todoChecklist } = req.body;
      const task = await Task.findById(req.params.id);

      if (!task) return next(new ErrorHandler("Task not found", 404));

      if (
        !(task.assignedTo as unknown as string[]).includes(
          req.user._id.toString()
        ) &&
        req.user.role !== "admin"
      ) {
        return res
          .status(403)
          .json({ message: "Not authorized to update checklist" });
      }

      const oldProgress = task.progress;
      task.todoChecklist = todoChecklist; // Replace with updated checklist

      // Auto-update progress based on checklist completion
      const completedCount = task.todoChecklist.filter(
        (item) => item.completed
      ).length;
      const totalItems = task.todoChecklist.length;
      task.progress =
        totalItems > 0 ? Math.round((completedCount / totalItems) * 100) : 0;

      // Auto-mark task as completed if all items are checked
      const oldStatus = task.status;
      if (task.progress === 100) {
        task.status = "Completed";
      } else if (task.progress > 0) {
        task.status = "In Progress";
      } else {
        task.status = "Pending";
      }

      await task.save();

      // Notify about significant progress changes
      const progressThreshold = 25; // Notify every 25% progress
      const oldProgressGroup = Math.floor(oldProgress / progressThreshold);
      const newProgressGroup = Math.floor(task.progress / progressThreshold);

      if (newProgressGroup > oldProgressGroup || oldStatus !== task.status) {
        const assignedUsers = task.assignedTo
          .map((id) => id.toString())
          .filter((userId) => userId !== req.user._id.toString());

        if (assignedUsers.length > 0) {
          let notificationMessage = "";

          if (task.status === "Completed") {
            notificationMessage = `Task "${task.title}" has been completed!`;
          } else {
            notificationMessage = `Task "${task.title}" progress updated to ${task.progress}%`;
          }

          await createNotificationsForUsers(
            assignedUsers,
            "Task Progress Updated",
            notificationMessage
          );
        }

        // Notify task creator if task is completed
        if (
          task.status === "Completed" &&
          task.createdBy.toString() !== req.user._id.toString()
        ) {
          await createNotificationsForUsers(
            [task.createdBy.toString()],
            "Task Completed",
            `Task "${task.title}" has been completed`
          );
        }
      }

      const updatedTask = await Task.findById(req.params.id).populate(
        "assignedTo",
        "name email avatar"
      );

      res.json({ message: "Task checklist updated", task: updatedTask });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 400));
    }
  }
);

// @desc    Dashboard Data 
// @route   GET /api/v1/tasks/dashboard-data
// @access  Private (Admin only)
export const getDashboardData = catchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Fetch statistics
      const totalTasks = await Task.countDocuments();
      const pendingTasks = await Task.countDocuments({ status: "Pending" });
      const completedTasks = await Task.countDocuments({ status: "Completed" });
      const overdueTasks = await Task.countDocuments({
        status: { $ne: "Completed" },
        dueDate: { $lt: new Date() },
      });

      // Ensure all possible statuses are included
      const taskStatuses = ["Pending", "In Progress", "Completed"];
      const taskDistributionRaw = await Task.aggregate([
        {
          $group: {
            _id: "$status",
            count: { $sum: 1 },
          },
        },
      ]);
      const taskDistribution = taskStatuses.reduce(
        (acc: Record<string, number>, status) => {
          const formattedKey = status.replace(/\s+/g, ""); // Remove spaces for response keys
          acc[formattedKey] =
            taskDistributionRaw.find((item) => item._id === status)?.count || 0;
          return acc;
        },
        {} as Record<string, number>
      );
      taskDistribution["All"] = totalTasks; // Add total count to taskDistribution

      // Ensure all priority levels are included
      const taskPriorities = ["Low", "Medium", "High"];
      const taskPriorityLevelsRaw = await Task.aggregate([
        {
          $group: {
            _id: "$priority",
            count: { $sum: 1 },
          },
        },
      ]);
      const taskPriorityLevels = taskPriorities.reduce(
        (acc: Record<string, number>, priority) => {
          acc[priority] =
            taskPriorityLevelsRaw.find((item) => item._id === priority)
              ?.count || 0;
          return acc;
        },
        {} as Record<string, number>
      );

      // Fetch recent 10 tasks
      const recentTasks = await Task.find()
        .sort({ createdAt: -1 })
        .limit(10)
        .select("title status priority dueDate createdAt");

      res.status(200).json({
        statistics: {
          totalTasks,
          pendingTasks,
          completedTasks,
          overdueTasks,
        },
        charts: {
          taskDistribution,
          taskPriorityLevels,
        },
        recentTasks,
      });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 400));
    }
  }
);

// @desc    Dashboard Data 
// @route   GET /api/v1/tasks/user-dashboard-data
// @access  Private (User-specific)
export const getUserDashboardData = catchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user._id; // Only fetch data for the logged-in user

      // Fetch statistics for user-specific tasks
      const totalTasks = await Task.countDocuments({ assignedTo: userId });
      const pendingTasks = await Task.countDocuments({
        assignedTo: userId,
        status: "Pending",
      });
      const completedTasks = await Task.countDocuments({
        assignedTo: userId,
        status: "Completed",
      });
      const overdueTasks = await Task.countDocuments({
        assignedTo: userId,
        status: { $ne: "Completed" },
        dueDate: { $lt: new Date() },
      });

      // Task distribution by status
      const taskStatuses = ["Pending", "In Progress", "Completed"];
      const taskDistributionRaw = await Task.aggregate([
        { $match: { assignedTo: userId } },
        { $group: { _id: "$status", count: { $sum: 1 } } },
      ]);

      const taskDistribution = taskStatuses.reduce(
        (acc: Record<string, number>, status) => {
          const formattedKey = status.replace(/\s+/g, "");
          acc[formattedKey] =
            taskDistributionRaw.find((item) => item._id === status)?.count || 0;
          return acc;
        },
        {} as Record<string, number>
      );
      taskDistribution["All"] = totalTasks;

      // Task distribution by priority
      const taskPriorities = ["Low", "Medium", "High"];
      const taskPriorityLevelsRaw = await Task.aggregate([
        { $match: { assignedTo: userId } },
        { $group: { _id: "$priority", count: { $sum: 1 } } },
      ]);

      const taskPriorityLevels = taskPriorities.reduce(
        (acc: Record<string, number>, priority) => {
          acc[priority] =
            taskPriorityLevelsRaw.find((item) => item._id === priority)
              ?.count || 0;
          return acc;
        },
        {} as Record<string, number>
      );

      // Fetch recent 10 tasks for the logged-in user
      const recentTasks = await Task.find({ assignedTo: userId })
        .sort({ createdAt: -1 })
        .limit(10)
        .select("title status priority dueDate createdAt");

      res.status(200).json({
        statistics: {
          totalTasks,
          pendingTasks,
          completedTasks,
          overdueTasks,
        },
        charts: {
          taskDistribution,
          taskPriorityLevels,
        },
        recentTasks,
      });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 400));
    }
  }
);
