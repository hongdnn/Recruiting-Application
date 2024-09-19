import { authHeader } from "../../helpers/fakebackend/auth-header";
import { generateApiUrl } from "../../helpers/common/APIConstants";

export const statisticsService = {
    reportForStatistic,
    getStatistics,
    reportIntroductionByPost,
    getStatisticsByCollaborator,
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

function reportForStatistic(data) {
    const json = JSON.stringify(data);

    const requestOptions = {
        method: "POST",
        headers: authHeader(),
        body: json,
    };

    const url = generateApiUrl("/candidateintroductions/reportforstatistic");

    return fetch(url, requestOptions)
        .then(handleResponse)
        .then((data) => {
            return data;
        });
}

function getStatistics() {
    const requestOptions = {
        method: "GET",
        headers: authHeader(),
    };
    return fetch(generateApiUrl("/posts/statistic"), requestOptions).then(
        handleResponse
    );
}

function reportIntroductionByPost(data) {
    const json = JSON.stringify(data);

    const requestOptions = {
        method: "POST",
        headers: authHeader(),
        body: json,
    };
    const url = generateApiUrl("/candidateintroductions/reportforposts");
    return fetch(url, requestOptions)
        .then(handleResponse)
        .catch(function(error) {})
        .finally(function() {
            setTimeout(30 * 1000);
        });
}

function getStatisticsByCollaborator() {
    const requestOptions = {
        method: "GET",
        headers: authHeader(),
    };
    return fetch(
        generateApiUrl("/posts/statisticbycollaborator"),
        requestOptions
    ).then(handleResponse);
}