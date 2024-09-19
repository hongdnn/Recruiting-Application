import { userService } from "../../helpers/fakebackend/user.service";
import router from "../../router/index";

const user = JSON.parse(localStorage.getItem("user"));
export const state = user ?
    { status: { loggeduser: true }, user } :
    { status: {}, user: null };

export const actions = {
    // Logs in the user.
    // eslint-disable-next-line no-unused-vars

    login({ commit }, { email, password }) {
        try {
            commit("loginRequest", { email });

            userService.login(email, password).then(
                (user) => {
                    commit("loginSuccess", user);
                },
                (error) => {
                    commit("loginFailure");
                    error = "Email/Password combination was incorrect";
                    return error;
                }
            );
        } catch {
            return { error: "Email/Password combination was incorrect" };
        }
    },
    //Login by social account
    loginSocialAccount({ dispatch, commit }, { email, first_name, last_name }) {
        commit("loginRequest", { email });

        userService.loginSocialAccount(email, first_name, last_name).then(
            (user) => {
                commit("loginSuccess", user);
                router.push("/");
            },
            (error) => {
                commit("loginFailure", error);
                dispatch("notification/error", error, { root: true });
            }
        );
    },
    // Logout the user
    async logout({ commit }) {
        await userService.logout();
        commit("logout");
        router.push("/login");
    },
    // register the user
    registeruser({ dispatch, commit }, user) {
        commit("registerRequest", user);
        userService.register(user).then(
            (user) => {
                commit("registerSuccess", user);
                dispatch("notification/success", "Confirm your Email", { root: true });
                // router.push('/verify-account');
            },
            (error) => {
                commit("registerFailure", error);
                dispatch("notification/error", error, { root: true });
            }
        );
    },

    confirmAccount({ dispatch, commit }, { verifyCode, email }) {
        commit("confirmAccountRequest", email);
        userService.confirmAccount(verifyCode, email).then(
            (user) => {
                commit("confirmAccountSuccess", user);
                router.push("/");
            },
            (error) => {
                commit("confirmAccountFailure", error);
                dispatch("notification/error", error, { root: true });
            }
        );
    },

    forgotPassword({ dispatch, commit }, email) {
        commit("forgotPasswordRequest", email);
        userService.forgotPassword(email).then(
            (data) => {
                commit("forgotPasswordSuccess", data);
                dispatch("notification/success", "Check email for confirmation", {
                    root: true,
                });
            },
            (error) => {
                commit("forgotPasswordFailure");
                dispatch("notification/error", error, { root: true });
            }
        );
    },

    resetPassword({ dispatch, commit }, { email, password, verification_code }) {
        commit("resetPasswordRequest", email);
        userService.resetPassword(email, password, verification_code).then(
            (data) => {
                commit("resetPasswordSuccess", data);
                dispatch("notification/success", "Change password success", {
                    root: true,
                });
                router.push("/");
            },
            (error) => {
                commit("resetPasswordFailure");
                dispatch("notification/error", error, { root: true });
            }
        );
    },
};

export const mutations = {
    loginRequest(state, user) {
        state.status = { loggingIn: true };
        state.user = user;
    },
    loginSuccess(state, user) {
        state.status = { loggeduser: true };
        state.user = user;
    },
    loginFailure(state) {
        state.status = {};
        state.user = null;
    },
    logout(state) {
        state.status = {};
        state.user = null;
    },
    registerRequest(state) {
        state.status = { registering: true };
    },
    registerSuccess(state) {
        state.status = {};
    },
    registerFailure(state) {
        state.status = {};
    },
    forgotPasswordRequest(state) {
        state.status = {};
    },
    forgotPasswordSuccess(state) {
        state.status = {};
    },
    forgotPasswordFailure(state) {
        state.status = {};
    },
    confirmAccountRequest(state) {
        state.status = {};
    },
    confirmAccountSuccess(state) {
        state.status = {};
    },
    confirmAccountFailure(state) {
        state.status = {};
    },
    resetPasswordRequest(state) {
        state.status = {};
    },
    resetPasswordSuccess(state) {
        state.status = {};
    },
    resetPasswordFailure(state) {
        state.status = {};
    },
};