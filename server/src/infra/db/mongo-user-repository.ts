import mongoose, { Schema } from "mongoose";
import type { User, UserRepository } from "../../domain/user.js";

const UserModel = mongoose.model(
  "User",
  new Schema<User>({
    id: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    createdAt: { type: Date, required: true },
  }),
);

const toDomain = (d: User): User => ({
  id: d.id,
  email: d.email,
  name: d.name,
  createdAt: d.createdAt,
});

export function mongoUserRepository(): UserRepository {
  return {
    async findByEmail(email) {
      const doc = await UserModel.findOne({ email }).lean();
      return doc ? toDomain(doc) : null;
    },
    async save(user) {
      await UserModel.create(user);
    },
    async list() {
      const docs = await UserModel.find().sort({ createdAt: -1 }).lean();
      return docs.map(toDomain);
    },
  };
}
