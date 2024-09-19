import { userService } from "../../helpers/fakebackend/user.service";
const companiesData = {};
const industries_data = {};
const jobs_data = {};
const functions_data = {};
const cities_data = {};
const imgData = {};
const updatedImgData = {};
const updateData = {};
const createdCompanies = {};

export const state = {
    companiesData,
    createdCompanies,
    industries_data,
    jobs_data,
    functions_data,
    cities_data,
    imgData,
    updatedImgData,
    updateData,
};

export const actions = {
    getCompaniesList({ dispatch, commit }) {
        userService.getCompanies().then(
            (data) => {
                commit("getCompaniesSuccess", data);
            },
            (error) => {
                commit("getCompaniesFauilure", error);
                dispatch("notification/error", error, { root: true });
            }
        );
    },

    searchCompaniesForEmployer({ dispatch, commit }, { keyword, industry_ids, page_index, page_size, sort_by }) {
        userService
            .searchCompanyByEmployer(
                keyword,
                industry_ids,
                page_index,
                page_size,
                sort_by
            )
            .then(
                (data) => {
                    commit("searchCompaniesSuccess", data);
                },
                (error) => {
                    commit("searchCompaniesFauilure", error);
                    dispatch("notification/error", error, { root: true });
                }
            );
    },

    async createNewCompanies({ commit }, data) {
        const result = await userService.createCompanyByEmployer(data);
        if (result.status !== undefined && result.status === 0) {
            commit("createCompanySuccess", result);
        } else {
            commit("createCompanyFailure", result);
        }
    },
    getData() {
        return state.companiesData;
    },

    async getCompanyDetail({ dispatch, commit }, _id) {
        const data = await userService.getCompanyDetailByEmployer(_id);
        if (data !== null) {
            commit("getCompanyDetailSuccess", data);
        } else {
            commit("getCompanyDetailFailure", data);
            dispatch("notification/error", data, { root: true });
        }
        // userService.getCompanyDetailByEmployer(_id).then(
        //     (data) => {
        //         commit("getCompanyDetailSuccess", data);
        //         return data;
        //     },
        //     (error) => {
        //         commit("getCompanyDetailFailure", error);
        //         dispatch("notification/error", error, { root: true });
        //     }
        // );
    },

    async getIndustriesInformation({ commit }) {
        const industries_data = await userService.getIndustries();
        if (industries_data !== null) {
            commit("industriesSuccess", industries_data);
        } else {
            commit("industriesFailure", industries_data);
        }
    },
    async getIndustriesWithoutFunctionAndJob({ commit }) {
        const industries_data = await userService.getAllIndustry();
        if (industries_data !== null) {
            commit("industriesSuccess", industries_data);
        } else {
            commit("industriesFailure", industries_data);
        }
    },

    async getFunctionsInformation({ commit }) {
        const functions_data = await userService.getFunctions();
        if (functions_data != null) {
            commit("functionsSuccess", functions_data);
        } else {
            commit("functionsFailure", functions_data);
        }
    },
    async getFunctionsInformationByIndustry({ commit }, industryId) {
        const functions_data = await userService.getFunctionsByIndustry(industryId);
        if (functions_data != null) {
            commit("functionsSuccess", functions_data);
        } else {
            commit("functionsFailure", functions_data);
        }
    },

    async getJobsInformation({ commit }) {
        const jobs_data = await userService.getJobs();
        if (jobs_data != null) {
            commit("jobsSuccess", jobs_data);
        } else {
            commit("jobsFailure", jobs_data);
        }
    },

    async getJobsByFunction({ commit }, functionId) {
        const jobs_data = await userService.getJobsByFunction(functionId);
        if (jobs_data != null) {
            commit("jobsSuccess", jobs_data);
        } else {
            commit("jobsFailure", jobs_data);
        }
    },

    async getCityInformation({ commit }) {
        const cities_data = await userService.getCities();
        if (cities_data !== null) {
            commit("citySuccess", cities_data);
        } else {
            commit("cityFailure", cities_data);
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
            context.dispatch("notification/error", updateData, { root: true });
        }
    },
    uploadImg({ commit }, { imageCompany }) {
        userService.uploadImgCompany(imageCompany).then(
            (data) => {
                commit("uploadImgSuccess", data);
            },
            (error) => {
                commit("uploadImgFailure", error);
            }
        );
    },

    uploadUpdateImg({ commit }, { imageCompany }) {
        userService.uploadImgCompany(imageCompany).then(
            (data) => {
                commit("uploadUpdateImgSuccess", data);
            },
            (error) => {
                commit("uploadUpdateImgFailure", error);
            }
        );
    },

    async editCompany({ commit }, { data }) {
        const companyId = data.id;
        delete data.id;
        const updateData = await userService.updateCompany(companyId, data);
        if (updateData.status === 0) {
            commit("updateCompanySuccess", updateData);
        } else {
            commit("updateCompanyFailure", updateData);
        }
    },
};

export const getters = {
    getIndustriesGetter(state) {
        return state.industries_data;
    },
    getFunctionsGetter(state) {
        return state.functions_data;
    },
    getJobsGetter(state) {
        return state.jobs_data;
    },
    getCitiesGetter(state) {
        return state.cities_data;
    },
    getCompanyGetter(state) {
        return state.companiesData;
    },
};

export const mutations = {
    updateCompanySuccess(state, updateData) {
        state.updateData = updateData;
    },
    updateCompanyFailure(state, updateData) {
        state.updateData = updateData;
    },
    uploadImgSuccess(state, imgData) {
        state.imgData = imgData;
    },
    uploadImgFailure(state, imgData) {
        state.imgData = imgData;
    },
    uploadUpdateImgSuccess(state, updatedImgData) {
        state.updatedImgData = updatedImgData;
    },
    uploadUpdateImgFailure(state, updatedImgData) {
        state.updatedImgData = updatedImgData;
    },
    citySuccess(state, cities_data) {
        state.cities_data = cities_data;
    },
    cityFailure(state, cities_data) {
        state.cities_data = cities_data;
    },
    industriesSuccess(state, industries_data) {
        state.industries_data = industries_data;
    },
    industriesFailure(state, industries_data) {
        state.industries_data = industries_data;
    },

    jobsSuccess(state, jobs_data) {
        state.jobs_data = jobs_data;
    },
    jobsFailure(state, jobs_data) {
        state.jobs_data = jobs_data;
    },
    functionsSuccess(state, functions_data) {
        state.functions_data = functions_data;
    },
    functionsFailure(state, functions_data) {
        state.functions_data = functions_data;
    },
    getCompanyDetailSuccess(state, companiesData) {
        state.companiesData = companiesData;
    },
    getCompanyDetailFailure(state, companiesData) {
        state.companiesData = companiesData;
    },
    getCompaniesSuccess(state, companiesData) {
        state.companiesData = companiesData;
    },
    getCompaniesFauilure(state, companiesData) {
        state.companiesData = companiesData;
    },
    createCompanySuccess(state, createdCompanies) {
        state.createdCompanies = createdCompanies;
    },
    createCompanyFauilure(state, createdCompanies) {
        state.createdCompanies = createdCompanies;
    },
    searchCompaniesSuccess(state, companiesData) {
        state.companiesData = companiesData;
    },
    searchCompaniesFauilure(state, companiesData) {
        state.companiesData = companiesData;
    },
};