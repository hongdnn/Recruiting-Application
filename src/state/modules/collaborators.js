import { collaboratorService } from "../../helpers/service/collaborators.service";
const collaboratorData = {};
const introductionsData = {};
const updateCollaboratorStatusData = {};
export const state = {
    collaboratorData,
    introductionsData,
    updateCollaboratorStatusData,
};

export const actions = {
    searchCollaborators({ dispatch, commit }, { keyword, status, page_index, page_size, sort_by }) {
        collaboratorService
            .searchCollab(keyword, status, page_index, page_size, sort_by)
            .then(
                (data) => {
                    commit("searchCollaboratorSuccess", data);
                },
                (error) => {
                    commit("searchCollaboratorFailure", error);
                }
            );
    },

    getCollaboratorDetailByEmployer({ dispatch, commit }, id) {
        collaboratorService.getCollaboratorDetailByEmployer(id).then(
            (data) => {
                commit("getCollabortorSuccess", data);
            },
            (error) => {
                commit("getCollabortorFailure", error);
            }
        );
    },

    searchCandidateIntroductionForCollaborator({ dispatch, commit }, {
        keyword,
        collaborator_id,
        company_ids,
        status,
        page_index,
        page_size,
        sort_by,
    }){
        collaboratorService.searchCandidateIntroductionForCollaborator(
            keyword,
            collaborator_id,
            company_ids,
            status,
            page_index,
            page_size,
            sort_by
        ).then(
            (data) => {
                commit("searchCandidateIntroductionForCollaboratorSuccess", data);
            },
            (error) => {
                commit("searchCandidateIntroductionForCollaboratorFailure", error);
            }
        );
    },

    updateCollaboratorStatus({ dispatch, commit }, data) {
        collaboratorService.updateCollaboratorStatus(data).then(
            (data) => {
                commit("updateCollaboratorStatusSuccess", data);
            },
            (error) => {
                commit("updateCollaboratorStatusFailure", error);
            }
        );
    },
};

export const mutations = {
    searchCollaboratorSuccess(state, collaboratorData) {
        state.collaboratorData = collaboratorData;
    },
    searchCollaboratorFailure(state, collaboratorData) {
        state.collaboratorData = collaboratorData;
    },
    getCollabortorSuccess(state, collaboratorData) {
        state.collaboratorData = collaboratorData
    },
    getCollabortorFailure(state, collaboratorData) {
        state.collaboratorData = collaboratorData
    },
    searchCandidateIntroductionForCollaboratorSuccess(state, introductionsData) {
        state.introductionsData = introductionsData
    },
    searchCandidateIntroductionForCollaboratorFailure(state, introductionsData) {
        state.introductionsData = introductionsData
    },
    updateCollaboratorStatusSuccess(state, updateCollaboratorStatusData) {
        state.updateCollaboratorStatusData = updateCollaboratorStatusData
    },
    updateCollaboratorStatusFailure(state, updateCollaboratorStatusData) {
        state.updateCollaboratorStatusData = updateCollaboratorStatusData
    },
};