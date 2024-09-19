import { userService } from "../../helpers/fakebackend/user.service";
const company_data = {};
const industry_data = {};
const job_role_data = {};
const job_data = {};
const skill_data = {};
const function_data = {};
const language_data = {};
const city_data = {};
const package_data = {};
const postData = {};
const updateData = {};
const createdPost = {};
const isSuccess = false;
export const state = {
    company_data,
    isSuccess,
    industry_data,
    job_data,
    function_data,
    skill_data,
    job_role_data,
    language_data,
    city_data,
    package_data,
    postData,
    updateData,
    createdPost,
};

export const actions = {
    // Logs in the user.
    // eslint-disable-next-line no-unused-vars
    async createPost(context, postDatas) {
        const createdPost = await userService.createPost(postDatas);
        if (createdPost.data !== undefined) {
            context.commit("createPostSuccess", createdPost);
        } else {
            context.commit("createPostFailure", createdPost);
        }
    },
    async getCompanyInformation({ commit }) {
        const company_data = await userService.getCompanies();
        if (company_data !== null) {
            commit("postSuccess", company_data);
        } else {
            commit("postFailure", company_data);
        }
    },

    async getIndustryInformation({ commit }) {
        const industry_data = await userService.getIndustries();
        if (industry_data !== null) {
            commit("industrySuccess", industry_data);
        } else {
            commit("industryFailure", industry_data);
        }
    },
    async getIndustryWithoutFunctionAndJob({ commit }) {
        const industry_data = await userService.getAllIndustry();
        if (industry_data !== null) {
            commit("industrySuccess", industry_data);
        } else {
            commit("industryFailure", industry_data);
        }
    },
    async getFunctionsInformationByIndustry({ commit }, industryId) {
        const function_data = await userService.getFunctionsByIndustry(industryId);
        if (function_data != null) {
            commit("functionSuccess", function_data);
        } else {
            commit("functionFailure", function_data);
        }
    },
    async getJobsByFunction({ commit }, functionId) {
        const job_data = await userService.getJobsByFunction(functionId);
        if (job_data != null) {
            commit("jobSuccess", job_data);
        } else {
            commit("jobFailure", job_data);
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
    async getJobRoleByFunction({ commit }, functionId) {
        const job_role_data = await userService.getJobRolesByFunction(functionId);
        if (job_role_data !== null) {
            commit("jobRoleSuccess", job_role_data);
        } else {
            commit("jobRoleFailure", job_role_data);
        }
    },
    async getFunctionInformation({ commit }) {
        const function_data = await userService.getFunctions();
        if (function_data != null) {
            commit("functionSuccess", function_data);
        } else {
            commit("functionFailure", function_data);
        }
    },

    async getJobInformation({ commit }) {
        const job_data = await userService.getJobs();
        if (job_data != null) {
            commit("jobSuccess", job_data);
        } else {
            commit("jobFailure", job_data);
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
    async getQuestionPackages({ commit }) {
        const package_data = await userService.getQuestionPackages();
        if (package_data != null) {
            commit("packageSuccess", package_data);
        } else {
            commit("packageFailure", package_data);
        }
    },
    async getPost({ dispatch, commit }, id) {
        const postData = await userService.getPost(id);
        if (postData !== null) {
            commit("profileSuccess", postData);
        } else {
            commit("profileFailure", postData);
            dispatch("notification/error", postData, { root: true });
        }
    },
    async updatePost(context, dataUser) {
        const postId = dataUser.id;
        delete dataUser.id;
        const updateData = await userService.updatePost(postId, dataUser);
        if (updateData.data !== undefined) {
            context.commit("updateSuccess", updateData);
        } else {
            context.commit("updateFailure", updateData);
        }
    },
};
export const getters = {
    getCompanyGetter(state) {
        return state.company_data;
    },
    getIndustryGetter(state) {
        return state.industry_data;
    },
    getJobRolesGetter(state) {
        return state.job_role_data;
    },
    getFunctionGetter(state) {
        return state.function_data;
    },
    getJobGetter(state) {
        return state.job_data;
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
    getPostGetter(state) {
        return state.postData;
    },
};
export const mutations = {
    postSuccess(state, company_data) {
        state.company_data = company_data;
    },
    postFailure(state, company_data) {
        state.company_data = company_data;
    },
    industrySuccess(state, industry_data) {
        state.industry_data = industry_data;
    },
    industryFailure(state, industry_data) {
        state.industry_data = industry_data;
    },
    jobRoleSuccess(state, job_role_data) {
        state.job_role_data = job_role_data;
    },
    jobRoleFailure(state, job_role_data) {
        state.job_role_data = job_role_data;
    },
    jobSuccess(state, job_data) {
        state.job_data = job_data;
    },
    jobFailure(state, job_data) {
        state.job_data = job_data;
    },
    functionSuccess(state, function_data) {
        state.function_data = function_data;
    },
    functionFailure(state, function_data) {
        state.function_data = function_data;
    },
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
    packageSuccess(state, package_data) {
        state.package_data = package_data;
    },
    packageFailure(state, package_data) {
        state.package_data = package_data;
    },
    profileSuccess(state, postData) {
        state.postData = postData;
    },
    profileFailure(state, postData) {
        state.postData = postData;
    },
    updateSuccess(state, updateData) {
        state.updateData = updateData;
    },
    updateFailure(state, updateData) {
        state.updateData = updateData;
    },
    createPostSuccess(state, createdPost) {
        state.createdPost = createdPost;
    },
    createPostFailure(state, createdPost) {
        state.createdPost = createdPost;
    },
};