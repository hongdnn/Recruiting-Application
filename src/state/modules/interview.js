import { userService } from "../../helpers/fakebackend/user.service";
import { interviewService } from "../../helpers/service/interview.service";
const searchData = {};
const supervisorsData = {};
const scheduleData = {};
const updateScheduleData = {};
const updateScheduleStatusData = {};
const updateInterviewQuestionData = {};
export const state = {
    searchData,
    supervisorsData,
    scheduleData,
    updateScheduleData,
    updateScheduleStatusData,
    updateInterviewQuestionData,
};

export const actions = {
    getData() {
        return state.searchData;
    },

    searchInterviewByEmployer({ dispatch, commit }, { keyword, company_id, status, page_index, page_size, sort_by }) {
        userService
            .searchInterviewByEmployer(
                keyword,
                company_id,
                status,
                page_index,
                page_size,
                sort_by
            )
            .then(
                (data) => {
                    commit("searchInterviewSuccess", data);
                    return data;
                },
                (error) => {
                    commit("searchInterviewFauilure", error);
                    dispatch("notification/error", error, { root: true });
                }
            );
    },

    getSupervisor({ dispatch, commit }) {
        interviewService.getSupervisor()
        .then(
            (data) => {
                commit("getSupervisorSuccess", data);
            },
            (error) => {
                commit("getSupervisorFailure", error);
                dispatch("notification/error", error, { root: true });
            }
        );
    },

    createSchedule({ dispatch, commit }, data) {
        interviewService.createSchedule(data)
        .then(
            (data) => {
                commit("createScheduleSuccess", data);
                return data;
            },
            (error) => {
                commit("createScheduleFailure", error);
                dispatch("notification/error", error, { root: true });
            }
        );
    },

    getInterviewScheduleDetail({ dispatch, commit }, schedule_id) {
        interviewService.getInterviewScheduleDetail(schedule_id)
        .then(
            (data) => {
                commit("getScheduleDetailSuccess", data);
                return data;
            },
            (error) => {
                commit("getScheduleDetailFailure", error);
                dispatch("notification/error", error, { root: true });
            }
        );
    },

    updateInterviewSchedule({ dispatch, commit }, {schedule_id, data}) {
        commit("updateScheduleRequest", {});
        interviewService.updateInterviewSchedule(schedule_id, data)
        .then(
            (data) => {
                commit("updateScheduleSuccess", data);
                return data;
            },
            (error) => {
                commit("updateScheduleFailure", error);
                dispatch("notification/error", error, { root: true });
            }
        );
    },

    updateInterviewScheduleStatus({ dispatch, commit }, {schedule_id, data}) {
        commit("updateScheduleStatusRequest", {});
        interviewService.updateInterviewScheduleStatus(schedule_id, data)
        .then(
            (data) => {
                commit("updateScheduleStatusSuccess", data);
                return data;
            },
            (error) => {
                commit("updateScheduleStatusFailure", error);
                dispatch("notification/error", error, { root: true });
            }
        );
    },

    updateInterviewQuestion({ dispatch, commit }, {schedule_id, data}) {
        commit("updateInterviewQuestionRequest", {});
        interviewService.updateInterviewQuestion(schedule_id, data)
        .then(
            (data) => {
                commit("updateInterviewQuestionSuccess", data);
                return data;
            },
            (error) => {
                commit("updateInterviewQuestionFailure", error);
                dispatch("notification/error", error, { root: true });
            }
        );
    },
};

export const getters = {
    getSearchInterviewGetter(state) {
        return state.searchData;
    },
};

export const mutations = {
    searchInterviewSuccess(state, searchData) {
        state.searchData = searchData;
    },
    searchInterviewFailure(state, searchData) {
        state.searchData = searchData;
    },
    getSupervisorSuccess(state, supervisorsData) {
        state.supervisorsData = supervisorsData;
    },
    getSupervisorFailure(state, supervisorsData) {
        state.supervisorsData = supervisorsData;
    },
    createScheduleSuccess(state, scheduleData) {
        state.scheduleData = scheduleData;
    },
    createScheduleFailure(state, scheduleData) {
        state.scheduleData = scheduleData;
    },
    getScheduleDetailRequest(state, scheduleData) {
        state.scheduleData = scheduleData;
    },
    getScheduleDetailSuccess(state, scheduleData) {
        state.scheduleData = scheduleData;
    },
    getScheduleDetailFailure(state, scheduleData) {
        state.scheduleData = scheduleData;
    },
    updateScheduleRequest(state, updateScheduleData) {
        state.updateScheduleData = updateScheduleData;
    },
    updateScheduleSuccess(state, updateScheduleData) {
        state.updateScheduleData = updateScheduleData;
    },
    updateScheduleFailure(state, updateScheduleData) {
        state.updateScheduleData = updateScheduleData;
    },
    updateScheduleStatusRequest(state, updateScheduleStatusData) {
        state.updateScheduleStatusData = updateScheduleStatusData;
    },
    updateScheduleStatusSuccess(state, updateScheduleStatusData) {
        state.updateScheduleStatusData = updateScheduleStatusData;
    },
    updateScheduleStatusFailure(state, updateScheduleStatusData) {
        state.updateScheduleStatusData = updateScheduleStatusData;
    },
    updateInterviewQuestionRequest(state, updateInterviewQuestionData) {
        state.updateInterviewQuestionData = updateInterviewQuestionData;
    },
    updateInterviewQuestionSuccess(state, updateInterviewQuestionData) {
        state.updateInterviewQuestionData = updateInterviewQuestionData;
    },
    updateInterviewQuestionFailure(state, updateInterviewQuestionData) {
        state.updateInterviewQuestionData = updateInterviewQuestionData;
    },
};