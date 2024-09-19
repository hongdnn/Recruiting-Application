import { userService } from "../../helpers/fakebackend/user.service";
const job_roles_data = {};
export const state = job_roles_data;

export const actions = {
    // Logs in the user.
    // eslint-disable-next-line no-unused-vars

    async getJobRoles() {
        const roles = await userService.getJobRoles();
        if (roles !== null) {
            context.commit("postSuccess", job_roles_data);
        } else {
            context.commit("postFailure", job_roles_data);
            context.dispatch("notification/error", job_roles_data, { root: true });
        }
    },
};
export const getters = {
    getPost(state) {
        return state.job_roles_data;
    },
};
export const mutations = {
    profileSuccess(state, job_roles_data) {
        state.job_roles_data = job_roles_data;
    },
    profileFailure(state, job_roles_data) {
        state.job_roles_data = job_roles_data;
    },
};