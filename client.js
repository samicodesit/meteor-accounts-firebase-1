import firebase from "firebase/app";
import "firebase/auth";

Meteor.startup(() => {
  // For debugging purposes
  if (process.env.NODE_ENV === 'development') {
    window.firebase = firebase;
  }

  const config = Meteor.settings.public.firebase;
  // Stopping if firebase config not provided
  if (!config) {
    console.warn('Firebase config missing. Check firebase object under Meteor public settings');
  }
  firebase.initializeApp(config);

  Accounts.registerClientLoginFunction('firebase', (token) => {
    Accounts.callLoginMethod({
      methodArguments: [{ token }],
      userCallback: (error) => {
        if (error) console.error(error);
      }
    });
  });

  firebase.auth().onAuthStateChanged(((user) => {
    if (user && Meteor.loggingIn() === false) {
      user.getIdToken().then(((token) => {
        Accounts.callLoginFunction('firebase', token);
      }))
    } else {

      if (Meteor.loggingIn()) {
        Meteor.logout()
      }

      // const loginUrl = Meteor.settings.public.loginUrl;
      // const searchQuery = Object.entries({ redirect: window.location.href })
      //   .map(([key, val]) => val && `${key}=${val}`)
      //   .join('&');
      // const accountsLogin = `${loginUrl}/login?${searchQuery}`;
      // window.location.href = accountsLogin;
    }
  }));

  // In case you calling Meteor.logout() from the client side
  Accounts.onLogout(() => {
    if (firebase.auth().currentUser) {
      firebase.auth().signOut();
    }
  })
})

export { firebase };