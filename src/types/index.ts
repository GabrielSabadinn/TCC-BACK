export interface User {
  id: number;
  name: string;
  email: string;
  Pwd: string;
  salt: string;
  pathImageBanner?: string;
  pathImageIcon?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Transaction {
  id: number;
  userId: number;
  categoryId: number;
  date: Date;
  description?: string;
  amount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Investment {
  id: number;
  userId: number;
  categoryId: number;
  date: Date;
  description?: string;
  amount: number;
  returnPercentage?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface FixedAccount {
  id: number;
  userId: number;
  categoryId: number;
  description?: string;
  amount: number;
  dueDate: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface TokenPayload {
  userId: number;
  email: string;
}
