export function authHeader() {
    // return authorization header with jwt token
    let user = JSON.parse(localStorage.getItem("user"));
    if (user && user.token) {
        return {
            "Content-type": "application/json; charset=UTF-8",
            Authorization: "Bearer " + user.token,
        };
    } else {
        return {};
    }
}

export function authHeaderFormData() {
    // return authorization header with jwt token
    let user = JSON.parse(localStorage.getItem("user"));
    if (user && user.token) {
        return {
            //"Content-type": "multipart/form-data",
            Authorization: "Bearer " + user.token,
        };
    } else {
        return {};
    }
}

export function tatoolAuthHeader() {
    // return authorization header with tatool Token
    return {
        "Content-type": "application/json; charset=UTF-8",
        Authorization: "Bearer " +
            "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJodHRwczpcL1wvYXBpLmpvYnRlc3Qudm5cL2F1dGhcL2xvZ2luIiwiaWF0IjoxNjIyODY5MDg4LCJleHAiOjE2MjY0NjkwODgsIm5iZiI6MTYyMjg2OTA4OCwianRpIjoiOUFIOTBOT21aWUNYTGRyZiIsInN1YiI6IjVhNWYwMjA5ZjNhZWQ0MDdjMjRjNTA0MiIsInBydiI6IjIzYmQ1Yzg5NDlmNjAwYWRiMzllNzAxYzQwMDg3MmRiN2E1OTc2ZjciLCJyb2xlIjoiZW1wbG95ZXIifQ.z8ZLWzyBahlYBtutiir6nzZNVwvU_gduA8EYDYVDy4Q",
    };
}