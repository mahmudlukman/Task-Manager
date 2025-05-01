// ====== USER PARAMS
export type CreateUserParams = {
    name: string;
    email: string;
    password: string;
    avatar?: string;
    adminInviteToken?: string;
  };
  
  export type UpdateUserParams = {
    username: string;
    name: string;
    bio: string;
    avatar?: string;
    isOnboarding?: boolean;
  };
  
  export type GetUsersParams = {
    searchString?: string;
    pageNumber?: number;
    pageSize?: number;
    sortBy?: SortOrder;
  };
  export type GetSavedThreadParams = {
    page?: number;
    pageSize?: number;
    searchQuery?: string;
  };
  
  // ====== THREAD PARAMS
  export type CreateThreadParams = {
    text: string;
    author: string;
    communityId: string | null;
    image?: {
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
  