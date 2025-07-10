// interfaces/request-admin.interface.ts
export interface RequestWithAdmin extends Request {
  admin?: {
    id: string;
    names?: string;
    email?: string;
    role?: string;
    // anything else from your JWT payload
  };
}
