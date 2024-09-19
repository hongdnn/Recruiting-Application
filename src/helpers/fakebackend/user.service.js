import { authHeader, authHeaderFormData } from "./auth-header";

import { generateApiUrl } from "../../helpers/common/APIConstants";
import Vue from "vue";

export const userService = {
    login,
    loginSocialAccount,
    logout,
    register,
    confirmAccount,
    forgotPassword,
    resetPassword,
    changePassword,
    getAll,
    getProfileByEmployer,
    getProfileByCollaborator,
    updateProfileByCollaborator,
    updateBankAccountByCollaborator,
    updateProfileByEmployer,
    createPost,
    getJobRoles,
    getJobRolesByFunction,
    searchPostByEmployer,
    searchPostByCollaborator,
    searchInterviewByEmployer,
    getPostDetailByEmployer,
    getCompanies,
    getCities,
    getAllComment,
    sendComment,
    replyComment,
    likeComment,
    searchCandidateByCollaborator,
    getPost,
    getLanguages,
    updatePost,
    getIndustries, // get luon ca function vs job
    getAllIndustry, // get only industry
    getSkills,
    getJobs,
    getFunctions,
    getFunctionsByIndustry,
    getJobsByFunction,
    savePost,
    unsavePost,
    searchSavePostForCollaborator,
    uploadCV,
    updateFCMToken,
    getQuestionPackages,
    searchCompanyByEmployer,
    getCompanyDetailByEmployer,
    createCompanyByEmployer,
    searchStaffByEmployer,
    getPermissionsByEmployer,
    createStaffByEmployer,
    getStaffDetailByEmloyer,
    updateStaff,
    uploadImg,
    uploadBankImages,
    uploadImgCompany,
    updateCompany,
    getIndustriesForCollaborator
};

function login(email, password) {
    const requestOptions = {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
    };

    return fetch(generateApiUrl("/users/login"), requestOptions)
        .then(handleResponse)
        .then((user) => {
            // login successful if there's a jwt token in the response
            if (user.token) {
                // store user details and jwt token in local storage to keep user logged in between page refreshes
                localStorage.setItem("user", JSON.stringify(user));
            }
            return user;
        });
}

function loginSocialAccount(email, first_name, last_name, method) {
    const requestOptions = {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ first_name, last_name, email, method }),
    };

    return fetch(generateApiUrl("/users/loginsocialaccount"), requestOptions)
        .then(handleResponse)
        .then((user) => {
            // login successful if there's a jwt token in the response
            if (user.token) {
                // store user details and jwt token in local storage to keep user logged in between page refreshes
                localStorage.setItem("user", JSON.stringify(user));
            }
            return user;
        });
}

async function logout() {
    // remove user from local storage to log user out
    localStorage.removeItem("user");
    if (!window.location.href.includes("localhost")) {
        window.FB.getLoginStatus(function (response) {
            if (response.status === "connected") {
                window.FB.logout(function () { });
            }
        });
    }
    if (Vue.prototype.$gAuth.isAuthorized) {
        try {
            await Vue.prototype.$gAuth.signOut();
        } catch (error) {
            console.log(error);
        }
    }
}

function register(user) {
    const json = JSON.stringify(user);
    const requestOptions = {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: json,
    };
    return fetch(generateApiUrl("/users"), requestOptions).then(handleResponse);
}

function confirmAccount(verifyCode, email) {
    return fetch(
        generateApiUrl("/users/confirm-user/" + email + "/" + verifyCode)
    )
        .then(handleResponse)
        .then((user) => {
            // login successful if there's a jwt token in the response
            if (user.token) {
                // store user details and jwt token in local storage to keep user logged in between page refreshes
                localStorage.setItem("user", JSON.stringify(user));
            }
            return user;
        });
}

function forgotPassword(email) {
    const json = JSON.stringify(email);
    const requestOptions = {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: json,
    };
    return fetch(generateApiUrl("/users/forgot-password"), requestOptions).then(
        handleResponse
    );
}

function resetPassword(email, password, verification_code) {
    const json = JSON.stringify({ email, password, verification_code });
    const requestOptions = {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: json,
    };
    return fetch(generateApiUrl("/users/reset-password"), requestOptions).then(
        handleResponse
    );
}

