export interface RootState {
  auth: {
    user: {
      name: string;
      email: string;
      avatar: {
        public_id: string;
        url: string;
      };
      role: string;
    } | null;
  };
}

