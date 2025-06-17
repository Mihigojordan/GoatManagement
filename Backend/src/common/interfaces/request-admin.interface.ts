import { Request } from "express";

// This interface extends the Express Request object to include an optional admin property
export interface RequestWithAdmin extends Request {
    // The admin property will contain the admin's ID if authenticated
    admin?: {
        id: string;
    }
}