function changePassword(data) {
    const json = JSON.stringify(data);

    const requestOptions = {
        method: "PUT",
        headers: authHeader(),
        body: json,
    };

    const url = generateApiUrl("/users/accounts/changepassword");

    return fetch(url, requestOptions)
        .then(handleResponse)
        .then((data) => {
            return data;
        });
}

function getAll() {
    const requestOptions = {
        method: "GET",
        headers: authHeader(),
    };
    return fetch(generateApiUrl("/users"), requestOptions).then(handleResponse);
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
            return error;
        }
        return data;
    });
}

function getProfileByCollaborator(id) {
    const requestOptions = {
        method: "GET",
        headers: authHeader(),
    };
    return fetch(generateApiUrl(`/users/collaborator/${id}`), requestOptions)
        .then(handleResponse)
        .then((user) => {
            // login successful if there's a jwt token in the response
            return user;
        });
}

function getProfileByEmployer(id) {
    const requestOptions = {
        method: "GET",
        headers: authHeader(),
    };
    return fetch(generateApiUrl(`/users/employer/${id}`), requestOptions)
        .then(handleResponse)
        .then((user) => {
            // login successful if there's a jwt token in the response
            return user;
        });
}

function updateProfileByCollaborator(id, data) {
    const requestOptions = {
        method: "PUT",
        headers: authHeader(),
        body: JSON.stringify(data),
    };
    return fetch(
        generateApiUrl(`/users/collaborator/${id}`),
        requestOptions,
        data
    )
        .then(handleResponse)
        .then((data) => {
            return data;
        });
}

function updateBankAccountByCollaborator(data) {
    const requestOptions = {
        method: "POST",
        headers: authHeader(),
        body: JSON.stringify(data),
    };
    return fetch(
        generateApiUrl(`/bankaccounts`),
        requestOptions,
        data
    )
        .then(handleResponse)
        .then((data) => {
            return data;
        });
}

function updateProfileByEmployer(id, data) {
    const requestOptions = {
        method: "PUT",
        headers: authHeader(),
        body: JSON.stringify(data),
    };
    return fetch(generateApiUrl(`/users/employer/${id}`), requestOptions, data)
        .then(handleResponse)
        .then((data) => {
            return data;
        });
}

function createPost(data) {
    const requestOptions = {
        method: "POST",
        headers: authHeader(),
        body: JSON.stringify(data),
    };
    return fetch(generateApiUrl("/posts"), requestOptions, data).then(
        handleResponse
    );
}

function getJobRoles() {
    const requestOptions = {
        method: "GET",
        headers: authHeader(),
    };
    return fetch(generateApiUrl("/jobrole"), requestOptions).then(handleResponse);
}

function getJobRolesByFunction(functionId) {
    const requestOptions = {
        method: "GET",
        headers: authHeader(),
    };
    return fetch(generateApiUrl("/jobrole/getjobrolesbyfunction/" + functionId), requestOptions).then(handleResponse);
}

