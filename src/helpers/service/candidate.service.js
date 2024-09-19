import { authHeader, authHeaderFormData } from "../../helpers/fakebackend/auth-header";
import { generateApiUrl } from "../../helpers/common/APIConstants"

export const candidateService = {
    createCandidate,
    updateCandidateStatus,
    deleteCandidate,
    getCandidateDetail,
    updateCandidate,
    searchCandidateToRefer,
    referCandidate,
    selfRefer,
    updateCV,
    searchCandidateToMatching,
    jobMatching,
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

function createCandidate(data) {
    const json = JSON.stringify(data);
    const requestOptions = {
        method: "POST",
        headers: authHeader(),
        body: json,
    };

    const url = generateApiUrl("/candidates");

    return fetch(url, requestOptions)
        .then(handleResponse)
        .then((data) => {
            return data;
        });
}

function updateCandidateStatus(candidate_id, candidate_status) {
    const status = candidate_status == 0 ? "2" : "1";

    const json = JSON.stringify({ status });

    const requestOptions = {
        method: "PUT",
        headers: authHeader(),
        body: json,
    };

    const url = generateApiUrl("/candidates/updatestatusbycollaborator/" + candidate_id);

    return fetch(url, requestOptions)
        .then(handleResponse)
        .then((data) => {
            return data;
        });
}

function deleteCandidate(candidate_id) {
    const requestOptions = {
        method: "DELETE",
        headers: authHeader(),
    };

    const url = generateApiUrl("/candidates/" + candidate_id);

    return fetch(url, requestOptions)
        .then(handleResponse)
        .then((data) => {
            return data;
        });
}

function getCandidateDetail(candidate_id) {
    const requestOptions = {
        method: "GET",
        headers: authHeader(),
    };

    const url = generateApiUrl("/candidates/" + candidate_id);

    return fetch(url, requestOptions)
        .then(handleResponse)
        .then((data) => {
            return data;
        });
}

function updateCandidate(candidate_id, data) {
    const json = JSON.stringify(data);
    const requestOptions = {
        method: "PUT",
        headers: authHeader(),
        body: json,
    };

    const url = generateApiUrl("/candidates/" + candidate_id);

    return fetch(url, requestOptions)
        .then(handleResponse)
        .then((data) => {
            return data;
        });
}

function searchCandidateToRefer(
    post_id,
    salary_from,
    salary_to,
    date_from,
    date_to,
    city_ids,
    keyword_cv_require,
    keyword_cv_optional,
    page_index,
    page_size,
    sort_by,
    currency
) {
    const requestOptions = {
        method: "GET",
        headers: authHeader(),
    };

    var url = generateApiUrl("/candidates?postId=" + post_id +
        "&date_from=" + date_from +
        "&city_ids=" + city_ids +
        "&page_index=" + page_index +
        "&page_size=" + page_size +
        "&sort_by=" + sort_by +
        "&currency=" + currency);

    if (salary_from !== "") {
        url = url + "&salary_from=" + salary_from;
    }

    if (salary_to !== "") {
        url = url + "&salary_to=" + salary_to;
    }

    if (date_to !== 0) {
        url = url + "&date_to=" + date_to;
    }

    if (keyword_cv_require !== "") {
        url = url + "&keyword_cv_require=" + keyword_cv_require;
    }

    if (keyword_cv_optional !== "") {
        url = url + "&keyword_cv_optional=" + keyword_cv_optional;
    }

    return fetch(url, requestOptions)
        .then(handleResponse)
        .then((data) => {
            return data;
        });
}

function searchCandidateToMatching(
    keyword_cv,
    salary_from,
    salary_to,
    date_from,
    date_to,
    city_ids,
    page_index,
    page_size,
    currency,
    negotiable) {

    const requestOptions = {
        method: "GET",
        headers: authHeader(),
    };

    var url = generateApiUrl("/candidates/matchingjob/searchcandidatetomatch?" + 
        "keyword_cv=" + keyword_cv +
        "&city_ids=" + city_ids +
        "&currency=" + currency +
        "&page_index=" + page_index +
        "&negotiable=" + negotiable +
        "&page_size=" + page_size);

    if (salary_from !== null && salary_from !== "") {
        url = url + "&salary_from=" + salary_from;
    }

    if (salary_to !== null && salary_to !== "") {
        url = url + "&salary_to=" + salary_to;
    }

    if (date_from !== 0) {
        url = url + "&date_from=" + date_from;
    }

    if (date_to !== 0) {
        url = url + "&date_to=" + date_to;
    }

    return fetch(url, requestOptions)
        .then(handleResponse)
        .then((data) => {
            return data;
        });
}

function referCandidate(data) {
    const json = JSON.stringify(data);
    const requestOptions = {
        method: "POST",
        headers: authHeader(),
        body: json,
    };

    const url = generateApiUrl("/candidates/refer");

    return fetch(url, requestOptions)
        .then(handleResponse)
        .then((data) => {
            return data;
        });
}

function selfRefer(data) {
    const json = JSON.stringify(data);
    var myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");
    const requestOptions = {
        method: "POST",
        headers: myHeaders,
        body: json,
    };

    const url = generateApiUrl("/candidates/referbycandidate");

    return fetch(url, requestOptions)
        .then(handleResponse)
        .then((data) => {
            return data;
        });
}

function updateCV(cvfile, introduction_id) {
    var formdata = new FormData();
    formdata.append("cvfile", cvfile, cvfile.name);

    var requestOptions = {
        method: "POST",
        headers: authHeaderFormData(),
        body: formdata,
        redirect: "follow",
    };

    const url = generateApiUrl("/candidates/updatecv/" + introduction_id);

    return fetch(url, requestOptions)
        .then(handleResponse)
        .then((data) => {
            return data;
        });
}

function jobMatching(data) {
    const json = JSON.stringify(data);
    const requestOptions = {
        method: "POST",
        headers: authHeader(),
        body: json,
    };

    const url = generateApiUrl("/posts/matching");

    return fetch(url, requestOptions)
        .then(handleResponse)
        .then((data) => {
            return data;
        });
}