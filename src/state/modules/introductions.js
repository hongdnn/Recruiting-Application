import { introductionService } from "../../helpers/service/introduction.service";
const introductionData = {};
const introductionDetailData = {};
const updateStatusData = {};
const candidatesToWarrantyData = {};
const createWarrantyData = {};
const reviewPlacementData = {};
const inviteTestData = {};
const testReportData = {};
const downloadCVData = {};
export const state = {
    introductionData,
    introductionDetailData,
    updateStatusData,
    candidatesToWarrantyData,
    createWarrantyData,
    reviewPlacementData,
    inviteTestData,
    testReportData,
    downloadCVData,
};

export const actions = {
    searchCandidateIntroductinForEmplorer({ dispatch, commit }, {
        keyword,
        company_ids,
        status,
        page_index,
        page_size,
        sort_by,
        introduction_date_from,
        introduction_date_to,
    }) {
        introductionService.searchCandidateIntroductionByEmployer(
            keyword,
            company_ids,
            status,
            page_index,
            page_size,
            sort_by,
            introduction_date_from,
            introduction_date_to,)
            .then(
                data => {
                    commit('introductionDataSuccess', data);
                },
                error => {
                    commit('introductionDataFailure', error);
                }
            );
    },

    searchCandidateIntroductionByCollaborator({ dispatch, commit }, {
        keyword,
        company_ids,
        status,
        page_index,
        page_size,
        sort_by,
        introduction_date_from,
        introduction_date_to,
    }) {
        introductionService.searchCandidateIntroductionByCollaborator(
            keyword,
            company_ids,
            status,
            page_index,
            page_size,
            sort_by,
            introduction_date_from,
            introduction_date_to)
            .then(
                data => {
                    commit('introductionDataSuccess', data);
                },
                error => {
                    commit('introductionDataFailure', error);
                }
            );
    },

    getIntroductionDetail({ dispatch, commit }, introduction_id) {
        introductionService.getCandidateIntroductionDetail(introduction_id)
            .then(
                data => {
                    commit('getIntroductionDetailSuccess', data);
                },
                error => {
                    commit('getIntroductionDetailFailure', error);
                }
            );
    },

    updateIntroductionStatus({ dispatch, commit }, data) {
        commit('updateStatusRequest', {});
        introductionService.updateIntroductionStatus(data)
            .then(
                data => {
                    commit('updateStatusSuccess', data);
                    return data;
                },
                error => {
                    commit('updateStatusFailure', error);
                }
            );
    },

    getListCandidateToWarranty({ dispatch, commit }, post_id) {
        commit('getListCandidateToWarrantyRequest', {});
        introductionService.getListCandidateToWarranty(post_id)
            .then(
                data => {
                    commit('getListCandidateToWarrantySuccess', data);
                    return data;
                },
                error => {
                    commit('getListCandidateToWarrantyFailure', error);
                }
            );
    },

    createWarranty({ dispatch, commit }, data) {
        commit('createWarrantyRequest', {});
        introductionService.createWarranty(data)
            .then(
                data => {
                    commit('createWarrantySuccess', data);
                    return data;
                },
                error => {
                    commit('createWarrantyFailure', error);
                }
            );
    },

    getReviewPlacement({ dispatch, commit }, introduction_id) {
        commit('getReviewPlacementRequest', {});
        introductionService.getReviewPlacement(introduction_id)
            .then(
                data => {
                    commit('getReviewPlacementSuccess', data);
                    return data;
                },
                error => {
                    commit('getReviewPlacementFailure', error);
                }
            );
    },

    searchCandidateToWarranty({ dispatch, commit }, {
        keyword,
        postId,
        page_index,
        page_size,
        sort_by
    }) {
        commit('getCandidatesToWarrantyRequset', {});
        introductionService.searchCandidateToWarranty(
            keyword,
            postId,
            page_index,
            page_size,
            sort_by
        )
            .then(
                data => {
                    commit('getCandidatesToWarrantySuccess', data);
                    return data;
                },
                error => {
                    commit('getCandidatesToWarrantyFailure', error);
                }
            );
    },

    chooseCandidateToWarranty({ dispatch, commit }, data) {
        commit('createWarrantyRequest', {});
        introductionService.chooseCandidateToWarranty(data)
            .then(
                data => {
                    commit('createWarrantySuccess', data);
                    return data;
                },
                error => {
                    commit('createWarrantyFailure', error);
                }
            );
    },

    inviteTest({ dispatch, commit }, data) {
        commit('inviteTestRequest', {});
        introductionService.inviteTest(data)
            .then(
                data => {
                    commit('inviteTestSuccess', data);
                    return data;
                },
                error => {
                    commit('inviteTestFailure', error);
                }
            );
    },

    getTestReport({ dispatch, commit }, data) {
        commit('getTestReportRequest', {});
        introductionService.getTestReport(data)
            .then(
                data => {
                    commit('getTestReportSuccess', data);
                    return data;
                },
                error => {
                    commit('getTestReportFailure', error);
                }
            );
    },

    getCandidateIntroductionInPost({ dispatch, commit }, {status, page_index, page_size, sort_by, post_id}){
        introductionService.getCandidateIntroductionInPost(status, page_index, page_size, sort_by, post_id)
            .then(
                data => {
                    commit('introductionDataSuccess', data);
                    return data;
                },
                error => {
                    commit('introductionDataFailure', error);
                }
            );
    },

    downloadCV({ dispatch, commit }, id) {
        introductionService.downloadCV(id)
            .then(
                data => {
                    commit('downloadCVSuccess', data);
                },
                error => {
                    commit('downloadCVFailure', error);
                }
            );
    },
};

