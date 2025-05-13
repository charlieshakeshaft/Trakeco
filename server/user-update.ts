import { users, type User } from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";

// Add this method to the MemStorage class
export async function updateUserMem(
  userId: number,
  updateData: {
    is_new_user?: boolean;
    needs_password_change?: boolean;
    password?: string;
  },
  usersMap: Map<number, User>
): Promise<User> {
  const user = usersMap.get(userId);
  if (!user) {
    throw new Error("User not found");
  }
  
  // Update user flags in the user object
  const updatedUser: User = {
    ...user,
    is_new_user: updateData.is_new_user !== undefined 
      ? updateData.is_new_user 
      : user.is_new_user,
    needs_password_change: updateData.needs_password_change !== undefined 
      ? updateData.needs_password_change 
      : user.needs_password_change,
    password: updateData.password !== undefined 
      ? updateData.password 
      : user.password
  };
  
  // Save updated user
  usersMap.set(userId, updatedUser);
  
  return updatedUser;
}

// Add this method to the DatabaseStorage class
export async function updateUserDB(
  userId: number, 
  updateData: {
    is_new_user?: boolean;
    needs_password_change?: boolean;
    password?: string;
  }
): Promise<User> {
  // Create update data with only fields that are provided
  const userData: any = {};
  
  if (updateData.is_new_user !== undefined) {
    userData.is_new_user = updateData.is_new_user;
  }
  
  if (updateData.needs_password_change !== undefined) {
    userData.needs_password_change = updateData.needs_password_change;
  }
  
  if (updateData.password !== undefined) {
    userData.password = updateData.password;
  }
  
  const [updatedUser] = await db
    .update(users)
    .set(userData)
    .where(eq(users.id, userId))
    .returning();
  
  return updatedUser;
}