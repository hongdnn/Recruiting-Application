import { statisticsService } from "../../helpers/service/statistics.service";

const reportStatisticsData = {};
const statisticsData = {};
const statisticsCollabData = {};
const candidateIntroductionStatusData = {};
export const state = {
    reportStatisticsData,
    statisticsData,
    candidateIntroductionStatusData,
    statisticsCollabData,
};

export const actions = {
    async searchReportForStatistics({ dispatch, commit }, data) {
        //đây là trạng thái thành công thất bại api
        commit("searchReportForStatisticsRequest", {});
        await statisticsService.reportForStatistic(data).then(
            (data) => {
                commit("searchReportForStatisticsSuccess", data);
                return data;
            },
            (error) => {
                commit("searchReportForStatisticsFailure", error);
                dispatch("notification/error", error, { root: true });
            }
        );
    },

    async getStatisticsForEmployer({ commit }) {
        const statisticsData = await statisticsService.getStatistics();
        if (statisticsData !== null) {
            commit("getStatisticsSuccess", statisticsData);
        } else {
            commit("getStatisticsFailure", statisticsData);
        }
    },

    async getStatisticsForCollaborator({ commit }) {
        const statisticsCollabData = await statisticsService.getStatisticsByCollaborator();
        if (statisticsCollabData !== null) {
            commit("getStatisticsCollaboratorSuccess", statisticsCollabData);
        } else {
            commit("getStatisticsCollaboratorFailure", statisticsCollabData);
        }
    },

    async reportCandidateIntroductionStatusByPost({ dispatch, commit }, data) {
        try {
            commit("reportCandidateIntroductionStatusByPostRequest", {});
            await statisticsService.reportIntroductionByPost(data).then(
                (data) => {
                    commit("reportCandidateIntroductionStatusByPostSuccess", data);
                },
                (error) => {
                    commit("reportCandidateIntroductionStatusByPostFailure", error);
                    dispatch("notification/error", error, { root: true });
                }
            );
        } catch (err) {
            console.log(err);
        }
    },
};

export const getters = {
    getStatisticsGetter(state) {
        return state.statisticsData;
    },
    getStatisticsCollabGetter(state) {
        return state.statisticsCollabData;
    },

    getReportStatisticsGetter(state) {
        return state.data;
    },
};
export const mutations = {
    reportCandidateIntroductionStatusByPostRequest(
        state,
        candidateIntroductionStatusData
    ) {
        state.candidateIntroductionStatusData = candidateIntroductionStatusData;
    },
    reportCandidateIntroductionStatusByPostSuccess(
        state,
        candidateIntroductionStatusData
    ) {
        state.candidateIntroductionStatusData = candidateIntroductionStatusData;
    },
    reportCandidateIntroductionStatusByPostFailure(
        state,
        candidateIntroductionStatusData
    ) {
        state.candidateIntroductionStatusData = candidateIntroductionStatusData;
    },

    searchReportForStatisticsRequest(state, reportStatisticsData) {
        state.reportStatisticsData = reportStatisticsData;
    },
    searchReportForStatisticsSuccess(state, reportStatisticsData) {
        state.reportStatisticsData = reportStatisticsData;
    },
    searchReportForStatisticsFailure(state, reportStatisticsData) {
        state.reportStatisticsData = reportStatisticsData;
    },

    getStatisticsSuccess(state, statisticsData) {
        state.statisticsData = statisticsData;
    },
    getStatisticsFailure(state, statisticsData) {
        state.statisticsData = statisticsData;
    },
    getStatisticsCollaboratorSuccess(state, statisticsCollabData) {
        state.statisticsCollabData = statisticsCollabData;
    },
    getStatisticsCollaboratorFailure(state, statisticsCollabData) {
        state.statisticsCollabData = statisticsCollabData;
    },
};