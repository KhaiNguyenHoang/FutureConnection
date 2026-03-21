// ── Enums ─────────────────────────────────────────────────────────────────────

export type UserRole = 'Admin' | 'Employer' | 'Freelancer';
export type LocationType = 'Remote' | 'Hybrid' | 'OnSite';
export type ApplicationStatus = 'Pending' | 'Reviewed' | 'Accepted' | 'Rejected';
export type ContractStatus = 'PendingSignature' | 'Active' | 'Completed' | 'Disputed' | 'Cancelled';
export type DisputeStatus = 'Open' | 'UnderReview' | 'Resolved' | 'Closed';
export type MilestoneStatus = 'Pending' | 'Completed' | 'Paid';
export type ConnectionStatus = 'Pending' | 'Accepted' | 'Rejected';
export type GroupRole = 'Admin' | 'Member';
export type ReactionType = 'Like' | 'Love' | 'Haha' | 'Wow' | 'Sad' | 'Angry';

// ── Auth ──────────────────────────────────────────────────────────────────────

export interface User {
  id: string;
  email: string;
  role: UserRole;
  firstName?: string;
  lastName?: string;
  avatarUrl?: string;
  phoneNumber?: string;
  isOnboarded: boolean;
  isEmailVerified: boolean;
  externalProvider?: string | null;
}

export interface TokenResponse {
  accessToken: string;
  refreshToken: string;
}

export interface LoginResponse {
  success: boolean;
  message?: string;
  data?: User;
  tokens?: TokenResponse;
}

export interface OAuthResponse {
  success: boolean;
  message?: string;
  data?: {
    accessToken: string;
    refreshToken: string;
    user: User;
    isNewUser: boolean;
  };
}

export interface ApiResponse<T = void> {
  success: boolean;
  message?: string;
  data?: T;
}

export interface PagedResponse<T> {
  success: boolean;
  message?: string;
  data: T[];
  totalCount: number;
  page: number;
  pageSize: number;
}

// ── Profile ───────────────────────────────────────────────────────────────────

export interface Profile {
  id: string;
  userId: string;
  bio?: string;
  location?: string;
  website?: string;
  headline?: string;
  skills: string[];
  openToWork: boolean;
  user?: User;
}

export interface CV {
  id: string;
  profileId: string;
  fileName: string;
  fileUrl: string;
  uploadedAt: string;
}

export interface Certificate {
  id: string;
  profileId: string;
  name: string;
  issuer: string;
  issueDate: string;
  expiryDate?: string;
  credentialUrl?: string;
}

export interface PersonalProject {
  id: string;
  profileId: string;
  title: string;
  description?: string;
  githubUrl?: string;
  deployUrl?: string;
  tags: string[];
}

export interface OpenSourceContribution {
  id: string;
  profileId: string;
  repoName: string;
  repoUrl: string;
  description?: string;
  mergedPrs: number;
}

export interface SocialMedia {
  id: string;
  profileId: string;
  platform: string;
  url: string;
}

export interface Endorsement {
  id: string;
  profileId: string;
  endorserId: string;
  skill: string;
  endorser?: User;
}

// ── Jobs ──────────────────────────────────────────────────────────────────────

export interface JobType {
  id: string;
  name: string;
}

export interface Tag {
  id: string;
  name: string;
}

export interface Job {
  id: string;
  title: string;
  description: string;
  location?: string;
  locationType: LocationType;
  seniority?: string;
  salaryMin?: number;
  salaryMax?: number;
  budget?: number;
  deadline?: string;
  isActive: boolean;
  companyId?: string;
  company?: Company;
  jobTypeId?: string;
  jobType?: JobType;
  tags?: Tag[];
  createdAt: string;
}

export interface Application {
  id: string;
  jobId: string;
  userId: string;
  coverLetter?: string;
  status: ApplicationStatus;
  appliedAt: string;
  job?: Job;
  applicant?: User;
}

// ── Companies ────────────────────────────────────────────────────────────────

export interface Company {
  id: string;
  name: string;
  description?: string;
  website?: string;
  logoUrl?: string;
  industry?: string;
  size?: string;
  location?: string;
  ownerId: string;
  followerCount?: number;
  isFollowing?: boolean;
}

// ── Contracts ────────────────────────────────────────────────────────────────

export interface Contract {
  id: string;
  title: string;
  description?: string;
  budget: number;
  status: ContractStatus;
  clientId: string;
  freelancerId: string;
  client?: User;
  freelancer?: User;
  startDate?: string;
  endDate?: string;
  createdAt: string;
}

