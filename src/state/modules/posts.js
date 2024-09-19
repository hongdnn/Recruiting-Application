import { userService } from "../../helpers/fakebackend/user.service";
const postData = {};
export const state = postData;

export const actions = {
    // Logs in the user.
    // eslint-disable-next-line no-unused-vars

    async createPost(context, postDatas) {
        const postData = {
            industry_id: postDatas.industry_id,
            function_id: postDatas.function_id,
            job_id: postDatas.job_id,
            title: postDatas.title,
            city_ids: postDatas.city_ids,
            user_id: postDatas.user_id,
            country_id: postDatas.country_id,
            date_on: postDatas.date_on,
            date_off: postDatas.date_off,
            date_end: postDatas.date_end,
            full_name: postDatas.full_name,
            job_level: postDatas.job_level,
        };
        const userProfile = await userService.createPost(postData);
        if (userProfile !== null) {
            context.commit("postSuccess", postData);
        } else {
            context.commit("postFailure", postData);
            context.dispatch("notification/error", postData, { root: true });
        }
    },
};
export const getters = {
    getPost(state) {
        return state.postData;
    },
};
export const mutations = {
    profileSuccess(state, postData) {
        state.postData = postData;
    },
    profileFailure(state, postData) {
        state.postData = postData;
    },
};