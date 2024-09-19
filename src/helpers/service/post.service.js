import { authHeader, authHeaderFormData } from "../../helpers/fakebackend/auth-header";
import { generateApiUrl } from "../../helpers/common/APIConstants"

export const postService = {
    getOptionalField,
    searchPostToMatching,
    exportJD,
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

function getOptionalField(post_id) {
    const requestOptions = {
        method: "GET",
        headers: authHeader(),
    };

    const url = generateApiUrl("/optionalfields/post/") + post_id;

    return fetch(url, requestOptions)
        .then(handleResponse)
        .then((data) => {
            return data;
        });
}

function searchPostToMatching(
    keyword_type,
    keyword,
    companyIds,
    cityIds,
    salaryFrom,
    salaryTo,
    type_work,
    status,
    page_index,
    page_size,
    sortBy,
    negotiable,
    urgency,
    guarantee,
    currency) {

    const requestOptions = {
        method: "GET",
        headers: authHeader(),
    };

    var url = generateApiUrl("/posts/searchposttomatch?") + 
    "keyword_type=" + keyword_type + 
    "&keyword=" + keyword + 
    "&companyIds=" + companyIds + 
    "&cityIds=" + cityIds + 
    "&type_work=" + type_work + 
    "&status=" + status + 
    "&page_index=" + page_index + 
    "&page_size=" + page_size + 
    "&sortBy=" + sortBy + 
    "&negotiable=" + negotiable + 
    "&urgency=" + urgency + 
    "&guarantee=" + guarantee + 
    "&currency=" + currency;

    if (salaryFrom !== null  && salaryFrom !== "") {
        url = url + "&salaryFrom=" + salaryFrom;
    }
    if (salaryTo !== null  && salaryTo !== "") {
        url = url + "&salaryTo=" + salaryTo;
    }

    return fetch(url, requestOptions)
        .then(handleResponse)
        .then((data) => {
            return data;
        });
}

function exportJD(data) {
    const json = JSON.stringify(data);

    const requestOptions = {
        method: "POST",
        headers: authHeader(),
        body: json,
    };

    var url = generateApiUrl("/posts/downloadJD");

    return fetch(url, requestOptions)
    .then((res) => {
        return res.arrayBuffer();
    })
    .catch(error => console.log('error', error));
}