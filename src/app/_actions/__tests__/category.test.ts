import { createCategory, updateCategory, deleteCategory } from '../category';
import prisma from '@/lib/prisma';
import { createClient } from '@/lib/supabase/server';

// Mock the Prisma client
jest.mock('@/lib/prisma', () => ({
  __esModule: true,
  default: {
    category: {
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    sharedAccountAccess: {
      findMany: jest.fn(),
    },
  },
}));

// Mock the Supabase client
jest.mock('@/lib/supabase/server', () => ({
  createClient: jest.fn(() => ({
    auth: {
      getUser: jest.fn(),
    },
  })),
}));

// Mock revalidatePath
jest.mock('next/cache', () => ({
  revalidatePath: jest.fn(),
}));

// Type casting for mocks
const mockPrisma = prisma as unknown as {
  category: {
    create: jest.Mock;
    update: jest.Mock;
    delete: jest.Mock;
  };
  sharedAccountAccess: {
    findMany: jest.Mock;
  };
};

const mockCreateClient = createClient as jest.Mock;
const mockRevalidatePath = require('next/cache').revalidatePath as jest.Mock;

describe('Category Actions', () => {
  beforeEach(() => {
    // Reset mocks before each test
    jest.clearAllMocks();

    // Mock Supabase getUser to return a logged-in user
    mockCreateClient.mockResolvedValue({
      auth: {
        getUser: jest.fn().mockResolvedValue({
          data: { user: { id: 'user-123' } },
        }),
      },
    });

    // Provide a default mock for sharedAccountAccess.findMany to prevent 'undefined' errors
    mockPrisma.sharedAccountAccess.findMany.mockResolvedValue([{ ownerId: 'user-123' }]);
  });

  describe('createCategory', () => {
    it('should create a category successfully', async () => {
      const formData = new FormData();
      formData.append('name', 'Groceries');

      // Mock Prisma create to return the created category
      mockPrisma.category.create.mockResolvedValue({
        id: 'cat-1',
        name: 'Groceries',
        userId: 'user-123',
      });

      await createCategory(formData);

      expect(mockCreateClient).toHaveBeenCalledTimes(1);
      expect(mockPrisma.category.create).toHaveBeenCalledTimes(1);
      expect(mockPrisma.category.create).toHaveBeenCalledWith({
        data: {
          name: 'Groceries',
          userId: 'user-123',
        },
      });
      expect(mockRevalidatePath).toHaveBeenCalledWith('/dashboard');
    });

    it('should throw an error if user is not authenticated', async () => {
      const formData = new FormData();
      formData.append('name', 'Groceries');

      // Mock Supabase getUser to return no user
      mockCreateClient.mockResolvedValue({
        auth: {
          getUser: jest.fn().mockResolvedValue({ data: { user: null } }),
        },
      });

      await expect(createCategory(formData)).rejects.toThrow('User not authenticated');
      expect(mockPrisma.category.create).not.toHaveBeenCalled();
    });

    it('should throw an error if category name is empty', async () => {
      const formData = new FormData();
      formData.append('name', ''); // Empty name

      // Expecting Zod validation error
      await expect(createCategory(formData)).rejects.toThrow();
      expect(mockPrisma.category.create).not.toHaveBeenCalled();
    });
  });

  describe('updateCategory', () => {
    const categoryId = 'cat-456';
    const formData = new FormData();
    formData.append('name', 'Updated Groceries');

    it('should update a category successfully', async () => {
      // Mock Prisma sharedAccountAccess.findMany to return accessible user IDs
      // This mock is now also set in beforeEach, but explicit here for clarity if needed
      mockPrisma.sharedAccountAccess.findMany.mockResolvedValue([{ ownerId: 'user-123' }]);

      // Mock Prisma update to return the updated category
      mockPrisma.category.update.mockResolvedValue({
        id: categoryId,
        name: 'Updated Groceries',
        userId: 'user-123',
      });

      await updateCategory(categoryId, formData);

      expect(mockCreateClient).toHaveBeenCalledTimes(1);
      // Corrected: Check call to sharedAccountAccess.findMany
      expect(mockPrisma.sharedAccountAccess.findMany).toHaveBeenCalledWith({
        where: { memberId: 'user-123' },
        select: { ownerId: true },
      });
      expect(mockPrisma.category.update).toHaveBeenCalledTimes(1);
      expect(mockPrisma.category.update).toHaveBeenCalledWith({
        where: { id: categoryId, userId: { in: ['user-123', 'user-123'] } },
        data: { name: 'Updated Groceries' },
      });
      expect(mockRevalidatePath).toHaveBeenCalledWith('/dashboard');
    });

    it('should throw an error if user is not authenticated', async () => {
      mockCreateClient.mockResolvedValue({
        auth: {
          getUser: jest.fn().mockResolvedValue({ data: { user: null } }),
        },
      });

      await expect(updateCategory(categoryId, formData)).rejects.toThrow('User not authenticated');
      expect(mockPrisma.category.update).not.toHaveBeenCalled();
      // Ensure sharedAccountAccess.findMany was not called if user is not authenticated
      expect(mockPrisma.sharedAccountAccess.findMany).not.toHaveBeenCalled();
    });

    it('should throw an error if category does not exist or user does not have access', async () => {
      // Mock Prisma update to throw an error (e.g., record not found)
      mockPrisma.category.update.mockRejectedValue(new Error('Category not found or access denied'));

      // sharedAccountAccess.findMany is mocked in beforeEach, so it will return [{ ownerId: 'user-123' }]

      await expect(updateCategory(categoryId, formData)).rejects.toThrow('Category not found or access denied');
      expect(mockPrisma.sharedAccountAccess.findMany).toHaveBeenCalledTimes(1); // Ensure it was called
      expect(mockPrisma.category.update).toHaveBeenCalledTimes(1);
      expect(mockPrisma.category.update).toHaveBeenCalledWith({
        where: { id: categoryId, userId: { in: ['user-123', 'user-123'] } },
        data: { name: 'Updated Groceries' },
      });
    });
  });

  describe('deleteCategory', () => {
    const categoryId = 'cat-789';

    it('should delete a category successfully', async () => {
      // Mock Prisma sharedAccountAccess.findMany to return accessible user IDs
      // This mock is now also set in beforeEach, but explicit here for clarity if needed
      mockPrisma.sharedAccountAccess.findMany.mockResolvedValue([{ ownerId: 'user-123' }]);

      // Mock Prisma delete to resolve successfully
      mockPrisma.category.delete.mockResolvedValue({ id: categoryId });

      await deleteCategory(categoryId);

      expect(mockCreateClient).toHaveBeenCalledTimes(1);
      // Corrected: Check call to sharedAccountAccess.findMany
      expect(mockPrisma.sharedAccountAccess.findMany).toHaveBeenCalledWith({
        where: { memberId: 'user-123' },
        select: { ownerId: true },
      });
      expect(mockPrisma.category.delete).toHaveBeenCalledTimes(1);
      expect(mockPrisma.category.delete).toHaveBeenCalledWith({
        where: { id: categoryId, userId: { in: ['user-123', 'user-123'] } },
      });
      expect(mockRevalidatePath).toHaveBeenCalledWith('/dashboard');
    });

    it('should throw an error if user is not authenticated', async () => {
      mockCreateClient.mockResolvedValue({
        auth: {
          getUser: jest.fn().mockResolvedValue({ data: { user: null } }),
        },
      });

      await expect(deleteCategory(categoryId)).rejects.toThrow('User not authenticated');
      expect(mockPrisma.category.delete).not.toHaveBeenCalled();
      // Ensure sharedAccountAccess.findMany was not called if user is not authenticated
      expect(mockPrisma.sharedAccountAccess.findMany).not.toHaveBeenCalled();
    });

    it('should throw an error if category does not exist or user does not have access', async () => {
      // Mock Prisma delete to throw an error
      mockPrisma.category.delete.mockRejectedValue(new Error('Category not found or access denied'));

      // sharedAccountAccess.findMany is mocked in beforeEach, so it will return [{ ownerId: 'user-123' }]

      await expect(deleteCategory(categoryId)).rejects.toThrow('Category not found or access denied');
      expect(mockPrisma.sharedAccountAccess.findMany).toHaveBeenCalledTimes(1); // Ensure it was called
      expect(mockPrisma.category.delete).toHaveBeenCalledTimes(1);
      expect(mockPrisma.category.delete).toHaveBeenCalledWith({
        where: { id: categoryId, userId: { in: ['user-123', 'user-123'] } },
      });
    });
  });
});
