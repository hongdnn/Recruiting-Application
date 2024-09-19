import {
    authHeader,
    authHeaderFormData,
} from "../../helpers/fakebackend/auth-header";
import { generateApiUrl } from "../../helpers/common/APIConstants";

export const placementService = {
    createPlacement,
    searchPlacementByEmployer,
    searchPlacementByCollaborator,
    getPlacementDetail,
    updatePlacementStatus,
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

function createPlacement(data) {
    const json = JSON.stringify(data);

    const requestOptions = {
        method: "POST",
        headers: authHeader(),
        body: json,
    };

    const url = generateApiUrl("/placements");

    return fetch(url, requestOptions)
        .then(handleResponse)
        .then((data) => {
            return data;
        });
}

function searchPlacementByEmployer(
    keyword,
    companyIds,
    paymentStatus,
    pageIndex,
    pageSize,
    sortBy
) {
    const requestOptions = {
        method: "GET",
        headers: authHeader(),
    };

    var url = generateApiUrl(
        "/placements/searchbyemployer?keyword=" +
        keyword +
        "&companyIds=" +
        companyIds +
        "&paymentStatus=" +
        paymentStatus +
        "&pageIndex=" +
        pageIndex +
        "&pageSize=" +
        pageSize +
        "&sortBy=" +
        sortBy
    );

    return fetch(url, requestOptions)
        .then(handleResponse)
        .then((data) => {
            return data;
        });
}

function searchPlacementByCollaborator(
    keyword,
    companyIds,
    paymentStatus,
    pageIndex,
    pageSize,
    sortBy
) {
    const requestOptions = {
        method: "GET",
        headers: authHeader(),
    };

    var url = generateApiUrl(
        "/placements/searchbycollaborator?keyword=" +
        keyword +
        "&companyIds=" +
        companyIds +
        "&paymentStatus=" +
        paymentStatus +
        "&pageIndex=" +
        pageIndex +
        "&pageSize=" +
        pageSize +
        "&sortBy=" +
        sortBy
    );

    return fetch(url, requestOptions)
        .then(handleResponse)
        .then((data) => {
            return data;
        });
}

function getPlacementDetail(placement_id) {
    const requestOptions = {
        method: "GET",
        headers: authHeader(),
    };

    var url = generateApiUrl("/placements/detail/" + placement_id);

    return fetch(url, requestOptions)
        .then(handleResponse)
        .then((data) => {
            return data;
        });
}

function updatePlacementStatus(data) {
    const json = JSON.stringify(data);

    const requestOptions = {
        method: "POST",
        headers: authHeader(),
        body: json,
    };

    var url = generateApiUrl("/placements/updatestatus");

    return fetch(url, requestOptions)
        .then(handleResponse)
        .then((data) => {
            return data;
        });
}