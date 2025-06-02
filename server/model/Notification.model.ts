import mongoose, { Document, Model, Schema } from "mongoose";

export interface INotification extends Document {
  title: string;
  message: string;
  status: string;
  userId: { type: Schema.Types.ObjectId; ref: "User" };
  createdAt: Date;
}

const notificationSchema = new Schema<INotification>(
  {
    title: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      required: true,
      default: "unread",
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

const Notification: Model<INotification> = mongoose.model(
  "Notification",
  notificationSchema
);
export default Notification;
