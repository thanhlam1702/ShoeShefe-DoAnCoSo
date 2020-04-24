//variable check user login facebook, google, account register, or not sign in
var statusLogin = -1;

//scripts sign in with facebook
function statusChangeCallback(response) {  // Called with the results from FB.getLoginStatus().
    if (response.status === 'connected') {   // Logged into your webpage and Facebook.
        statusLogin = 1;
        showUpSignInComplete();
    } 
}

window.fbAsyncInit = function() {
    FB.init({
        appId: '257459131957730',
        cookie: true, // Enable cookies to allow the server to access the session.
        xfbml: true, // Parse social plugins on this webpage.
        version: 'v6.0' // Use this Graph API version for this call.
    });

    FB.getLoginStatus(function(response) { // Called after the JS SDK has been initialized.
        statusChangeCallback(response); // Returns the login status.
    });
};

(function(d, s, id) { // Load the SDK asynchronously
    var js, fjs = d.getElementsByTagName(s)[0];
    if (d.getElementById(id)) return;
    js = d.createElement(s);
    js.id = id;
    js.src = "https://connect.facebook.net/en_US/sdk.js";
    fjs.parentNode.insertBefore(js, fjs);
}(document, 'script', 'facebook-jssdk'));

function checkLoginState() { // Called when a person is finished with the Login Button.
    FB.getLoginStatus(function(response) { // See the onlogin handler
        statusChangeCallback(response);
    });
}

//Initializes the Sign-In client.
const  initClient =  function() {
    gapi.load('auth2',async function() {
        //Retrieve the singleton for the GoogleAuth library and set up the
        //client.
        auth2 = await  gapi.auth2.init({
            client_id: '276514203511-rkdmf52kmh1ljdg29sjfj30fn1phubb3.apps.googleusercontent.com',
            cookiepolicy: 'single_host_origin',
            // Request scopes in addition to 'profile' and 'email'
            scope: 'profile email'
        });
        //wait google init load complete, after check status user login, if not login 
        //then isSingedIn return 'false', user login return true,
        //if 'true' load information  of user
        if(auth2.isSignedIn.get() === true){
            onSuccess();
        }

        // Attach the click handler to the sign-in button
        const btnSignInGG = document.getElementsByClassName('customGPlusSignIn');
        for(let i = 0; i < btnSignInGG.length; ++i){
            auth2.attachClickHandler(btnSignInGG[i], {}, onSuccess, onFailure);
        }
    });
};
//login complete
const onSuccess = function() {
    statusLogin = 0;
    showUpSignInComplete();
 };

// Handle sign-in failures.
const onFailure = function(error) {
    console.log(error);
};

initClient();

//show layout after user login complete
const showUpSignInComplete = () => {
    document.getElementById('navbar-right-user').style.display = 'flex';
    document.getElementById('left-menu').style.display = 'flex';

    document.getElementById('navbar-right').style.display = 'none';
    document.getElementById('sign-in-modal').style.display = 'none';
    document.getElementById('sign-up-modal').style.display = 'none';

    showUser();
    
}
//show information user about avatar, name...
const showUser = function() {
    const userName = document.getElementsByClassName('user-name');
    const userAvatar = document.getElementsByClassName('user-img');
    if (statusLogin === 1) {
        FB.api('/me?fields=name,picture.type(large),email', function(user_data) {
            for(let i = 0; i < userName.length; ++i){
                userName[i].innerHTML = user_data.name;
                userAvatar[i].src = user_data.picture.data.url;
            }
        })
        console.log('login fb');
    } else if (statusLogin === 0) {
        var auth2 = gapi.auth2.getAuthInstance();
        for(let i = 0; i < userName.length; ++i){
            userName[i].innerHTML = auth2.currentUser.get().getBasicProfile().getName();
            userAvatar[i].src = auth2.currentUser.get().getBasicProfile().getImageUrl();
        }
    } else {
        console.log('no login');
    }
};

//logout facebook and google
function logout() {
    if (statusLogin === 1) {
        FB.logout(function(response) {
        })
        logoutComplete();
    } else if (statusLogin === 0) {
        var auth2 = gapi.auth2.getAuthInstance();
        auth2.signOut().then(function() {
        });
        logoutComplete();
    }
}

const logoutComplete = () =>{
    document.getElementById('navbar-right-user').style.display = 'none';
    document.getElementById('left-menu').style.display = 'none';

    document.getElementById('navbar-right').style.display = 'flex';
    console.log('Log out Complete');
    window.location = "https://shoesshelf.com/";
    statusLogin = -1;
}