import { userService } from "../../helpers/fakebackend/user.service";
import { candidateService } from "../../helpers/service/candidate.service";
const candidateData = {};
const createCandidateData = {};
const deleteCandidateData = {};
const updateCandidateData = {};
const referCandidateData = {};
const updateCVData = {};
const jobMatchingData = {};
const cvPath = "";
export const state = {
    candidateData,
    createCandidateData,
    deleteCandidateData,
    updateCandidateData,
    referCandidateData,
    updateCVData,
    jobMatchingData,
    cvPath,
};

export const actions = {
    searchCandidateForCollaborator({ dispatch, commit }, {
        salary_from,
        salary_to,
        date_from,
        date_to,
        city_ids,
        keyword_cv_require,
        keyword_cv_optional,
        page_index,
        page_size,
        sort_by,
        currency,
    }) {
        userService
            .searchCandidateByCollaborator(
                salary_from,
                salary_to,
                date_from,
                date_to,
                city_ids,
                keyword_cv_require,
                keyword_cv_optional,
                page_index,
                page_size,
                sort_by,
                currency
            )
            .then(
                (data) => {
                    commit("searchCandidateForCollaboratorSuccess", data);
                },
                (error) => {
                    commit("searchCandidateForCollaboratorFailure", error);
                    dispatch("notification/error", error, { root: true });
                }
            );
    },

    searchCandidateToRefer({ dispatch, commit }, {
        postId,
        salary_from,
        salary_to,
        date_from,
        date_to,
        city_ids,
        keyword_cv_require,
        keyword_cv_optional,
        page_index,
        page_size,
        sort_by,
        currency,
    }) {
        candidateService
            .searchCandidateToRefer(
                postId,
                salary_from,
                salary_to,
                date_from,
                date_to,
                city_ids,
                keyword_cv_require,
                keyword_cv_optional,
                page_index,
                page_size,
                sort_by,
                currency
            )
            .then(
                (data) => {
                    commit("searchCandidateToReferSuccess", data);
                },
                (error) => {
                    commit("searchCandidateToReferFailure", error);
                    dispatch("notification/error", error, { root: true });
                }
            );
    },

    updateCandidateStatus({ dispatch, commit }, { candidate_id, candidate_status }) {
        candidateService.updateCandidateStatus(candidate_id, candidate_status).then(
            (data) => {
                commit("updateCandidateStatusSuccess", data);
            },
            (error) => {
                commit("updateCandidateStatusFailure", error);
                dispatch("notification/error", error, { root: true });
            }
        );
    },

    uploadCVFile({ dispatch, commit }, { cvfile }) {
        userService.uploadCV(cvfile).then(
            (data) => {
                commit("uploadCVSuccess", data);
            },
            (error) => {
                commit("uploadCVFailure", error);
                dispatch("notification/error", error, { root: true });
            }
        );
    },

    createNewCandidate({ dispatch, commit }, data) {
        candidateService.createCandidate(data).then(
            (data) => {
                commit("createCandidateSuccess", data);
                return data;
            },
            (error) => {
                commit("createCandidateFailure", error);
                dispatch("notification/error", error, { root: true });
            }
        );
    },

    deleteCandidate({ dispatch, commit }, { candidate_id }) {
        // commit('deteleCandidateRequest', null);
        candidateService.deleteCandidate(candidate_id).then(
            (data) => {
                commit("deteleCandidateSuccess", data);
                return data;
            },
            (error) => {
                commit("deteleCandidateFailure", error);
                dispatch("notification/error", error, { root: true });
            }
        );
    },

    getCandidateDetail({ dispatch, commit }, { candidate_id }) {
        candidateService.getCandidateDetail(candidate_id).then(
            (data) => {
                commit("getCandidateSuccess", data);
                return data;
            },
            (error) => {
                commit("getCandidateFailure", error);
                dispatch("notification/error", error, { root: true });
            }
        );
    },

    updateCandidate({ dispatch, commit }, { candidate_id, data }) {
        candidateService.updateCandidate(candidate_id, data).then(
            (data) => {
                commit("updateCandidateSuccess", data);
                return data;
            },
            (error) => {
                commit("updateCandidateFailure", error);
                dispatch("notification/error", error, { root: true });
            }
        );
    },

    referCandidate({ dispatch, commit }, data) {
        candidateService.referCandidate(data).then(
            (data) => {
                commit("referCandidateSuccess", data);
                return data;
            },
            (error) => {
                commit("referCandidateFailure", error);
                dispatch("notification/error", error, { root: true });
            }
        );
    },

    selfRefer({ dispatch, commit }, data) {
        candidateService.selfRefer(data).then(
            (data) => {
                commit("referCandidateSuccess", data);
                return data;
            },
            (error) => {
                commit("referCandidateFailure", error);
                dispatch("notification/error", error, { root: true });
            }
        );
    },

    updateCV({ dispatch, commit }, { cvfile, candidate_id }) {
        commit("updateCVRequest", {});
        candidateService.updateCV(cvfile, candidate_id).then(
            (data) => {
                commit("updateCVSuccess", data);
                return data;
            },
            (error) => {
                commit("updateCVFailure", error);
                dispatch("notification/error", error, { root: true });
            }
        );
    },

    searchCandidateToMatching({ dispatch, commit }, {
        keyword_cv,
        salary_from,
        salary_to,
        date_from,
        date_to,
        city_ids,
        page_index,
        page_size,
        currency,
        negotiable,
    }) {
        commit("searchCandidateToMatchingRequest", {});
        candidateService
            .searchCandidateToMatching(
                keyword_cv,
                salary_from,
                salary_to,
                date_from,
                date_to,
                city_ids,
                page_index,
                page_size,
                currency,
                negotiable
            )
            .then(
                (data) => {
                    commit("searchCandidateToMatchingSuccess", data);
                    return data;
                },
                (error) => {
                    commit("searchCandidateToMatchingFailure", error);
                    dispatch("notification/error", error, { root: true });
                }
            );
    },

    jobMatching({ dispatch, commit }, data) {
        commit("jobMatchingRequest", {});
        candidateService.jobMatching(data).then(
            (data) => {
                commit("jobMatchingSuccess", data);
                return data;
            },
            (error) => {
                commit("jobMatchingFailure", error);
                dispatch("notification/error", error, { root: true });
            }
        );
    },
};

