import { notificationService } from "../../helpers/service/notification.service";
const notificationData = {};
const newNotifyData = {};
const readSuccessData = {};
const notificationsData = {};
const deleteNotificationData = {};
export const state = {
    type: null,
    message: null,
    notificationData,
    newNotifyData,
    readSuccessData,
    notificationsData,
    deleteNotificationData,
};

export const actions = {
    getNotification({ dispatch, commit }, { notify_index, page_size, is_noti_firebase }) {
        notificationService.getNotification(notify_index, page_size)
            .then(
                (data) => {
                    if (is_noti_firebase) {
                        commit("getNotificationFirebaseSuccess", data);
                    } else {
                        commit("getNotificationSuccess", data);
                    }
                    return data;
                },
                (error) => {
                    commit("getNotificationFailure", error);
                    dispatch("notification/error", error, { root: true });
                }
            );
    },

    getNewNotification({ dispatch, commit }) {
        notificationService.getNewNotification()
            .then(
                (data) => {
                    commit("getNewNotificationSuccess", data);
                    return data;
                },
                (error) => {
                    commit("getNewNotificationFailure", error);
                    dispatch("notification/error", error, { root: true });
                }
            );
    },

    updateReadNotification({ dispatch, commit }, { notification_id }) {
        notificationService.updateReadNotification(notification_id)
            .then(
                (data) => {
                    commit("readNotificationSuccess", data);
                    return data;
                },
                (error) => {
                    commit("readNotificationFailure", error);
                    dispatch("notification/error", error, { root: true });
                }
            );
    },

    getAllNotification({ dispatch, commit }, {type, date_from, date_to, page_index, page_size}) {
        commit("getAllNotificationRequest", {});
        notificationService.getAllNotification(type, date_from, date_to, page_index, page_size)
        .then(
            (data) => {
                commit("getAllNotificationSuccess", data);
                return data;
            },
            (error) => {
                commit("getAllNotificationFailure", error);
                dispatch("notification/error", error, { root: true });
            }
        );
    },

    deleteNotification({ dispatch, commit }, notification_id) {
        commit("deleteNotificationRequest", {});
        notificationService.deleteNotification(notification_id)
        .then(
            (data) => {
                commit("deleteNotificationSuccess", data);
                return data;
            },
            (error) => {
                commit("deleteNotificationFailure", error);
                dispatch("notification/error", error, { root: true });
            }
        );
    },
}

export const mutations = {
    getNotificationSuccess(state, notificationData) {
        state.notificationData = notificationData;
    },
    getNotificationFirebaseSuccess(state, notificationData) {
        state.notificationData = notificationData;
    },
    getNewNotificationSuccess(state, newNotifyData) {
        state.newNotifyData = newNotifyData;
    },
    readNotificationSuccess(state, readSuccessData) {
        state.readSuccessData = readSuccessData;
    },
    getAllNotificationRequest(state, notificationsData) {
        state.notificationsData = notificationsData;
    },
    getAllNotificationSuccess(state, notificationsData) {
        state.notificationsData = notificationsData;
    },
    getAllNotificationFailure(state, notificationsData) {
        state.notificationsData = notificationsData;
    },
    deleteNotificationRequest(state, deleteNotificationData) {
        state.deleteNotificationData = deleteNotificationData;
    },
    deleteNotificationSuccess(state, deleteNotificationData) {
        state.deleteNotificationData = deleteNotificationData;
    },
    deleteNotificationFailure(state, deleteNotificationData) {
        state.deleteNotificationData = deleteNotificationData;
    },
};


