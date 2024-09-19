import { authHeader, authHeaderFormData } from "../../helpers/fakebackend/auth-header";
import { generateApiUrl } from "../../helpers/common/APIConstants"

export const introductionService = {
    searchCandidateIntroductionByEmployer,
    searchCandidateIntroductionByCollaborator,
    getCandidateIntroductionDetail,
    updateIntroductionStatus,
    getListCandidateToWarranty,
    createWarranty,
    getReviewPlacement,
    searchCandidateToWarranty,
    chooseCandidateToWarranty,
    inviteTest,
    getTestReport,
    getCandidateIntroductionInPost,
    downloadCV,
}

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

function searchCandidateIntroductionByEmployer(
    keyword,
    company_ids,
    status,
    page_index,
    page_size,
    sort_by,
    introduction_date_from,
    introduction_date_to,
) {
    const requestOptions = {
        method: "GET",
        headers: authHeader(),
    };

    var url =
        generateApiUrl("/candidateintroductions/searchbyemployer?keyword=" +
            keyword +
            "&company_ids=" +
            company_ids +
            "&status=" +
            status +
            "&page_index=" +
            page_index +
            "&page_size=" +
            page_size +
            "&sort_by=" +
            sort_by);

    if (introduction_date_from !== 0) {
        url = url + "&introduction_date_from=" + introduction_date_from
    }

    if (introduction_date_to !== 0) {
        url = url + "&introduction_date_to=" + introduction_date_to
    }

    return fetch(url, requestOptions)
        .then(handleResponse)
        .then((data) => {
            return data;
        });
}

function searchCandidateIntroductionByCollaborator(
    keyword,
    company_ids,
    status,
    page_index,
    page_size,
    sort_by,
    introduction_date_from,
    introduction_date_to,
) {
    const requestOptions = {
        method: "GET",
        headers: authHeader(),
    };

    var url =
        generateApiUrl("/candidateintroductions/searchbycollaborator?keyword=" +
            keyword +
            "&company_ids=" +
            company_ids +
            "&status=" +
            status +
            "&page_index=" +
            page_index +
            "&page_size=" +
            page_size +
            "&sort_by=" +
            sort_by);

    if (introduction_date_from !== 0) {
        url = url + "&introduction_date_from=" + introduction_date_from
    }

    if (introduction_date_to !== 0) {
        url = url + "&introduction_date_to=" + introduction_date_to
    }

    return fetch(url, requestOptions)
        .then(handleResponse)
        .then((data) => {
            return data;
        });
}

function getCandidateIntroductionDetail(introduction_id) {
    const requestOptions = {
        method: "GET",
        headers: authHeader(),
    };

    const url = generateApiUrl("/candidateintroductions/") + introduction_id;

    return fetch(url, requestOptions)
        .then(handleResponse)
        .then((data) => {
            return data;
        });
}

function updateIntroductionStatus(data) {
    const json = JSON.stringify(data);

    const requestOptions = {
        method: "POST",
        headers: authHeader(),
        body: json,
    };

    const url = generateApiUrl("/candidateintroductions/updatestatusintroduction");

    return fetch(url, requestOptions)
        .then(handleResponse)
        .then((data) => {
            return data;
        });
}

function getListCandidateToWarranty(post_id) {
    const requestOptions = {
        method: "GET",
        headers: authHeader(),
    };

    const url = generateApiUrl("/candidateintroductions/getwarrantylist/post/") + post_id;

    return fetch(url, requestOptions)
        .then(handleResponse)
        .then((data) => {
            return data;
        });
}

function createWarranty(data) {
    const json = JSON.stringify(data);

    const requestOptions = {
        method: "POST",
        headers: authHeader(),
        body: json,
    };

    const url = generateApiUrl("/warranties");

    return fetch(url, requestOptions)
        .then(handleResponse)
        .then((data) => {
            return data;
        });
}

function getReviewPlacement(introduction_id) {
    const requestOptions = {
        method: "GET",
        headers: authHeader(),
    };

    const url = generateApiUrl("/placements/placementpreview/candidateintroduction/") + introduction_id;

    return fetch(url, requestOptions)
        .then(handleResponse)
        .then((data) => {
            return data;
        });
}

function searchCandidateToWarranty(
    keyword,
    postId,
    page_index,
    page_size,
    sort_by
) {
    const requestOptions = {
        method: "GET",
        headers: authHeader(),
    };

    const url = generateApiUrl("/candidateintroductions/searchtowarranty?" +
        "keyword=" + keyword +
        "&postId=" + postId +
        "&page_index=" + page_index +
        "&page_size=" + page_size +
        "&sort_by=" + sort_by)

    return fetch(url, requestOptions)
        .then(handleResponse)
        .then((data) => {
            return data;
        });
}

function chooseCandidateToWarranty(
    data
) {
    const json = JSON.stringify(data);

    const requestOptions = {
        method: "POST",
        headers: authHeader(),
        body: json,
    };

    const url = generateApiUrl("/candidateintroductions/warrantycandidate");

    return fetch(url, requestOptions)
        .then(handleResponse)
        .then((data) => {
            return data;
        });
}

function inviteTest(data) {
    const json = JSON.stringify(data);

    const requestOptions = {
        method: "POST",
        headers: authHeader(),
        body: json,
    };

    const url = generateApiUrl("/candidateintroductions/invitetest");

    return fetch(url, requestOptions)
        .then(handleResponse)
        .then((data) => {
            return data;
        });
}

function getTestReport(data) {
    const json = JSON.stringify(data);

    const requestOptions = {
        method: "POST",
        headers: authHeader(),
        body: json,
    };

    const url = generateApiUrl("/candidateintroductions/reporttest");

    return fetch(url, requestOptions)
        .then(handleResponse)
        .then((data) => {
            return data;
        });
}

function getCandidateIntroductionInPost(status, page_index, page_size, sort_by, post_id) {
    const requestOptions = {
        method: "GET",
        headers: authHeader(),
    };

    const url = generateApiUrl("/candidateintroductions?status=") + status + 
    "&page_index=" + page_index + 
    "&page_size=" + page_size + 
    "&sort_by=" + sort_by + 
    "&post_id=" + post_id;

    return fetch(url, requestOptions)
        .then(handleResponse)
        .then((data) => {
            return data;
        });
}

function downloadCV(id) {
    const requestOptions = {
        method: "GET",
        headers: authHeader(),
    };

    var url = generateApiUrl("/candidates/downloadCV/" + id);

    return fetch(url, requestOptions)
    .then((res) => {
        return res.arrayBuffer();
    })
    .catch(error => console.log('error', error));
}