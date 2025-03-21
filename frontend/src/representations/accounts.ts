export interface AccountRepresentation {
    staff: StaffRepresentation[];
}

export interface StaffRepresentation {
    id: number;
    email: string;
    firstName: string;
    lastName: string;
    phone: string | null;
    isAdmin: boolean;
    isHiringManager: boolean;
    createdAt: string;
    updatedAt: string;
}


export interface CreateAccountRequest {
  email: any;
  password: any;
  firstName: any;
  lastName: any;
  phone: any;
  isHiringManager: any;
  isAdmin: any;
}

export interface CreateAccountResponse {
}