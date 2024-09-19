import { authHeader } from "../../helpers/fakebackend/auth-header";
import { generateApiUrl } from "../../helpers/common/APIConstants"

export const notificationService = {
    getNotification,
    getNewNotification,
    updateReadNotification,
    getAllNotification,
    deleteNotification,
};

function handleResponse(response) {
    return response.text().then((text) => {
        const data = text && JSON.parse(text);
        if (!response.ok) {
            if (response.status === 401) {
                // auto logout if 401 response returned from api
                //logout();
                location.reload();
            }
            const error = (data && data.message) || response.statusText;
            return Promise.reject(error);
        }
        return data;
    });
}


function getNotification(notify_index, page_size) {
    const requestOptions = {
        method: "GET",
        headers: authHeader(),
    };

    const url = generateApiUrl(`/notifications?page_index=${notify_index}&page_size=${page_size}`);

    return fetch(url, requestOptions)
        .then(handleResponse)
        .then((data) => {
            return data;
        });
}

function getNewNotification() {
    const requestOptions = {
        method: "GET",
        headers: authHeader(),
    };

    const url = generateApiUrl(`/notifications/newnotification`);

    return fetch(url, requestOptions)
        .then(handleResponse)
        .then((data) => {
            return data;
        });
}

function updateReadNotification(notification_id) {
    const requestOptions = {
        method: "PUT",
        headers: authHeader(),
    };

    const url = generateApiUrl(`/notifications/${notification_id}`);

    return fetch(url, requestOptions)
        .then(handleResponse)
        .then((data) => {
            return data;
        });
}

function getAllNotification(type, date_from, date_to, page_index, page_size) {
    const requestOptions = {
        method: "GET",
        headers: authHeader(),
    };

    var url = generateApiUrl(`/notifications/searchnotification?type=${type}&page_index=${page_index}&page_size=${page_size}`);
    
    if (date_from != null) {
        url = url + `&date_from=${date_from}`;
    }

    if (date_to != null) {
        url = url + `&date_to=${date_to}`;
    }

    return fetch(url, requestOptions)
        .then(handleResponse)
        .then((data) => {
            return data;
        });
}

function deleteNotification(notification_id) {
    const requestOptions = {
        method: "DELETE",
        headers: authHeader(),
    };

    const url = generateApiUrl(`/notifications/${notification_id}`);

    return fetch(url, requestOptions)
        .then(handleResponse)
        .then((data) => {
            return data;
        }); 
}