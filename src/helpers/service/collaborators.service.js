import { authHeader } from "../../helpers/fakebackend/auth-header";
import { generateApiUrl } from "../../helpers/common/APIConstants";

export const collaboratorService = {
    searchCollab,
    getCollaboratorDetailByEmployer,
    searchCandidateIntroductionForCollaborator,
    updateCollaboratorStatus,
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

function searchCollab(keyword, status, page_index, page_size, sort_by) {
    const requestOptions = {
        method: "GET",
        headers: authHeader(),
    };

    const url = generateApiUrl(
        "/users/collaborators?" +
        "keyword=" +
        keyword +
        "&status=" +
        status +
        "&pageIndex=" +
        page_index +
        "&pageSize=" +
        page_size +
        "&sortBy=" +
        sort_by
    );

    return fetch(url, requestOptions)
        .then(handleResponse)
        .then((data) => {
            return data;
        });
}

function getCollaboratorDetailByEmployer(id) {
    const requestOptions = {
        method: "GET",
        headers: authHeader(),
    };

    var url = generateApiUrl(`/users/getcollaboratorforemployer/${id}`);

    return fetch(url, requestOptions)
        .then(handleResponse)
        .then((data) => {
            return data;
        });
}

function searchCandidateIntroductionForCollaborator(
    keyword,
    collaborator_id,
    company_ids,
    status,
    page_index,
    page_size,
    sort_by,
) {

    const requestOptions = {
        method: "GET",
        headers: authHeader(),
    };

    var url =
        generateApiUrl("/candidateintroductions/searchintroductionofcollaborator?keyword=" +
            keyword +
            "&collaborator_id=" +
            collaborator_id +
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

    // if (introduction_date_from !== 0) {
    //     url = url + "&introduction_date_from=" + introduction_date_from
    // }

    // if (introduction_date_to !== 0) {
    //     url = url + "&introduction_date_to=" + introduction_date_to
    // }

    return fetch(url, requestOptions)
        .then(handleResponse)
        .then((data) => {
            return data;
        });
}

function updateCollaboratorStatus(data) {
    const json = JSON.stringify(data);

    const requestOptions = {
        method: "POST",
        headers: authHeader(),
        body: json,
    };

    var url = generateApiUrl("/users/updatestatuscollaborator");

    return fetch(url, requestOptions)
        .then(handleResponse)
        .then((data) => {
            return data;
        });
}