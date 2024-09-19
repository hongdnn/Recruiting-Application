import { userService } from "../../helpers/fakebackend/user.service";
const staffData = {};
const updateData = {};
const permissionData = {};
const imgData = {};
const updatedImgData = {};
const createdStaff = {};

export const state = {
    staffData,
    permissionData,
    imgData,
    updatedImgData,
    createdStaff,
    updateData
};

export const actions = {
    getStaffDetail({ commit }, staff_id) {
        userService.getStaffDetailByEmloyer(staff_id).then(
            (data) => {
                commit("getStaffDetailSuccess", data);
                return data;
            },
            (error) => {
                commit("getStaffDetailFailure", error);
            }
        );
    },

    getData() {
        return state.staffData;
    },

    createNewStaff({ commit }, data) {
        userService.createStaffByEmployer(data).then(
            (data) => {
                if (typeof (data) !== "string") {
                    commit("createStaffSuccess", data);
                    return data;
                }
            },
            (error) => {
                commit("createStaffFailure", error);
            }
        );
    },

    uploadImg({ commit }, { img }) {
        userService.uploadImg(img).then(
            (data) => {
                commit("uploadImgSuccess", data);
            },
            (error) => {
                commit("uploadImgFailure", error);
            }
        );
    },

    uploadUpdateImg({ commit }, { img }) {
        userService.uploadImg(img).then(
            (data) => {
                commit("uploadUpdateImgSuccess", data);
            },
            (error) => {
                commit("uploadUpdateImgFailure", error);
            }
        );
    },

    async editStaff({ commit }, { data }) {
        const staffId = data.id;
        delete data.id;
        const updateData = await userService.updateStaff(staffId, data);
        if (updateData.status === 0) {
            commit("updateStaffSuccess", updateData);
        } else {
            commit("updateStaffFailure", updateData);
        }
    },
    searchStaffForEmployer({ commit }, { keyword, page_index, page_size, sort_by, status }) {
        userService
            .searchStaffByEmployer(keyword, page_index, page_size, sort_by, status)
            .then(
                (data) => {
                    commit("searchStaffSuccess", data);
                },
                (error) => {
                    commit("searchStaffFauilure", error);
                }
            );
    },

    async getPermissions({ commit }) {
        const permissionData = await userService.getPermissionsByEmployer();
        if (permissionData !== null) {
            commit("permissionSuccess", permissionData);
        } else {
            commit("permissionFailure", permissionData);
        }
    },
};

export const mutations = {
    uploadImgSuccess(state, imgData) {
        state.imgData = imgData;
    },
    uploadImgFailure(state, staffData) {
        state.staffData = staffData;
    },
    uploadUpdateImgSuccess(state, updatedImgData) {
        state.updatedImgData = updatedImgData;
    },
    uploadUpdateImgFailure(state, updatedImgData) {
        state.updatedImgData = updatedImgData;
    },
    getStaffDetailSuccess(state, staffData) {
        state.staffData = staffData;
    },
    getStaffDetailFailure(state, staffData) {
        state.staffData = staffData;
    },
    createStaffSuccess(state, createdStaff) {
        state.createdStaff = createdStaff;
    },
    createStaffFailure(state, createdStaff) {
        state.createdStaff = createdStaff;
    },
    permissionSuccess(state, permissionData) {
        state.permissionData = permissionData;
    },
    permissionFailure(state, permissionData) {
        state.permissionData = permissionData;
    },
    searchStaffSuccess(state, staffData) {
        state.staffData = staffData;
    },
    searchStaffFauilure(state, staffData) {
        state.staffData = staffData;
    },
    updateStaffSuccess(state, updateData) {
        state.updateData = updateData;
    },
    updateStaffFailure(state, updateData) {
        state.updateData = updateData;
    }
};