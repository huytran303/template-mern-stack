import mongoose, { Schema } from "mongoose";
import { DomainError } from "../../domain/errors.js";
import type { User, UserRepository } from "../../domain/user.js";

const UserModel = mongoose.model(
  "User",
  new Schema<User>({
    id: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    createdAt: { type: Date, required: true, index: true },
  }),
);

// Surfaces unique-index build failures at boot instead of mongoose swallowing them in the background.
export function ensureUserIndexes(): Promise<void> {
  return UserModel.createIndexes();
}

function toDomain(d: User): User {
  return {
    id: d.id,
    email: d.email,
    name: d.name,
    createdAt: d.createdAt,
  };
}

function isDuplicateKey(err: unknown): boolean {
  return err instanceof mongoose.mongo.MongoServerError && err.code === 11000;
}

export function mongoUserRepository(): UserRepository {
  return {
    async findByEmail(email) {
      const doc = await UserModel.findOne({ email }).lean();
      return doc ? toDomain(doc) : null;
    },
    async save(user) {
      try {
        await UserModel.create(user);
      } catch (err) {
        if (isDuplicateKey(err)) throw new DomainError("email already registered");
        throw err;
      }
    },
    async list() {
      const docs = await UserModel.find().sort({ createdAt: -1 }).lean();
      return docs.map(toDomain);
    },
  };
}
