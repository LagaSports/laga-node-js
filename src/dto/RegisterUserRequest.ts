export type RegisterUserRequest = {
    name?: string;
    email?: string;
    phoneNumber?: string;
    password: string;
    firebaseUid: string;
};