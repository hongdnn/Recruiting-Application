/* eslint-disable no-undef */
importScripts("https://www.gstatic.com/firebasejs/8.6.3/firebase-app.js");
importScripts("https://www.gstatic.com/firebasejs/8.6.3/firebase-messaging.js");

const firebaseConfig = {
    apiKey: "",
    authDomain: "",
    projectId: "ta-tatool",
    storageBucket: "",
    messagingSenderId: "",
    appId: "",
    measurementId: ""
};

firebase.initializeApp(firebaseConfig);

// eslint-disable-next-line no-unused-vars
const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
    const notificationTitle = payload.data.title;
    const notificationOptions = {
        body: payload.data.content,
    };
    return self.registration.showNotification(
        notificationTitle,
        notificationOptions
    );
});