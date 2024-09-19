import { userService } from "../../helpers/fakebackend/user.service";
const commentData = {};
export const state = commentData;

export const actions = {
    getAllCommentForPost({ dispatch, commit }, post_id) {
        userService.getAllComment(post_id)
        .then(
            data => {
                commit("getAllCommentForPostSuccess", data);
            },
            error => {
                commit("getAllCommentForPostFailure", error);
                dispatch("notification/error", error, { root: true });
            }
        );
    },

    sendCommentForPost({ dispatch, commit }, {post_id, content}) {
        userService.sendComment(post_id, content)
        .then(
            data => {
                commit("sendCommentForPostSuccess", data);
                return data;
            },
            error => {
                commit("sendCommentForPostFailure", error);
                dispatch("notification/error", error, { root: true });
            }
        );
    },

    replyCommentForPost({ dispatch, commit }, {parent_comment_id, content}) {
        userService.replyComment(parent_comment_id, content)
        .then(
            data => {
                commit("replyCommentForPostSuccess", data);
                return data;
            },
            error => {
                commit("replyCommentForPostFailure", error);
                dispatch("notification/error", error, { root: true });
            }
        );
    },

    likeComment({ dispatch, commit }, commentId) {
        userService.likeComment(commentId)
        .then(
            data => {
                commit("likeCommentForPostSuccess", data);
                return data;
            },
            error => {
                commit("likeCommentForPostFailure", error);
                dispatch("notification/error", error, { root: true });
            }
        );
    }
}

export const mutations = {
    getAllCommentForPostSuccess(state, commentData) {
        state.commentData = commentData;
    },
    getAllCommentForPostFailure(state, commentData) {
        state.commentData = commentData;
    },
    sendCommentForPostSuccess(state, commentData) {
        state.commentData = commentData;
    },
    sendCommentForPostFailure(state, commentData) {
        state.commentData = commentData;
    },
    replyCommentForPostSuccess(state, commentData) {
        state.commentData = commentData;
    },
    replyCommentForPostFailure(state, commentData) {
        state.commentData = commentData;
    },
    likeCommentForPostSuccess(state, commentData) {
        state.commentData = commentData;
    },
    likeCommentForPostFailure(state, commentData) {
        state.commentData = commentData;
    }
}