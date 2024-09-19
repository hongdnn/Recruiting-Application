import {
    authHeader,
    authHeaderFormData,
} from "../../helpers/fakebackend/auth-header";
import { generateApiUrl } from "../../helpers/common/APIConstants";

export const interviewService = {
    getSupervisor,
    createSchedule,
    getInterviewScheduleDetail,
    updateInterviewSchedule,
    updateInterviewScheduleStatus,
    updateInterviewQuestion,
};

function handleResponse(response) {
    return response.text().then((text) => {
        const data = text && JSON.parse(text);
        if (!response.ok) {
            if (response.status === 401) {
                // auto logout if 401 response returned from api
                logout();
                location.reload(true);
            }
            const error = (data && data.message) || response.statusText;
            return Promise.reject(error);
        }
        return data;
    });
}

function getSupervisor() {
    const requestOptions = {
        method: "GET",
        headers: authHeader(),
    };

    const url = generateApiUrl("/users/employers");

    return fetch(url, requestOptions)
        .then(handleResponse)
        .then((data) => {
            return data;
        });
}

function createSchedule(data) {
    const json = JSON.stringify(data);

    const requestOptions = {
        method: "POST",
        headers: authHeader(),
        body: json,
    };

    const url = generateApiUrl("/interviewschedules/");

    return fetch(url, requestOptions)
        .then(handleResponse)
        .then((data) => {
            return data;
        });
}

function getInterviewScheduleDetail(schedule_id) {
    const requestOptions = {
        method: "GET",
        headers: authHeader(),
    };

    const url = generateApiUrl("/interviewschedules/" + schedule_id);

    return fetch(url, requestOptions)
        .then(handleResponse)
        .then((data) => {
            return data;
        });
}

function updateInterviewSchedule(schedule_id, data) {
    const json = JSON.stringify(data);

    const requestOptions = {
        method: "PUT",
        headers: authHeader(),
        body: json,
    };

    const url = generateApiUrl("/interviewschedules/" + schedule_id);

    return fetch(url, requestOptions)
        .then(handleResponse)
        .then((data) => {
            return data;
        });
}

function updateInterviewScheduleStatus(schedule_id, data) {
    const json = JSON.stringify(data);

    const requestOptions = {
        method: "PUT",
        headers: authHeader(),
        body: json,
    };

    const url = generateApiUrl("/interviewschedules/status/" + schedule_id);

    return fetch(url, requestOptions)
        .then(handleResponse)
        .then((data) => {
            return data;
        });
}

function updateInterviewQuestion(schedule_id, data) {
    const json = JSON.stringify(data);

    const requestOptions = {
        method: "POST",
        headers: authHeader(),
        body: json,
    };

    const url = generateApiUrl("/interviewschedules/questions/" + schedule_id);

    return fetch(url, requestOptions)
        .then(handleResponse)
        .then((data) => {
            return data;
        });
}