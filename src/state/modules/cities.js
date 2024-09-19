import { userService } from "../../helpers/fakebackend/user.service";
const citiesData = {};
export const state = citiesData;

export const actions = {
    getCitiesList({ dispatch, commit }) {
        userService.getCities().then(
            (data) => {
                commit("getCitiesSuccess", data);
            },
            (error) => {
                commit("getCitiesFailure", error);
                dispatch("notification/error", error, { root: true });
            }
        );
    },
};

export const mutations = {
    getCitiesSuccess(state, citiesData) {
        state.citiesData = citiesData;
    },
    getCitiesFailure(state, citiesData) {
        state.citiesData = citiesData;
    },
};