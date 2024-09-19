import { userService } from "../../helpers/fakebackend/user.service";
import { postService } from "../../helpers/service/post.service";
const searchData = {};
const optionalFieldData = {};
const jdData = {};
export const state = {
    searchData,
    optionalFieldData,
    jdData,
};

export const actions = {

    getData() {
        return state.searchData;
    },

    searchPostsByEmployer({ dispatch, commit }, { status, search_value, keyword_type, page_index, page_size, sort_by }) {
        userService.searchPostByEmployer(status, search_value, keyword_type, page_index, page_size, sort_by)
            .then(
                data => {
                    commit("searchPostSuccess", data);
                    return data;
                },
                error => {
                    commit("searchPostFauilure", error);
                    dispatch("notification/error", error, { root: true });
                }
            );
    },

    searchPostsByCollaborator({ dispatch, commit }, { keyword_type, keyword, companyId, cityId, negotiable, type_work, urgency, status, page_index, page_size, guarantee, sortBy, currency, salaryFrom, salaryTo }) {
        userService.searchPostByCollaborator(keyword_type, keyword, companyId, cityId, negotiable, type_work, urgency, status, page_index, page_size, guarantee, sortBy, currency, salaryFrom, salaryTo)
            .then(
                data => {
                    commit("searchPostSuccess", data);
                    return data;
                },
                error => {
                    commit("searchPostFauilure", error);
                    dispatch("notification/error", error, { root: true });
                }
            );
    },

    savePost({ dispatch, commit }, post_id) {
        userService.savePost(post_id)
            .then(
                data => {
                    commit("savePostSuccess", data);
                    return data;
                },
                error => {
                    commit("savePostFailure", error);
                    dispatch("notification/error", error, { root: true });
                }
            );
    },

    unsavePost({ dispatch, commit }, post_id) {
        userService.unsavePost(post_id)
            .then(
                data => {
                    commit("unsavePostSuccess", data);
                    return data;
                },
                error => {
                    commit("unsavePostFailure", error);
                    dispatch("notification/error", error, { root: true });
                }
            );
    },

    searchSavePostForCollaborator({ dispatch, commit }, { keyword_type, keyword, companyId, cityId, negotiable, type_work, urgency, status, page_index, page_size, guarantee, sortBy, currency, salaryFrom, salaryTo }) {
        userService.searchSavePostForCollaborator(keyword_type, keyword, companyId, cityId, negotiable, type_work, urgency, status, page_index, page_size, guarantee, sortBy, currency, salaryFrom, salaryTo)
            .then(
                data => {
                    commit("searchPostSuccess", data);
                    return data;
                },
                error => {
                    commit("searchPostFauilure", error);
                    dispatch("notification/error", error, { root: true });
                }
            );
    },

    getOptionalField({ dispatch, commit }, { post_id }) {
        postService.getOptionalField(post_id)
            .then(
                data => {
                    commit("getOptionalFieldSuccess", data);
                },
                error => {
                    commit("getOptionalFieldFailure", error);
                    dispatch("notification/error", error, { root: true });
                }
            );
    },

    searchPostToMatching({ dispatch, commit }, {
        keyword_type,
        keyword,
        companyIds,
        cityIds,
        salaryFrom,
        salaryTo,
        type_work,
        status,
        page_index,
        page_size,
        sortBy,
        negotiable,
        urgency,
        guarantee,
        currency
    }) {
        commit("getOptionalFieldSuccess", {});
        postService.searchPostToMatching(
            keyword_type,
            keyword,
            companyIds,
            cityIds,
            salaryFrom,
            salaryTo,
            type_work,
            status,
            page_index,
            page_size,
            sortBy,
            negotiable,
            urgency,
            guarantee,
            currency
        )
            .then(
                data => {
                    commit("searchPostToMatchingSuccess", data);
                },
                error => {
                    commit("searchPostToMatchingFailure", error);
                    dispatch("notification/error", error, { root: true });
                }
            );
    },

    exportJD({ dispatch, commit }, data) {
        postService.exportJD(data)
        .then(
            data => {
                commit('exportJDSuccess', data);
                return data;
            },
            error => {
                commit('exportJDFailure', error);
            }
        );
    }
};

export const getters = {
    getSearchPostGetter(state) {
        return state.searchData;
    },
};

export const mutations = {
    searchPostSuccess(state, searchData) {
        state.searchData = searchData;
    },
    searchPostFauilure(state, searchData) {
        state.searchData = searchData;
    },
    savePostSuccess(state, searchData) {
        state.searchData = searchData;
    },
    savePostFailure(state, searchData) {
        state.searchData = searchData;
    },
    unsavePostSuccess(state, searchData) {
        state.searchData = searchData;
    },
    unsavePostFailure(state, searchData) {
        state.searchData = searchData;
    },
    getOptionalFieldSuccess(state, optionalFieldData) {
        state.optionalFieldData = optionalFieldData;
    },
    getOptionalFieldFailure(state, optionalFieldData) {
        state.optionalFieldData = optionalFieldData;
    },
    searchPostToMatchingRequest(state, searchData) {
        state.searchData = searchData;
    },
    searchPostToMatchingSuccess(state, searchData) {
        state.searchData = searchData;
    },
    searchPostToMatchingFailure(state, searchData) {
        state.searchData = searchData;
    },
    exportJDSuccess(state, jdData) {
        state.jdData = jdData;
    },
    exportJDFailure(state, jdData) {
        state.jdData = jdData;
    },
}