function searchPostByEmployer(
    status,
    search_value,
    keyword_type,
    page_index,
    page_size,
    sort_by
) {
    const requestOptions = {
        method: "GET",
        headers: authHeader(),
    };
    var url = generateApiUrl(
        "/posts/searchbyemployer?status=" +
        status +
        "&keyword=" +
        search_value +
        "&keyword_type=" +
        keyword_type +
        "&page_index=" +
        page_index +
        "&page_size=" +
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

function searchPostByCollaborator(
    keyword_type,
    keyword,
    companyId,
    cityId,
    negotiable,
    type_work,
    urgency,
    status,
    page_index,
    page_size,
    guarantee,
    sortBy,
    currency,
    salaryFrom,
    salaryTo
) {
    const requestOptions = {
        method: "GET",
        headers: authHeader(),
    };

    var url = generateApiUrl(
        "/posts?keyword_type=" +
        keyword_type +
        "&keyword=" +
        keyword +
        "&companyIds=" +
        companyId +
        "&cityIds=" +
        cityId +
        "&negotiable=" +
        negotiable +
        "&type_work=" +
        type_work +
        "&urgency=" +
        urgency +
        "&status=" +
        status +
        "&page_index=" +
        page_index +
        "&page_size=" +
        page_size +
        "&guarantee=" +
        guarantee +
        "&sortBy=" +
        sortBy +
        "&currency=" +
        currency
    );

    if (salaryFrom !== "") {
        url = url + "&salaryFrom=" + salaryFrom;
    }

    if (salaryTo !== "") {
        url = url + "&salaryTo=" + salaryTo;
    }

    return fetch(url, requestOptions)
        .then(handleResponse)
        .then((data) => {
            return data;
        });
}

function getPostDetailByEmployer(post_id) {
    const requestOptions = {
        method: "GET",
        headers: { "Content-Type": "application/json" },
    };
    const url = generateApiUrl("/posts/detail/" + post_id);

    return fetch(url, requestOptions)
        .then(handleResponse)
        .then((data) => {
            return data;
        });
}

function getCompanies() {
    const requestOptions = {
        method: "GET",
        headers: { "Content-Type": "application/json" },
    };
    const url = generateApiUrl("/companies");

    return fetch(url, requestOptions)
        .then(handleResponse)
        .then((data) => {
            return data;
        });
}

function getCompanyDetailByEmployer(company_id) {
    const requestOptions = {
        method: "GET",
        headers: authHeader(),
    };
    const url = generateApiUrl("/companies/" + company_id);

    return fetch(url, requestOptions)
        .then(handleResponse)
        .then((data) => {
            return data;
        });
}

function getCities() {
    const requestOptions = {
        method: "GET",
        headers: authHeader(),
    };
    const url = generateApiUrl("/cities");

    return fetch(url, requestOptions)
        .then(handleResponse)
        .then((data) => {
            return data;
        });
}

function searchInterviewByEmployer(
    keyword,
    company_id,
    status,
    page_index,
    page_size,
    sort_by
) {
    const requestOptions = {
        method: "GET",
        headers: authHeader(),
    };
    var url = generateApiUrl(
        "/interviewschedules?keyword=" +
        keyword +
        "&page_index=" +
        page_index +
        "&page_size=" +
        page_size +
        "&sort_by=" +
        sort_by +
        "&company_id=" +
        company_id +
        "&status=" +
        status
    );

    return fetch(url, requestOptions)
        .then(handleResponse)
        .then((data) => {
            return data;
        });
}

function getAllComment(post_id) {
    const requestOptions = {
        method: "GET",
        headers: { "Content-Type": "application/json" },
    };

    let url = generateApiUrl("/comments?postId=" + post_id);

    return fetch(url, requestOptions)
        .then(handleResponse)
        .then((data) => {
            return data;
        });
}

function sendComment(post_id, content) {
    const json = JSON.stringify({ post_id, content });

    const requestOptions = {
        method: "POST",
        headers: authHeader(),
        body: json,
    };

    return fetch(generateApiUrl("/comments"), requestOptions).then(
        handleResponse
    );
}

function replyComment(parent_comment_id, content) {
    const json = JSON.stringify({ parent_comment_id, content });

    const requestOptions = {
        method: "POST",
        headers: authHeader(),
        body: json,
    };

    return fetch(generateApiUrl("/comments/reply-comment"), requestOptions).then(
        handleResponse
    );
}

function likeComment(commentId) {
    const json = JSON.stringify({ commentId });

    const requestOptions = {
        method: "POST",
        headers: authHeader(),
        body: json,
    };

    return fetch(generateApiUrl("/comments/like-comment"), requestOptions).then(
        handleResponse
    );
}

function searchCandidateByCollaborator(
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

    var url = generateApiUrl(
        "/candidates?date_from=" +
        date_from +
        "&city_ids=" +
        city_ids +
        "&page_index=" +
        page_index +
        "&page_size=" +
        page_size +
        "&sort_by=" +
        sort_by +
        "&currency=" +
        currency
    );

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

function getPost(id) {
    const requestOptions = {
        method: "GET",
        headers: authHeader(),
    };
    return fetch(
        generateApiUrl(`/posts/detailforupdate/${id}`),
        requestOptions
    ).then(handleResponse);
}

function getLanguages() {
    const requestOptions = {
        method: "GET",
        headers: authHeader(),
    };
    return fetch(generateApiUrl("/languages"), requestOptions).then(
        handleResponse
    );
}

function updatePost(id, data) {
    const requestOptions = {
        method: "PUT",
        headers: authHeader(),
        body: JSON.stringify(data),
    };
    return fetch(generateApiUrl(`/posts/${id}`), requestOptions, data)
        .then(handleResponse)
        .then((data) => {
            return data;
        });
}

function savePost(post_id) {
    const json = JSON.stringify({ post_id });

    const requestOptions = {
        method: "POST",
        headers: authHeader(),
        body: json,
    };

    const url = generateApiUrl("/savedposts");

    return fetch(url, requestOptions)
        .then(handleResponse)
        .then((data) => {
            return data;
        });
}

function unsavePost(post_id) {
    const requestOptions = {
        method: "DELETE",
        headers: authHeader(),
    };

    const url = generateApiUrl("/savedposts/") + post_id;

    return fetch(url, requestOptions)
        .then(handleResponse)
        .then((data) => {
            return data;
        });
}

function getIndustries() {
    const requestOptions = {
        method: "GET",
        headers: authHeader(),
    };
    return fetch(
        generateApiUrl("/industries/industriesforpost"),
        requestOptions
    ).then(handleResponse);
}

function getAllIndustry() {
    const requestOptions = {
        method: "GET",
        headers: authHeader(),
    };
    return fetch(
        generateApiUrl("/industries"),
        requestOptions
    ).then(handleResponse);
}
// get function by industry
function getFunctionsByIndustry(industryId) {
    const requestOptions = {
        method: "GET",
        headers: authHeader(),
    };
    return fetch(generateApiUrl("/functions/getfunctionsbyindustry/" + industryId), requestOptions).then(
        handleResponse
    );
}

function getIndustriesForCollaborator() {
    const requestOptions = {
        method: "GET",
        headers: authHeader(),
    };
    return fetch(
        generateApiUrl("/industries"),
        requestOptions
    ).then(handleResponse);
}

function getFunctions() {
    const requestOptions = {
        method: "GET",
        headers: authHeader(),
    };
    return fetch(generateApiUrl("/functions"), requestOptions).then(
        handleResponse
    );
}

function getSkills() {
    const requestOptions = {
        method: "GET",
        headers: authHeader(),
    };
    return fetch(generateApiUrl("/skills"), requestOptions).then(handleResponse);
}

function getJobs() {
    const requestOptions = {
        method: "GET",
        headers: authHeader(),
    };

    return fetch(generateApiUrl("/jobs"), requestOptions).then(handleResponse);
}

function getJobsByFunction(functionId) {
    const requestOptions = {
        method: "GET",
        headers: authHeader(),
    };

    return fetch(generateApiUrl("/jobs/getjobsbyfunction/" + functionId), requestOptions).then(handleResponse);
}

function searchSavePostForCollaborator(
    keyword_type,
    keyword,
    companyId,
    cityId,
    negotiable,
    type_work,
    urgency,
    status,
    page_index,
    page_size,
    guarantee,
    sortBy,
    currency,
    salaryFrom,
    salaryTo
) {
    const requestOptions = {
        method: "GET",
        headers: authHeader(),
    };

    var url = generateApiUrl(
        "/savedposts?keyword_type=" +
        keyword_type +
        "&keyword=" +
        keyword +
        "&companyIds=" +
        companyId +
        "&cityIds=" +
        cityId +
        "&negotiable=" +
        negotiable +
        "&type_work=" +
        type_work +
        "&urgency=" +
        urgency +
        "&status=" +
        status +
        "&page_index=" +
        page_index +
        "&page_size=" +
        page_size +
        "&guarantee=" +
        guarantee +
        "&sortBy=" +
        sortBy +
        "&currency=" +
        currency
    );

    if (salaryFrom !== "") {
        url = url + "&salaryFrom=" + salaryFrom;
    }

    if (salaryTo !== "") {
        url = url + "&salaryTo=" + salaryTo;
    }

    return fetch(url, requestOptions)
        .then(handleResponse)
        .then((data) => {
            return data;
        });
}

function uploadCV(cvfile) {
    var formdata = new FormData();
    formdata.append("cvfile", cvfile, cvfile.name);

    var requestOptions = {
        method: "POST",
        body: formdata,
        redirect: "follow",
    };

    const url = generateApiUrl("/candidates/uploadcv");

    return fetch(url, requestOptions)
        .then(handleResponse)
        .then((data) => {
            return data;
        });
}

function updateFCMToken(token) {
    const requestOptions = {
        method: "PUT",
        headers: authHeader(),
        body: JSON.stringify(token),
    };
    return fetch(
        generateApiUrl("/users/accounts/fcmtoken"),
        requestOptions,
        token
    ).then(handleResponse);
}

function getQuestionPackages() {
    const requestOptions = {
        method: "GET",
        headers: authHeader(),
    };
    return fetch(generateApiUrl(`/posts/questionpackages`), requestOptions)
        .then(handleResponse)
        .then((data) => {
            return data;
        });
}

function searchCompanyByEmployer(
    keyword,
    industryId,
    page_index,
    page_size,
    sort_by
) {
    const requestOptions = {
        method: "GET",
        headers: authHeader(),
    };

    var url = generateApiUrl(
        "/companies/search?keyword=" +
        keyword +
        "&industryId=" +
        industryId +
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

function createCompanyByEmployer(data) {
    const requestOptions = {
        method: "POST",
        headers: authHeader(),
        body: JSON.stringify(data),
    };

    return fetch(generateApiUrl("/companies"), requestOptions)
        .then(handleResponse)
        .then((data) => {
            return data;
        });
}

function updateCompany(_id, data) {
    const requestOptions = {
        method: "PUT",
        headers: authHeader(),
        body: JSON.stringify(data),
    };
    return fetch(generateApiUrl(`/companies/` + _id), requestOptions, data)
        .then(handleResponse)
        .then((data) => {
            return data;
        });
}

function searchStaffByEmployer(
    keyword,
    page_index,
    page_size,
    sort_by,
    status
) {
    const requestOptions = {
        method: "GET",
        headers: authHeader(),
    };

    var url = generateApiUrl(
        "/users/employer?keyword=" +
        keyword +
        "&page_index=" +
        page_index +
        "&page_size=" +
        page_size +
        "&sortBy=" +
        sort_by +
        "&status=" +
        status
    );

    return fetch(url, requestOptions)
        .then(handleResponse)
        .then((data) => {
            return data;
        });
}

function getPermissionsByEmployer() {
    const requestOptions = {
        method: "GET",
        headers: authHeader(),
    };
    return fetch(generateApiUrl("/permissions"), requestOptions).then(
        handleResponse
    );
}

function createStaffByEmployer(data) {
    const requestOptions = {
        method: "POST",
        headers: authHeader(),
        body: JSON.stringify(data),
    };

    return fetch(generateApiUrl("/users/employer"), requestOptions)
        .then(handleResponse)
        .then((data) => {
            return data;
        });
}

function getStaffDetailByEmloyer(staff_id) {
    const requestOptions = {
        method: "GET",
        headers: authHeader(),
    };
    return fetch(generateApiUrl("/users/employer/" + staff_id), requestOptions)
        .then(handleResponse)
        .then((data) => {
            return data;
        });
}

function updateStaff(staff_id, data) {
    const requestOptions = {
        method: "PUT",
        headers: authHeader(),
        body: JSON.stringify(data),
    };
    return fetch(
        generateApiUrl(`/users/employer/` + staff_id),
        requestOptions,
        data
    )
        .then(handleResponse)
        .then((data) => {
            return data;
        });
}

function uploadImg(image) {
    var formdata = new FormData();
    formdata.append("image", image, image.name);
    var requestOptions = {
        method: "POST",
        headers: authHeaderFormData(),
        body: formdata,
        redirect: "follow",
    };

    const url = generateApiUrl("/users/accounts/uploadimage");

    return fetch(url, requestOptions)
        .then(handleResponse)
        .then((data) => {
            return data;
        });
}

function uploadBankImages(front_side_image, back_side_image) {
    var formdata = new FormData();
    if (front_side_image !== null) {
        formdata.append("front_side_image", front_side_image, front_side_image.name);
    }
    if (back_side_image !== null) {
        formdata.append("back_side_image", back_side_image, back_side_image.name);
    }
    var requestOptions = {
        method: "POST",
        headers: authHeaderFormData(),
        body: formdata,
        redirect: "follow",
    };

    const url = generateApiUrl("/bankaccounts/uploadimage");

    return fetch(url, requestOptions)
        .then(handleResponse)
        .then((data) => {
            return data;
        });
}

function uploadImgCompany(imageCompany) {
    var formdata = new FormData();

    formdata.append("imageCompany", imageCompany, imageCompany.name);
    var requestOptions = {
        method: "POST",
        headers: authHeaderFormData(),
        body: formdata,
        redirect: "follow",
    };
    const url = generateApiUrl("/companies/uploadcompanyimage");

    return fetch(url, requestOptions)
        .then(handleResponse)
        .then((data) => {
            return data;
        });
}