export interface Milestone {
  id: string;
  contractId: string;
  title: string;
  description?: string;
  amount: number;
  dueDate?: string;
  status: MilestoneStatus;
}

export interface Dispute {
  id: string;
  contractId: string;
  raisedById: string;
  issuerId: string;
  reason: string;
  resolution?: string;
  status: DisputeStatus;
  isResolved: boolean;
  createdAt: string;
}

export interface Review {
  id: string;
  contractId: string;
  reviewerId: string;
  rating: number;
  comment?: string;
  createdAt: string;
  reviewer?: User;
}

export interface Transaction {
  id: string;
  contractId: string;
  milestoneId?: string;
  amount: number;
  description?: string;
  createdAt: string;
}

// ── Social ────────────────────────────────────────────────────────────────────

export interface Post {
  id: string;
  userId: string;
  content: string;
  mediaUrls?: string[];
  tags?: string[];
  isDeleted: boolean;
  createdAt: string;
  author?: User;
  reactionCount?: number;
  commentCount?: number;
  userReaction?: ReactionType | null;
}

export interface Comment {
  id: string;
  postId: string;
  userId: string;
  content: string;
  createdAt: string;
  author?: User;
  reactionCount?: number;
}

export interface Connection {
  id: string;
  requesterId: string;
  receiverId: string;
  status: ConnectionStatus;
  createdAt: string;
  requester?: User;
  receiver?: User;
}

// ── Community ─────────────────────────────────────────────────────────────────

export interface Question {
  id: string;
  userId: string;
  title: string;
  body: string;
  voteScore: number;
  answerCount: number;
  isAnswered: boolean;
  bountyAmount?: number;
  createdAt: string;
  author?: User;
  tags?: Tag[];
  userVote?: 1 | -1 | null;
}

export interface Answer {
  id: string;
  questionId: string;
  userId: string;
  body: string;
  voteScore: number;
  isAccepted: boolean;
  createdAt: string;
  author?: User;
  userVote?: 1 | -1 | null;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  iconUrl?: string;
}

export interface Reputation {
  userId: string;
  score: number;
  badges?: Badge[];
}

// ── Chat ──────────────────────────────────────────────────────────────────────

export interface Channel {
  id: string;
  user1Id: string;
  user2Id: string;
  lastMessage?: Message;
  unreadCount?: number;
  otherUser?: User;
}

export interface Group {
  id: string;
  name: string;
  description?: string;
  avatarUrl?: string;
  createdAt: string;
  memberCount?: number;
  lastMessage?: Message;
}

export interface GroupMember {
  id: string;
  groupId: string;
  userId: string;
  role: GroupRole;
  user?: User;
}

export interface Message {
  id: string;
  senderId: string;
  content: string;
  mediaUrl?: string;
  createdAt: string;
  isEdited: boolean;
  sender?: User;
  reactions?: MessageReaction[];
}

export interface MessageReaction {
  type: ReactionType;
  userId: string;
  user?: User;
}

// ── Agency ────────────────────────────────────────────────────────────────────

export interface Agency {
  id: string;
  name: string;
  description?: string;
  logoUrl?: string;
  ownerId: string;
  memberCount?: number;
}

export interface AgencyMember {
  id: string;
  agencyId: string;
  userId: string;
  user?: User;
  joinedAt: string;
}

// ── DTOs ──────────────────────────────────────────────────────────────────────

export interface CreateUserDto {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  role: UserRole;
}

export interface UpdateUserDto {
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  email?: string;
}

export interface LoginDto {
  email: string;
  password: string;
}

export interface CreateJobDto {
  title: string;
  description: string;
  location?: string;
  locationType: LocationType;
  seniority?: string;
  salaryMin?: number;
  salaryMax?: number;
  budget?: number;
  deadline?: string;
  jobTypeId?: string;
  tagIds?: string[];
}

export interface ApplyJobDto {
  coverLetter?: string;
}

export interface CreateContractDto {
  applicationId: string;
  agreedPrice: number;
  startDate: string;
  endDate?: string;
}

export interface CreateMilestoneDto {
  title: string;
  description?: string;
  amount: number;
  dueDate?: string;
}

export interface CreatePostDto {
  content: string;
  mediaUrls?: string[];
  tagIds?: string[];
}

export interface CreateQuestionDto {
  title: string;
  body: string;
  tagIds?: string[];
}

export interface CreateAnswerDto {
  body: string;
}
