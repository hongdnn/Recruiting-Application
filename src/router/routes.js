import store from "@/state/store";

export default [{
        path: "/login",
        name: "login",
        component: () =>
            import ("../views/pages/account/login"),
        meta: {
            beforeResolve(routeTo, routeFrom, next) {
                // If the user is already logged in
                if (store.getters["auth/loggedIn"]) {
                    // Redirect to the home page instead
                    next({
                        name: "home",
                    });
                } else {
                    // Continue to the login page
                    next();
                }
            },
        },
    },
    {
        path: "/register",
        name: "register",
        component: () =>
            import ("../views/pages/account/register"),
        meta: {
            beforeResolve(routeTo, routeFrom, next) {
                // If the user is already logged in
                if (store.getters["auth/loggedIn"]) {
                    // Redirect to the home page instead
                    next({
                        name: "home",
                    });
                } else {
                    // Continue to the login page
                    next();
                }
            },
        },
    },
    {
        path: "/forgot-password",
        name: "Forgot-password",
        component: () =>
            import ("../views/pages/account/forgot-password"),
        meta: {
            beforeResolve(routeTo, routeFrom, next) {
                // If the user is already logged in
                if (store.getters["auth/loggedIn"]) {
                    // Redirect to the home page instead
                    next({
                        name: "home",
                    });
                } else {
                    // Continue to the login page
                    next();
                }
            },
        },
    },
    {
        path: "/verify-account",
        name: "verify-account",
        component: () =>
            import ("../views/pages/account/verify-account"),
        meta: {
            beforeResolve(routeTo, routeFrom, next) {
                // If the user is already logged in
                if (store.getters["auth/loggedIn"]) {
                    // Redirect to the home page instead
                    next({
                        name: "home",
                    });
                } else {
                    // Continue to the login page
                    next();
                }
            },
        },
    },
    {
        path: "/reset-password",
        name: "reset-password",
        component: () =>
            import ("../views/pages/account/reset-password"),
        meta: {
            beforeResolve(routeTo, routeFrom, next) {
                // If the user is already logged in
                if (store.getters["auth/loggedIn"]) {
                    // Redirect to the home page instead
                    next({
                        name: "home",
                    });
                } else {
                    // Continue to the login page
                    next();
                }
            },
        },
    },
    {
        path: "/contacts/profile",
        name: "Profile",
        meta: {
            authRequired: true,
        },
        component: () =>
            import ("../views/pages/contacts/profile"),
    },

    {
        path: "/contacts/profile-employer",
        name: "profile-employer",
        meta: {
            authRequired: true,
        },
        component: () =>
            import ("../views/pages/contacts/profile-employer"),
    },

    {
        path: "/manage-post",
        name: "manage-post",
        component: () =>
            import ("../views/pages/post/manage-post"),
        meta: {
            beforeResolve(routeTo, routeFrom, next) {
                // If the user is already logged in
                if (store.getters["auth/loggedIn"]) {
                    // Redirect to the home page instead
                    next({
                        name: "home",
                    });
                } else {
                    // Continue to the login page
                    next();
                }
            },
        },
    },
    {
        path: "/manage-post-for-collaborator",
        name: "manage-post-for-collaborator",
        component: () =>
            import ("../views/pages/post/manage-post-for-collaborator"),
        meta: {
            beforeResolve(routeTo, routeFrom, next) {
                // If the user is already logged in
                if (store.getters["auth/loggedIn"]) {
                    // Redirect to the home page instead
                    next({
                        name: "home",
                    });
                } else {
                    // Continue to the login page
                    next();
                }
            },
        },
    },
    {
        path: "/manage-save-post-for-collaborator",
        name: "manage-save-post-for-collaborator",
        component: () =>
            import ("../views/pages/post/manage-save-post-for-collaborator"),
        meta: {
            beforeResolve(routeTo, routeFrom, next) {
                // If the user is already logged in
                if (store.getters["auth/loggedIn"]) {
                    // Redirect to the home page instead
                    next({
                        name: "home",
                    });
                } else {
                    // Continue to the login page
                    next();
                }
            },
        },
    },
    {
        path: "/create-post",
        name: "create-post",
        component: () =>
            import ("../views/pages/post/create-post"),
        meta: {
            beforeResolve(routeTo, routeFrom, next) {
                // If the user is already logged in
                if (store.getters["auth/loggedIn"]) {
                    // Redirect to the home page instead
                    next({
                        name: "home",
                    });
                } else {
                    // Continue to the login page
                    next();
                }
            },
        },
    },
    {
        path: "/update-post",
        name: "update-post",
        component: () =>
            import ("../views/pages/post/update-post"),
        meta: {
            beforeResolve(routeTo, routeFrom, next) {
                // If the user is already logged in
                if (store.getters["auth/loggedIn"]) {
                    // Redirect to the home page instead
                    next({
                        name: "home",
                    });
                } else {
                    // Continue to the login page
                    next();
                }
            },
        },
    },
    {
        path: "/post-detail",
        name: "post-detail",
        component: () =>
            import ("../views/pages/post/post-detail"),
        meta: {
            beforeResolve(routeTo, routeFrom, next) {
                // If the user is already logged in
                if (store.getters["auth/loggedIn"]) {
                    // Redirect to the home page instead
                    next({
                        name: "home",
                    });
                } else {
                    // Continue to the login page
                    next();
                }
            },
        },
    },
    {
        path: "/post-detail-for-collaborator",
        name: "post-detail-for-collaborator",
        component: () =>
            import ("../views/pages/post/post-detail-for-collaborator"),
        meta: {
            beforeResolve(routeTo, routeFrom, next) {
                // If the user is already logged in
                if (store.getters["auth/loggedIn"]) {
                    // Redirect to the home page instead
                    next({
                        name: "home",
                    });
                } else {
                    // Continue to the login page
                    next();
                }
            },
        },
    },
    {
        path: "/manage-interview",
        name: "manage-interview",
        component: () =>
            import ("../views/pages/interview/manage-interview"),
        meta: {
            beforeResolve(routeTo, routeFrom, next) {
                // If the user is already logged in
                if (store.getters["auth/loggedIn"]) {
                    // Redirect to the home page instead
                    next({
                        name: "home",
                    });
                } else {
                    // Continue to the login page
                    next();
                }
            },
        },
    },
    {
        path: "/manage-interview-collaborator",
        name: "manage-interview-collaborator",
        component: () =>
            import ("../views/pages/interview/manage-interview-collaborator"),
        meta: {
            beforeResolve(routeTo, routeFrom, next) {
                // If the user is already logged in
                if (store.getters["auth/loggedIn"]) {
                    // Redirect to the home page instead
                    next({
                        name: "home",
                    });
                } else {
                    // Continue to the login page
                    next();
                }
            },
        },
    },
    {
        path: "/interview-detail",
        name: "interview-detail",
        component: () =>
            import ("../views/pages/interview/interview-detail"),
        meta: {
            beforeResolve(routeTo, routeFrom, next) {
                // If the user is already logged in
                if (store.getters["auth/loggedIn"]) {
                    // Redirect to the home page instead
                    next({
                        name: "home",
                    });
                } else {
                    // Continue to the login page
                    next();
                }
            },
        },
    },
    {
        path: "/interview-detail-for-collaborator",
        name: "interview-detail-for-collaborator",
        component: () =>
            import ("../views/pages/interview/interview-detail-for-collaborator"),
        meta: {
            beforeResolve(routeTo, routeFrom, next) {
                // If the user is already logged in
                if (store.getters["auth/loggedIn"]) {
                    // Redirect to the home page instead
                    next({
                        name: "home",
                    });
                } else {
                    // Continue to the login page
                    next();
                }
            },
        },
    },
    {
        path: "/manage-company",
        name: "manage-company",
        component: () =>
            import ("../views/pages/company/manage-company"),
        meta: {
            beforeResolve(routeTo, routeFrom, next) {
                // If the user is already logged in
                if (store.getters["auth/loggedIn"]) {
                    // Redirect to the home page instead
                    next({
                        name: "home",
                    });
                } else {
                    // Continue to the login page
                    next();
                }
            },
        },
    },
    {
        path: "/manage-placement",
        name: "manage-placement",
        component: () =>
            import ("../views/pages/placement/manage-placement"),
        meta: {
            beforeResolve(routeTo, routeFrom, next) {
                // If the user is already logged in
                if (store.getters["auth/loggedIn"]) {
                    // Redirect to the home page instead
                    next({
                        name: "home",
                    });
                } else {
                    // Continue to the login page
                    next();
                }
            },
        },
    },
    {
        path: "/manage-placement-for-collaborator",
        name: "manage-placement-for-collaborator",
        component: () =>
            import ("../views/pages/placement/manage-placement-for-collaborator"),
        meta: {
            beforeResolve(routeTo, routeFrom, next) {
                // If the user is already logged in
                if (store.getters["auth/loggedIn"]) {
                    // Redirect to the home page instead
                    next({
                        name: "home",
                    });
                } else {
                    // Continue to the login page
                    next();
                }
            },
        },
    },
    {
        path: "/manage-job-matching-for-collaborator",
        name: "manage-job-matching-for-collaborator",
        component: () =>
            import (
                "../views/pages/job-matching/manage-job-matching-for-collaborator"
            ),
        meta: {
            beforeResolve(routeTo, routeFrom, next) {
                // If the user is already logged in
                if (store.getters["auth/loggedIn"]) {
                    // Redirect to the home page instead
                    next({
                        name: "home",
                    });
                } else {
                    // Continue to the login page
                    next();
                }
            },
        },
    },
    {
        path: "/company-detail",
        name: "company-detail",
        component: () =>
            import ("../views/pages/company/company-detail"),
        meta: {
            beforeResolve(routeTo, routeFrom, next) {
                // If the user is already logged in
                if (store.getters["auth/loggedIn"]) {
                    // Redirect to the home page instead
                    next({
                        name: "home",
                    });
                } else {
                    // Continue to the login page
                    next();
                }
            },
        },
    },
    {
        path: "/manage-collaborators",
        name: "manage-collaborators",
        component: () =>
            import ("../views/pages/collaborators/manage-collaborators"),
        meta: {
            beforeResolve(routeTo, routeFrom, next) {
                // If the user is already logged in
                if (store.getters["auth/loggedIn"]) {
                    // Redirect to the home page instead
                    next({
                        name: "home",
                    });
                } else {
                    // Continue to the login page
                    next();
                }
            },
        },
    },
    {
        path: "/collaborator-detail",
        name: "collaborator-detail",
        component: () =>
            import ("../views/pages/collaborators/collaborator-detail"),
        meta: {
            beforeResolve(routeTo, routeFrom, next) {
                // If the user is already logged in
                if (store.getters["auth/loggedIn"]) {
                    // Redirect to the home page instead
                    next({
                        name: "home",
                    });
                } else {
                    // Continue to the login page
                    next();
                }
            },
        },
    },
    {
        path: "/create-company",
        name: "create-company",
        component: () =>
            import ("../views/pages/company/create-company"),
        meta: {
            beforeResolve(routeTo, routeFrom, next) {
                // If the user is already logged in
                if (store.getters["auth/loggedIn"]) {
                    // Redirect to the home page instead
                    next({
                        name: "home",
                    });
                } else {
                    // Continue to the login page
                    next();
                }
            },
        },
    },
    {
        path: "/self-refer",
        name: "self-refer",
        component: () =>
            import ("../views/pages/candidate/self-refer"),
        meta: {
            beforeResolve(routeTo, routeFrom, next) {
                // If the user is already logged in
                if (store.getters["auth/loggedIn"]) {
                    // Redirect to the home page instead
                    next({
                        name: "home",
                    });
                } else {
                    // Continue to the login page
                    next();
                }
            },
        },
    },
    {
        path: "/manage-candidate",
        name: "manage-candidate",
        component: () =>
            import ("../views/pages/candidate/manage-candidate"),
        meta: {
            beforeResolve(routeTo, routeFrom, next) {
                // If the user is already logged in
                if (store.getters["auth/loggedIn"]) {
                    // Redirect to the home page instead
                    next({
                        name: "home",
                    });
                } else {
                    // Continue to the login page
                    next();
                }
            },
        },
    },
    {
        path: "/manage-candidate-for-collaborator",
        name: "manage-candidate",
        component: () =>
            import ("../views/pages/candidate/manage-candidate-for-collaborator"),
        meta: {
            beforeResolve(routeTo, routeFrom, next) {
                // If the user is already logged in
                if (store.getters["auth/loggedIn"]) {
                    // Redirect to the home page instead
                    next({
                        name: "home",
                    });
                } else {
                    // Continue to the login page
                    next();
                }
            },
        },
    },
    {
        path: "/create-candidate",
        name: "create-candidate",
        component: () =>
            import ("../views/pages/candidate/create-candidate"),
        meta: {
            beforeResolve(routeTo, routeFrom, next) {
                // If the user is already logged in
                if (store.getters["auth/loggedIn"]) {
                    // Redirect to the home page instead
                    next({
                        name: "home",
                    });
                } else {
                    // Continue to the login page
                    next();
                }
            },
        },
    },
    {
        path: "/manage-refer-candidate-collaborator",
        name: "manage-refer-candidate-collaborator",
        component: () =>
            import ("../views/pages/refer/manage-refer-candidate-collaborator"),
        meta: {
            beforeResolve(routeTo, routeFrom, next) {
                // If the user is already logged in
                if (store.getters["auth/loggedIn"]) {
                    // Redirect to the home page instead
                    next({
                        name: "home",
                    });
                } else {
                    // Continue to the login page
                    next();
                }
            },
        },
    },
    {
        path: "/manage-refer-candidate",
        name: "manage-refer-candidate",
        component: () =>
            import ("../views/pages/refer/manage-refer-candidate"),
        meta: {
            beforeResolve(routeTo, routeFrom, next) {
                // If the user is already logged in
                if (store.getters["auth/loggedIn"]) {
                    // Redirect to the home page instead
                    next({
                        name: "home",
                    });
                } else {
                    // Continue to the login page
                    next();
                }
            },
        },
    },
    {
        path: "/refer-candidate-detail-collaborator",
        name: "refer-candidate-detail-collaborator",
        component: () =>
            import ("../views/pages/refer/refer-candidate-detail-collaborator"),
        meta: {
            beforeResolve(routeTo, routeFrom, next) {
                // If the user is already logged in
                if (store.getters["auth/loggedIn"]) {
                    // Redirect to the home page instead
                    next({
                        name: "home",
                    });
                } else {
                    // Continue to the login page
                    next();
                }
            },
        },
    },
    {
        path: "/refer-candidate-detail",
        name: "refer-candidate-detail",
        component: () =>
            import ("../views/pages/refer/refer-candidate-detail"),
        meta: {
            beforeResolve(routeTo, routeFrom, next) {
                // If the user is already logged in
                if (store.getters["auth/loggedIn"]) {
                    // Redirect to the home page instead
                    next({
                        name: "home",
                    });
                } else {
                    // Continue to the login page
                    next();
                }
            },
        },
    },
    {
        path: "/create-refer-candidate-collaborator",
        name: "create-refer-candidate-collaborator",
        component: () =>
            import ("../views/pages/refer/create-refer-candidate-collaborator"),
        meta: {
            beforeResolve(routeTo, routeFrom, next) {
                // If the user is already logged in
                if (store.getters["auth/loggedIn"]) {
                    // Redirect to the home page instead
                    next({
                        name: "home",
                    });
                } else {
                    // Continue to the login page
                    next();
                }
            },
        },
    },
    {
        path: "/update-candidate",
        name: "update-candidate",
        component: () =>
            import ("../views/pages/candidate/update-candidate"),
        meta: {
            beforeResolve(routeTo, routeFrom, next) {
                // If the user is already logged in
                if (store.getters["auth/loggedIn"]) {
                    // Redirect to the home page instead
                    next({
                        name: "home",
                    });
                } else {
                    // Continue to the login page
                    next();
                }
            },
        },
    },
    {
        path: "/manage-staff",
        name: "manage-staff",
        component: () =>
            import ("../views/pages/staff/manage-staff"),
        meta: {
            beforeResolve(routeTo, routeFrom, next) {
                // If the user is already logged in
                if (store.getters["auth/loggedIn"]) {
                    // Redirect to the home page instead
                    next({
                        name: "home",
                    });
                } else {
                    // Continue to the login page
                    next();
                }
            },
        },
    },
    {
        path: "/staff-detail",
        name: "staff-detail",
        component: () =>
            import ("../views/pages/staff/staff-detail"),
        meta: {
            beforeResolve(routeTo, routeFrom, next) {
                // If the user is already logged in
                if (store.getters["auth/loggedIn"]) {
                    // Redirect to the home page instead
                    next({
                        name: "home",
                    });
                } else {
                    // Continue to the login page
                    next();
                }
            },
        },
    },
    {
        path: "/statistics-for-employer",
        name: "statistics-for-employer",
        component: () =>
            import ("../views/pages/statistics/statistics-for-employer"),
        meta: {
            beforeResolve(routeTo, routeFrom, next) {
                // If the user is already logged in
                if (store.getters["auth/loggedIn"]) {
                    // Redirect to the home page instead
                    next({
                        name: "home",
                    });
                } else {
                    // Continue to the login page
                    next();
                }
            },
        },
    },
    {
        path: "/statistics-for-collaborator",
        name: "statistics-for-collaborator",
        component: () =>
            import ("../views/pages/statistics/statistics-for-collaborator"),
        meta: {
            beforeResolve(routeTo, routeFrom, next) {
                // If the user is already logged in
                if (store.getters["auth/loggedIn"]) {
                    // Redirect to the home page instead
                    next({
                        name: "home",
                    });
                } else {
                    // Continue to the login page
                    next();
                }
            },
        },
    },
    {
        path: "/notification",
        name: "manage-notification",
        component: () =>
            import ("../views/pages/notification/manage-notification"),
        meta: {
            beforeResolve(routeTo, routeFrom, next) {
                // If the user is already logged in
                if (store.getters["auth/loggedIn"]) {
                    // Redirect to the home page instead
                    next({
                        name: "home",
                    });
                } else {
                    // Continue to the login page
                    next();
                }
            },
        },
    },
    {
        path: "/logout",
        name: "logout",
        meta: {
            authRequired: true,
            beforeResolve(routeTo, routeFrom, next) {
                if (process.env.VUE_APP_DEFAULT_AUTH === "firebase") {
                    store.dispatch("auth/logOut");
                } else if (process.env.VUE_APP_DEFAULT_AUTH === "fakebackend") {
                    store.dispatch("authfack/logout");
                }
                const authRequiredOnPreviousRoute = routeFrom.matched.some((route) =>
                    route.push("/login")
                );
                // Navigate back to previous page, or home as a fallback
                next(
                    authRequiredOnPreviousRoute ?
                    {
                        name: "home",
                    } :
                    {
                        ...routeFrom,
                    }
                );
            },
        },
    },
    {
        path: "/",
        name: "home",
        meta: {
            authRequired: true,
        },
        component: () =>
            import ("../views/pages/post/manage-post"),
    },
    {
        path: "/",
        name: "home",
        meta: {
            authRequired: true,
        },
        component: () =>
            import ("../views/pages/post/manage-post-for-collaborator"),
    },

    {
        path: "/utility/404",
        name: "error-404",
        meta: {
            authRequired: true,
        },
        component: () =>
            import ("../views/pages/utility/404"),
    },

    {
        path: "/charts/apex",
        name: "apex",
        meta: {
            authRequired: true,
        },
        component: () =>
            import ("../views/pages/charts/apex/index"),
    },
    {
        path: "/charts/chartist",
        name: "chartist",
        meta: {
            authRequired: true,
        },
        component: () =>
            import ("../views/pages/charts/chartist/index"),
    },
    {
        path: "/charts/chartjs",
        name: "chartjs",
        meta: {
            authRequired: true,
        },
        component: () =>
            import ("../views/pages/charts/chartjs/index"),
    },
    {
        path: "/charts/echart",
        name: "echart",
        meta: {
            authRequired: true,
        },
        component: () =>
            import ("../views/pages/charts/echart/index"),
    },

    {
        path: "/auth/login-1",
        name: "login-1",
        meta: {
            authRequired: true,
        },
        component: () =>
            import ("../views/pages/auth/login-1"),
    },
    {
        path: "/auth/register-1",
        name: "register-1",
        meta: {
            authRequired: true,
        },
        component: () =>
            import ("../views/pages/auth/register-1"),
    },
    {
        path: "/auth/lock-screen",
        name: "lock-screen",
        meta: {
            authRequired: true,
        },
        component: () =>
            import ("../views/pages/auth/lock-screen"),
    },
    {
        path: "/auth/:id",
        name: "recoverpwd",
        meta: {
            authRequired: true,
        },
        component: () =>
            import ("../views/pages/auth/recoverpwd"),
    },
];