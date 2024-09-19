import { userService } from "../../helpers/fakebackend/user.service";
const postDetail = {};
export const state = postDetail;

export const actions = {
    getData() {
        return state.postDetail;
    },

    getPostDetail({ dispatch, commit }, post_id) {
        userService.getPostDetailByEmployer(post_id).then(
            data => {
                commit("getPostDeatilSuccess", data)
                return data;
            },
            error => {
                commit("getPostDeatilFailure", error);
                dispatch("notification/error", error, { root: true });
            }
        );
    },
};

export const mutations = {
    getPostDeatilSuccess(state, postDetail) {
        state.postDetail = postDetail;
    },
    getPostDeatilFailure(state, postDetail) {
        state.postDetail = postDetail;
    }
}