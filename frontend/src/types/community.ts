export interface BaseDto {
  id: string;
  createdAt: string;
  updatedAt?: string;
  isDeleted: boolean;
}

export interface MediaDto extends BaseDto {
  mediaUrl: string;
  publicId?: string;
  resourceType?: string; // image, video
}

export interface PostDto extends BaseDto {
  title: string;
  content: string;
  userId: string;
  
  authorFirstName?: string;
  authorLastName?: string;
  authorAvatarUrl?: string;
  
  reactionCount: number;
  commentCount: number;
  shareCount: number;
  viewCount: number;
  media?: MediaDto[];
  userHasReacted?: boolean;
  tags?: string[];
}

export interface CommentDto extends BaseDto {
  content: string;
  parentCommentId?: string;
  postId: string;
  userId: string;
  
  authorFirstName?: string;
  authorLastName?: string;
  authorAvatarUrl?: string;
  media?: MediaDto[];
  reactionCount?: number;
  userHasReacted?: boolean;
}

export interface CreatePostDto {
  title: string;
  content: string;
  userId: string;
  tags?: string[];
}

export interface CreateCommentDto {
  content: string;
  parentCommentId?: string;
  postId: string;
  userId: string;
}

export interface ReactionDto extends BaseDto {
  type: number; // Assuming ReactionType enum maps to number
  postId?: string;
  commentId?: string;
  userId: string;
}

// --- Question Types ---
export interface QuestionDto extends BaseDto {
  title: string;
  content: string;
  viewCount: number;
  answerCount: number;
  voteCount: number;
  userId: string;
  authorFirstName?: string;
  authorLastName?: string;
  authorAvatarUrl?: string;
  tags?: string[];
  media?: MediaDto[];
}

export interface CreateQuestionDto {
  title: string;
  content: string;
  userId: string;
  tags?: string[];
}

export interface AnswerDto extends BaseDto {
  content: string;
  isAccepted: boolean;
  voteCount: number;
  questionId: string;
  userId: string;
  authorFirstName?: string;
  authorLastName?: string;
  authorAvatarUrl?: string;
  media?: MediaDto[];
}

export interface CreateAnswerDto {
  content: string;
  questionId: string;
  userId: string;
}
