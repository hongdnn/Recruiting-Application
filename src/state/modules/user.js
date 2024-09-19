import { userService } from "../../helpers/fakebackend/user.service";
const userProfile = {};
const bankAccount = {};
const userCollab = {};
const userEmployer = {};
const changePassword = {};
const industry_data = {};
const industry_collab_data = {};
const job_role_data = {};
const skill_data = {};
const language_data = {};
const city_data = {};
const bankImgData = {};
export const state = {
    userProfile,
    userCollab,
    userEmployer,
    industry_data,
    job_role_data,
    skill_data,
    language_data,
    city_data,
    changePassword,
    bankAccount,
    bankImgData,
    industry_collab_data
};

export const actions = {
    // Logs in the user.
    // eslint-disable-next-line no-unused-vars

    async getProfileByCollaborator({ dispatch, commit }, id) {
        const userCollab = await userService.getProfileByCollaborator(id);
        if (userCollab !== null) {
            commit("profileCollabSuccess", userCollab);
        } else {
            commit("profileCollabFailure", userCollab);
            dispatch("notification/error", userCollab, { root: true });
        }
    },

    async getProfileByEmployer({ dispatch, commit }, id) {
        const userProfile = await userService.getProfileByEmployer(id);
        if (userProfile !== null) {
            commit("getProfileSuccess", userProfile);
        } else {
            commit("getProfileFailure", userProfile);
            dispatch("notification/error", userProfile, { root: true });
        }
    },
    async putProfileByCollaborator(context, dataUser) {
        const id = dataUser.id;
        delete dataUser.id;
        const userProfile = await userService.updateProfileByCollaborator(
            id,
            dataUser
        );
        if (userProfile !== null) {
            context.commit("profileSuccess", userProfile);
            context.commit("imageProfileSuccess", userProfile);
        } else {
            context.commit("profileFailure", userProfile);
        }
    },

    uploadBankImg({ commit }, { front_side_image, back_side_image }) {
        userService.uploadBankImages(front_side_image, back_side_image).then(
            (data) => {
                commit("uploadBankImgSuccess", data);
            },
            (error) => {
                commit("uploadBankImgFailure", error);
            }
        );
    },

    async putBankAccount(context, dataBankAccount) {
        const bankAccount = await userService.updateBankAccountByCollaborator(
            dataBankAccount
        );
        if (bankAccount !== null) {
            context.commit("bankAccountSuccess", bankAccount);
        } else {
            context.commit("bankAccountFailure", bankAccount);
        }
    },

    async putProfileByEmployer(context, dataUser) {
        const id = dataUser.id;
        delete dataUser.id;
        const userProfile = await userService.updateProfileByEmployer(id, dataUser);
        if (userProfile !== null) {
            context.commit("profileSuccess", userProfile);
            context.commit("imageProfileSuccess", userProfile);
        } else {
            context.commit("profileFailure", userProfile);
            context.dispatch("notification/error", userProfile, { root: true });
        }
    },

    changePassword({ commit }, data) {
        userService.changePassword(data).then(
            (data) => {
                commit("changePasswordSuccess", data);
            },
            (error) => {
                commit("changePasswordFailure", error);
            }
        );
    },
    async getIndustryInformation({ commit }) {
        const industry_data = await userService.getIndustries();
        if (industry_data !== null) {
            commit("industrySuccess", industry_data);
        } else {
            commit("industryFailure", industry_data);
        }
    },
    async getIndustryForCollaborator({ commit }) {
        const industry_collab_data = await userService.getIndustriesForCollaborator();
        if (industry_collab_data !== null) {
            commit("industryForCollabSuccess", industry_collab_data);
        } else {
            commit("industryForCollabFailure", industry_collab_data);
        }
    },
    async getJobRoleInformation({ commit }) {
        const job_role_data = await userService.getJobRoles();
        if (job_role_data !== null) {
            commit("jobRoleSuccess", job_role_data);
        } else {
            commit("jobRoleFailure", job_role_data);
        }
    },
    async getSkillInformation({ commit }) {
        const skill_data = await userService.getSkills();
        if (skill_data != null) {
            commit("skillSuccess", skill_data);
        } else {
            commit("skillFailure", skill_data);
        }
    },

    async getLanguageInformation({ commit }) {
        const language_data = await userService.getLanguages();
        if (language_data !== null) {
            commit("languageSuccess", language_data);
        } else {
            commit("languageFailure", language_data);
        }
    },
    async getCityInformation({ commit }) {
        const city_data = await userService.getCities();
        if (city_data !== null) {
            commit("citySuccess", city_data);
        } else {
            commit("cityFailure", city_data);
        }
    },
};
export const getters = {
    getIndustryGetter(state) {
        return state.industry_data;
    },
    getIndustryForCollabGetter(state) {
        return state.industry_collab_data;
    },
    getJobRolesGetter(state) {
        return state.job_role_data;
    },
    getProfileGetter(state) {
        return state.userProfile;
    },
    getProfileCollabGetter(state) {
        return state.userCollab;
    },
    getSkillsGetter(state) {
        return state.skill_data;
    },
    getLanguagesGetter(state) {
        return state.language_data;
    },
    getCityGetter(state) {
        return state.city_data;
    },
};
export const mutations = {
    skillSuccess(state, skill_data) {
        state.skill_data = skill_data;
    },
    skillFailure(state, skill_data) {
        state.skill_data = skill_data;
    },
    languageSuccess(state, language_data) {
        state.language_data = language_data;
    },
    languageFailure(state, language_data) {
        state.language_data = language_data;
    },
    citySuccess(state, city_data) {
        state.city_data = city_data;
    },
    cityFailure(state, city_data) {
        state.city_data = city_data;
    },
    industrySuccess(state, industry_data) {
        state.industry_data = industry_data;
    },
    industryFailure(state, industry_data) {
        state.industry_data = industry_data;
    },
    industryForCollabSuccess(state, industry_collab_data) {
        state.industry_collab_data = industry_collab_data;
    },
    industryForCollabFailure(state, industry_collab_data) {
        state.industry_collab_data = industry_collab_data;
    },
    jobRoleSuccess(state, job_role_data) {
        state.job_role_data = job_role_data;
    },
    jobRoleFailure(state, job_role_data) {
        state.job_role_data = job_role_data;
    },
    profileSuccess(state, userProfile) {
        state.userProfile = userProfile;
    },
    imageProfileSuccess(state, userProfile) {
        state.userProfile = userProfile;
    },
    profileFailure(state, userProfile) {
        state.userProfile = userProfile;
    },
    getProfileSuccess(state, userEmployer) {
        state.userEmployer = userEmployer;
    },
    getProfileFailure(state, userEmployer) {
        state.userEmployer = userEmployer;
    },
    bankAccountSuccess(state, bankAccount) {
        state.bankAccount = bankAccount;
    },
    bankAccountFailure(state, bankAccount) {
        state.bankAccount = bankAccount;
    },
    uploadBankImgSuccess(state, bankImgData) {
        state.bankImgData = bankImgData;
    },
    uploadBankImgFailure(state, bankImgData) {
        state.bankImgData = bankImgData;
    },
    profileCollabSuccess(state, userCollab) {
        state.userCollab = userCollab;
    },
    profileCollabFailure(state, userCollab) {
        state.userCollab = userCollab;
    },
    changePasswordSuccess(state, changePassword) {
        state.changePassword = changePassword;
    },
    changePasswordFailure(state, changePassword) {
        state.changePassword = changePassword;
    },
};