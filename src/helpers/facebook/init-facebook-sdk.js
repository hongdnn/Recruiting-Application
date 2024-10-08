export function initFacebookSdk() {
    return new Promise(() => {
        // wait for facebook sdk to initialize before starting the vue app
        window.fbAsyncInit = function() {
            window.FB.init({
                appId: '561696721746161',
                cookie: true,
                xfbml: true,
                version: 'v11.0'
            });

        };

        (function(d, s, id) {
            var js, fjs = d.getElementsByTagName(s)[0];
            if (d.getElementById(id)) { return; }
            js = d.createElement(s);
            js.id = id;
            js.src = "https://connect.facebook.net/en_US/sdk.js";
            fjs.parentNode.insertBefore(js, fjs);
        }(document, 'script', 'facebook-jssdk'));
    })
}