export const mutations = {
    introductionDataSuccess(state, introductionData) {
        state.introductionData = introductionData;
    },
    introductionDataFailure(state, introductionData) {
        state.introductionData = introductionData;
    },
    getIntroductionDetailSuccess(state, introductionDetailData) {
        state.introductionDetailData = introductionDetailData;
    },
    getIntroductionDetailFailure(state, introductionDetailData) {
        state.introductionDetailData = introductionDetailData;
    },
    updateStatusRequest(state, updateStatusData) {
        state.updateStatusData = updateStatusData;
    },
    updateStatusSuccess(state, updateStatusData) {
        state.updateStatusData = updateStatusData;
    },
    updateStatusFailure(state, updateStatusData) {
        state.updateStatusData = updateStatusData;
    },
    getListCandidateToWarrantyRequest(state, candidatesToWarrantyData) {
        state.candidatesToWarrantyData = candidatesToWarrantyData;
    },
    getListCandidateToWarrantySuccess(state, candidatesToWarrantyData) {
        state.candidatesToWarrantyData = candidatesToWarrantyData;
    },
    getListCandidateToWarrantyFailure(state, candidatesToWarrantyData) {
        state.candidatesToWarrantyData = candidatesToWarrantyData;
    },
    createWarrantyRequest(state, createWarrantyData) {
        state.createWarrantyData = createWarrantyData;
    },
    createWarrantySuccess(state, createWarrantyData) {
        state.createWarrantyData = createWarrantyData;
    },
    createWarrantyFailure(state, createWarrantyData) {
        state.createWarrantyData = createWarrantyData;
    },
    getReviewPlacementRequest(state, reviewPlacementData) {
        state.reviewPlacementData = reviewPlacementData;
    },
    getReviewPlacementSuccess(state, reviewPlacementData) {
        state.reviewPlacementData = reviewPlacementData;
    },
    getReviewPlacementFailure(state, reviewPlacementData) {
        state.reviewPlacementData = reviewPlacementData;
    },
    getCandidatesToWarrantyRequset(state, candidatesToWarrantyData) {
        state.candidatesToWarrantyData = candidatesToWarrantyData;
    },
    getCandidatesToWarrantySuccess(state, candidatesToWarrantyData) {
        state.candidatesToWarrantyData = candidatesToWarrantyData;
    },
    getCandidatesToWarrantyFailure(state, candidatesToWarrantyData) {
        state.candidatesToWarrantyData = candidatesToWarrantyData;
    },
    inviteTestRequest(state, inviteTestData) {
        state.inviteTestData = inviteTestData;
    },
    inviteTestSuccess(state, inviteTestData) {
        state.inviteTestData = inviteTestData;
    },
    inviteTestFailure(state, inviteTestData) {
        state.inviteTestData = inviteTestData;
    },
    getTestReportRequest(state, testReportData) {
        state.testReportData = testReportData;
    },
    getTestReportSuccess(state, testReportData) {
        state.testReportData = testReportData;
    },
    getTestReportFailure(state, testReportData) {
        state.testReportData = testReportData;
    },
    downloadCVSuccess(state, downloadCVData) {
        state.downloadCVData = downloadCVData;
    },
    downloadCVFailure(state, downloadCVData) {
        state.downloadCVData = downloadCVData;
    }
};