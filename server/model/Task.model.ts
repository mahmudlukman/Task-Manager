import mongoose, { Document, Model, Schema } from "mongoose";
import dotenv from "dotenv";
dotenv.config();

interface ITodo extends Document {
  text: string;
  completed: boolean;
}

const TodoSchema: Schema<ITodo> = new mongoose.Schema({
  text: { type: String, required: true },
  completed: { type: Boolean, default: false },
});

export interface IAttachment {
  public_id: string;
  url: string;
  filename: string;
  fileType: string;
  size?: number;
}

const AttachmentSchema: Schema<IAttachment> = new mongoose.Schema({
  public_id: { type: String, required: true },
  url: { type: String, required: true },
  filename: { type: String, required: true },
  fileType: { type: String, required: true },
  size: { type: Number },
});

export interface ITask extends Document {
  title: string;
  description: string;
  priority: string;
  assignedTo: [{
      [x: string]: any; type: Schema.Types.ObjectId; ref: "User" 
}];
  status: string;
  dueDate: Date;
  todoChecklist: ITodo[];
  progress: number;
  createdBy: { type: Schema.Types.ObjectId; ref: "User" };
  attachments?: IAttachment[];
}

const TaskSchema: Schema<ITask> = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String },
    priority: {
      type: String,
      enum: ["Low", "Medium", "High"],
      default: "Medium",
    },
    assignedTo: [{ type: Schema.Types.ObjectId, ref: "User" }],
    status: {
      type: String,
      enum: ["Pending", "In Progress", "Completed"],
      default: "Pending",
    },
    dueDate: { type: Date, required: true },
    todoChecklist: [TodoSchema],
    progress: { type: Number, default: 0 },
    attachments: [AttachmentSchema],
    createdBy: { type: Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

const Task: Model<ITask> = mongoose.model("Task", TaskSchema);
export default Task;
