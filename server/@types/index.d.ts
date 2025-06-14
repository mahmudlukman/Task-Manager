// ====== USER PARAMS
export type CreateUserParams = {
  name: string;
  email: string;
  password: string;
  avatar?: string;
  adminInviteToken?: string;
};

export type UpdateUserParams = {
  name: string;
  avatar?: string;
};

export type GetUsersParams = {
  searchString?: string;
  pageNumber?: number;
  pageSize?: number;
  sortBy?: SortOrder;
};

interface IGetAllUsers {
  page?: number;
  pageSize?: number;
  filter?: string;
  searchQuery?: string;
}
export type GetSavedThreadParams = {
  page?: number;
  pageSize?: number;
  searchQuery?: string;
};

// ====== TASK PARAMS
export type CreateTask = {
  title: string;
  description: string;
  priority: string;
  assignedTo: string;
  dueDate: Date;
  todoChecklist: {
    text: string;
    completed: boolean;
  }[];
  attachment?: {
    public_id: string;
    url: string;
  };
};

export type addCommentToThreadParams = {
  threadId: string;
  userId: string;
};

export type DeleteThreadParams = {
  threadId: string;
};

export type GetAllThreadsParams = {
  query: string;
  limit: number;
  page: number;
};

export type GetAllThreadsByIdParams = {
  threadId: string;
};

export type GetAllChildThreadsParams = {
  threadId: string;
};

// ====== COMMUNITY PARAMS
export type CreateCommunityParams = {
  name: string;
  username: string;
  image?: string;
  bio?: string;
};

export type GetCommunitiesParams = {
  searchString?: string;
  pageNumber?: number;
  pageSize?: number;
  sortBy?: SortOrder;
};

export type AddMemberToCommunityParams = {
  communityId: string;
  memberId: string;
};

export type RemoveMemberFromCommunityParams = {
  communityId: string;
  memberId: string;
};

export type UpdateCommunityInfoParams = {
  communityId: string;
  name?: string;
  username?: string;
  bio?: string;
  image?: string;
};

export type DeleteCommunityParams = {
  communityId: string;
};
