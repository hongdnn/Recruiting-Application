import Vue from "vue";
import VueRouter from "vue-router";

import VueMeta from "vue-meta";
import store from "@/state/store";

import routes from "./routes";
import { userService } from "../helpers/fakebackend/user.service";

Vue.use(VueRouter);
const originalPush = VueRouter.prototype.push;
VueRouter.prototype.push = function push(location) {
    return originalPush.call(this, location).catch((err) => {
        if (err.toString().includes("Avoided redundant")) {
            window.location.reload();
        }
    });
};
Vue.use(VueMeta, {
    // The component option name that vue-meta looks for meta info on.
    keyName: "page",
});

const router = new VueRouter({
    routes,
    // Use the HTML5 history API (i.e. normal-looking routes)
    // instead of routes with hashes (e.g. example.com/#/about).
    // This may require some server configuration in production:
    // https://router.vuejs.org/en/essentials/history-mode.html#example-server-configurations
    mode: "history",
    scrollBehavior(to, from, savedPosition) {
        if (savedPosition) {
            return savedPosition;
        } else {
            return {
                x: 0,
                y: 0,
            };
        }
    },
});

// Before each route evaluates...
router.beforeEach((routeTo, routeFrom, next) => {
    if (process.env.VUE_APP_DEFAULT_AUTH === "firebase") {
        // Check if auth is required on this route
        // (including nested routes).
        const authRequired = routeTo.matched.some(
            (route) => route.meta.authRequired
        );

        // If auth isn't required for the route, just continue.
        if (!authRequired) return next();

        // If auth is required and the user is logged in...
        if (store.getters["auth/loggedIn"]) {
            // Validate the local user token...
            return store.dispatch("auth/validate").then((validUser) => {
                // Then continue if the token still represents a valid user,
                // otherwise redirect to login.
                validUser ? next() : redirectToLogin();
            });
        }

        // If auth is required and the user is NOT currently logged in,
        // redirect to login.
        redirectToLogin();

        // eslint-disable-next-line no-unused-vars
        // eslint-disable-next-line no-inner-declarations
        function redirectToLogin() {
            // Pass the original route to the login component
            next({
                name: "login",
                query: {
                    redirectFrom: routeTo.fullPath,
                },
            });
        }
    } else if (process.env.VUE_APP_DEFAULT_AUTH === "fakebackend") {
        const publicPages = [
            "/login",
            "/register",
            "/forgot-password",
            "/verify-account",
            "/reset-password",
            "/manage-post",
            "/manage-post-for-collaborator",
            "/post-detail",
            "/post-detail-for-collaborator",
            "/manage-interview",
            "/manage-candidate",
            "/manage-candidate-for-collaborator",
            "/manage-refer-candidate",
            "/refer-candidate-detail",
            "/manage-save-post-for-collaborator",
            "/manage-refer-candidate-collaborator",
            "/refer-candidate-detail-collaborator",
            "/update-candidate",
            "/manage-company",
            "/manage-staff",
            "/statistics-for-employer",
            "/statistics-for-collaborator",
            "/manage-job-matching-for-collaborator",
            "/self-refer",
            "/manage-collaborators",
            "/collaborator-detail",
        ];
        const authpage = !publicPages.includes(routeTo.path);
        const loggeduser = localStorage.getItem("user");
        const loggedusers = localStorage.getItem("user");
        let userStorage = JSON.parse(localStorage.getItem("user"));

        if (routeTo.path === "/go-manage-refer-candidate" && loggeduser) {
            if (userStorage.data.type_account === "collaborator") {
                return next("/manage-refer-candidate-collaborator");
            } else {
                return next("/manage-refer-candidate");
            }
        }

        if (routeTo.path === "/go-manage-interview" && loggeduser) {
            if (userStorage.data.type_account === "employer") {
                return next("/manage-interview");
            } else {
                return next("/manage-interview-collaborator");
            }
        }

        if (routeTo.path === "/go-manage-staff" && loggeduser) {
            if (userStorage.data.type_account === "employer") {
                return next("/manage-staff");
            } else {
                // return next("/manage-interview-collaborator");
            }
        }

        if (routeTo.path === "/go-manage-candidate" && loggeduser) {
            if (userStorage.data.type_account === "employer") {
                return next("/manage-candidate");
            } else {
                return next("/manage-candidate-for-collaborator");
            }
        }
        if (routeTo.path === "/go-manage-collaborators" && loggeduser) {
            if (userStorage.data.type_account === "employer") {
                return next("/manage-collaborators");
            } else {
                //     return next("/manage-candidate-for-collaborator");
            }
        }
        if (routeTo.path === "/go-manage-company" && loggeduser) {
            if (userStorage.data.type_account === "employer") {
                return next("/manage-company");
            } else {
                //     return next("/manage-candidate-for-collaborator");
            }
        }

        if (routeTo.path === "/go-manage-placement" && loggeduser) {
            if (userStorage.data.type_account === "employer") {
                return next("/manage-placement");
            } else {
                return next("/manage-placement-for-collaborator");
            }
        }

        if (routeTo.path === "/go-manage-job-matching" && loggeduser) {
            if (userStorage.data.type_account === "collaborator") {
                return next("/manage-job-matching-for-collaborator");
            } else {
                return;
            }
        }
        if (routeTo.path === "/go-manage-statistics" && loggeduser) {
            if (userStorage.data.type_account === "employer") {
                return next("/statistics-for-employer");
            } else {
                return next("/statistics-for-collaborator");
            }
        }
        if (routeTo.path === "/" && loggedusers) {
            const token = localStorage.getItem("fcmToken");
            userService.updateFCMToken({ fcm_token: token });
            if (userStorage.data.type_account === "employer") {
                return next("/manage-post");
            } else {
                return next("/manage-post-for-collaborator");
            }
        }
        // if (routeTo.path === "/self-refer") {
        //     return next("/self-refer");
        // }
        if (authpage && !loggeduser && !loggedusers) {
            return next("/login");
        }

        next();
    }
});

router.beforeResolve(async(routeTo, routeFrom, next) => {
    // Create a `beforeResolve` hook, which fires whenever
    // `beforeRouteEnter` and `beforeRouteUpdate` would. This
    // allows us to ensure data is fetched even when params change,
    // but the resolved route does not. We put it in `meta` to
    // indicate that it's a hook we created, rather than part of
    // Vue Router (yet?).
    try {
        // For each matched route...
        for (const route of routeTo.matched) {
            await new Promise((resolve, reject) => {
                // If a `beforeResolve` hook is defined, call it with
                // the same arguments as the `beforeEnter` hook.
                if (route.meta && route.meta.beforeResolve) {
                    route.meta.beforeResolve(routeTo, routeFrom, (...args) => {
                        // If the user chose to redirect...
                        if (args.length) {
                            // If redirecting to the same route we're coming from...
                            // Complete the redirect.
                            next(...args);
                            reject(new Error("Redirected"));
                        } else {
                            resolve();
                        }
                    });
                } else {
                    // Otherwise, continue resolving the route.
                    resolve();
                }
            });
        }
        // If a `beforeResolve` hook chose to redirect, just return.
    } catch (error) {
        return;
    }

    // If we reach this point, continue resolving the route.
    next();
});

export default router;