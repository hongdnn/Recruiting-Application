import {placementService} from "../../helpers/service/placement.service";

const createPlacementData = {};
const placementsData = {};
const placementData = {};
const updatePlacementData = {};

export const state = {
    createPlacementData,
    placementsData,
    placementData,
    updatePlacementData,
};

export const actions = {
    createPlacement({ dispatch, commit }, data) {
        commit('createPlacementRequest', {});
        placementService.createPlacement(data)
        .then(
            data => {
                commit('createPlacementSuccess', data);
                return data;
            },
            error => {
                commit('createPlacementFailure', error);
                dispatch('notification/error', error, { root: true });
            }
        );
    },

    searchPlacementByEmployer({ dispatch, commit }, {keyword, companyIds, paymentStatus, pageIndex, pageSize, sortBy}) {
        commit('searchPlacementRequest', {});
        placementService.searchPlacementByEmployer(keyword, companyIds, paymentStatus, pageIndex, pageSize, sortBy)
        .then(
            data => {
                commit('searchPlacementSuccess', data);
                return data;
            },
            error => {
                commit('searchPlacementFailure', error);
                dispatch('notification/error', error, { root: true });
            }
        );
    },

    searchPlacementByCollaborator({ dispatch, commit }, {keyword, companyIds, paymentStatus, pageIndex, pageSize, sortBy}) {
        commit('searchPlacementRequest', {});
        placementService.searchPlacementByCollaborator(keyword, companyIds, paymentStatus, pageIndex, pageSize, sortBy)
        .then(
            data => {
                commit('searchPlacementSuccess', data);
                return data;
            },
            error => {
                commit('searchPlacementFailure', error);
                dispatch('notification/error', error, { root: true });
            }
        );
    },

    getPlacementDetail({ dispatch, commit }, placement_id) {
        commit('getPlacementRequest', {});
        placementService.getPlacementDetail(placement_id)
        .then(
            data => {
                commit('getPlacementSuccess', data);
                return data;
            },
            error => {
                commit('getPlacementFailure', error);
                dispatch('notification/error', error, { root: true });
            }
        );
    },

    updatePlacementStatus({ dispatch, commit }, data) {
        commit('updatePlacementRequest', {});
        placementService.updatePlacementStatus(data)
        .then(
            data => {
                commit('updatePlacementSuccess', data);
                return data;
            },
            error => {
                commit('updatePlacementFailure', error);
                dispatch('notification/error', error, { root: true });
            }
        );
    },
};

export const mutations = {
    createPlacementRequest(state, createPlacementData) {
        state.createPlacementData = createPlacementData;
    },
    createPlacementSuccess(state, createPlacementData) {
        state.createPlacementData = createPlacementData;
    },
    createPlacementFailure(state, createPlacementData) {
        state.createPlacementData = createPlacementData;
    },
    searchPlacementRequest(state, placementsData) {
        state.placementsData = placementsData;
    },
    searchPlacementSuccess(state, placementsData) {
        state.placementsData = placementsData;
    },
    searchPlacementFailure(state, placementsData) {
        state.placementsData = placementsData;
    },
    getPlacementRequest(state, placementData) {
        state.placementData = placementData;
    },
    getPlacementSuccess(state, placementData) {
        state.placementData = placementData;
    },
    getPlacementFailure(state, placementData) {
        state.placementData = placementData;
    },
    updatePlacementRequest(state, updatePlacementData) {
        state.updatePlacementData = updatePlacementData;
    },
    updatePlacementSuccess(state, updatePlacementData) {
        state.updatePlacementData = updatePlacementData;
    },
    updatePlacementFailure(state, updatePlacementData) {
        state.updatePlacementData = updatePlacementData;
    },
};