export const mutations = {
    searchCandidateForCollaboratorSuccess(state, candidateData) {
        state.candidateData = candidateData;
    },
    searchCandidateForCollaboratorFailure(state, candidateData) {
        state.candidateData = candidateData;
    },
    searchCandidateToReferSuccess(state, candidateData) {
        state.candidateData = candidateData;
    },
    searchCandidateToReferFailure(state, candidateData) {
        state.candidateData = candidateData;
    },
    updateCandidateStatusSuccess(state, candidateData) {
        state.candidateData = candidateData;
    },
    updateCandidateStatusFailure(state, candidateData) {
        state.candidateData = candidateData;
    },
    uploadCVSuccess(state, candidateData) {
        state.candidateData = candidateData;
    },
    uploadCVFailure(state, candidateData) {
        state.candidateData = candidateData;
    },
    createCandidateSuccess(state, createCandidateData) {
        state.createCandidateData = createCandidateData;
    },
    createCandidateFailure(state, createCandidateData) {
        state.createCandidateData = createCandidateData;
    },
    deteleCandidateRequest(state, deleteCandidateData) {
        state.deleteCandidateData = deleteCandidateData;
    },
    deteleCandidateSuccess(state, deleteCandidateData) {
        state.deleteCandidateData = deleteCandidateData;
    },
    deteleCandidateFailure(state, deleteCandidateData) {
        state.deleteCandidateData = deleteCandidateData;
    },
    getCandidateRequest(state, candidateData) {
        state.candidateData = candidateData;
    },
    getCandidateSuccess(state, candidateData) {
        state.candidateData = candidateData;
    },
    getCandidateFailure(state, candidateData) {
        state.candidateData = candidateData;
    },
    updateCandidateRequest(state, updateCandidateData) {
        state.updateCandidateData = updateCandidateData;
    },
    updateCandidateSuccess(state, updateCandidateData) {
        state.updateCandidateData = updateCandidateData;
    },
    updateCandidateFailure(state, updateCandidateData) {
        state.updateCandidateData = updateCandidateData;
    },
    referCandidateRequest(state, referCandidateData) {
        state.referCandidateData = referCandidateData;
    },
    referCandidateSuccess(state, referCandidateData) {
        state.referCandidateData = referCandidateData;
    },
    referCandidateFailure(state, referCandidateData) {
        state.referCandidateData = referCandidateData;
    },
    updateCVRequest(state, updateCVData) {
        state.updateCVData = updateCVData;
    },
    updateCVSuccess(state, updateCVData) {
        state.updateCVData = updateCVData;
    },
    updateCVFailure(state, updateCVData) {
        state.updateCVData = updateCVData;
    },
    searchCandidateToMatchingRequest(state, candidateData) {
        state.candidateData = candidateData;
    },
    searchCandidateToMatchingSuccess(state, candidateData) {
        state.candidateData = candidateData;
    },
    searchCandidateToMatchingFailure(state, candidateData) {
        state.candidateData = candidateData;
    },
    jobMatchingRequest(state, jobMatchingData) {
        state.jobMatchingData = jobMatchingData;
    },
    jobMatchingSuccess(state, jobMatchingData) {
        state.jobMatchingData = jobMatchingData;
    },
    jobMatchingFailure(state, jobMatchingData) {
        state.jobMatchingData = jobMatchingData;
    },
};