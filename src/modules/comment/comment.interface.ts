import { CommentStatus } from "../../../generated/prisma/enums";

export interface ICreateCommentPayload {
    postId: string;
    content: string;
}

export interface IUpdateCommentPayload { 
    content?: string;
}

export interface IModerateCommentPayload {
    status: CommentStatus
}