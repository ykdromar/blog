import firebaseApp from "./firebaseConfig";
import { ShowToast } from "../components";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  onAuthStateChanged,
  updateProfile,
  deleteUser,
  signOut,
  GoogleAuthProvider,
  sendEmailVerification,
  signInWithPopup,
  RecaptchaVerifier,
  signInWithPhoneNumber,
  linkWithPhoneNumber,
} from "firebase/auth";
import { getSingleDoc } from "./firebaseFirestore";

const auth = getAuth(firebaseApp);
auth.languageCode = "en";

const firebaseSignup = async (email, password) => {
  try {
    let userCredentials = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );
    let user = userCredentials.user;
    return user;
  } catch (error) {
    console.log("ERROR IN SIGNUP : " + error);
  }
};

const firebaseLogin = async (email, password) => {
  try {
    let userCredentials = await signInWithEmailAndPassword(
      auth,
      email,
      password
    );
    let user = userCredentials.user;
    return user;
  } catch (error) {
    console.log("ERROR IN LOGIN : " + error);
  }
};

const firebaseLogout = async () => {
  try {
    await signOut(auth);
  } catch (error) {
    console.log("Error in logging out ", error);
    ShowToast("Something went wrong, Please try again later !");
  }
};

const firebaseGetUser = async (updateUser, setLoading) => {
  try {
    const auth = getAuth();
    onAuthStateChanged(auth, async (user) => {
      if (user) {
        let details = await getSingleDoc("eventsUsers2023", user.uid);
        if (!details) {
          details = null;
        }
        updateUser({ user, details });
      }
      setLoading(false);
    });
  } catch (error) {
    console.log("ERROR IN Fetching user: " + error);
  }
};

const firebaseDeleteUser = async (user) => {
  deleteUser(user)
    .then(() => {})
    .catch((error) => {
      console.log("Error ", error);
    });
};

const updateUser = async () => {
  try {
    let user = await updateProfile(auth.currentUser, {
      displayName: "Yash",
    });
  } catch (error) {
    console.log("ERROR in Updating user: " + error);
  }
};

const firebaseGoogleSignIn = async () => {
  try {
    const provider = new GoogleAuthProvider();
    let response = await signInWithPopup(auth, provider);
    return response.user;
  } catch (error) {
    console.log("Error in Google sign in: ", error);
    ShowToast("Something went wrong, Please try again later !");
  }
};

const sendVerificationEmail = async () => {
  try {
    let result = await sendEmailVerification(auth.currentUser);
    console.log(result);
  } catch (error) {
    console.log("Error in sending email: ", error);
    ShowToast("Something went wrong, Please try again later !");
  }
};

const generateRecaptcha = (btnId) => {
  if (!window.recaptchaVerifier) {
    window.recaptchaVerifier = new RecaptchaVerifier(auth, btnId, {
      size: "invisible",
      callback: (response) => {},
    });
  }
};

const firebaseSendOTP = (btnId, phoneNumber) => {
  generateRecaptcha(btnId);
  const appVerifier = window.recaptchaVerifier;
  signInWithPhoneNumber(auth, phoneNumber, appVerifier)
    .then((confirmationResult) => {
      // SMS sent. Prompt user to type the code from the message, then sign the
      // user in with confirmationResult.confirm(code).
      window.confirmationResult = confirmationResult;
      // ...
    })
    .catch((error) => {
      // Error; SMS not sent
      console.log(error);
      ShowToast("Something went wrong, Please try again later !");
      // ...
    });
};

const firebaseVerifyOTP = async (otp) => {
  try {
    let confirmationResult = window.confirmationResult;
    let response = await confirmationResult.confirm(otp);
    let user = response.user;
    return user;
  } catch (error) {
    console.log(error);
    ShowToast("Something went wrong, Please try again later !");
  }
};

const firebaseLinkPhone = async (phone, btnId) => {
  try {
    generateRecaptcha(btnId);
    const appVerifier = window.recaptchaVerifier;
    let result = await linkWithPhoneNumber(
      auth.currentUser,
      phone,
      appVerifier
    ).then((confirmationResult) => {
      // SMS sent. Prompt user to type the code from the message, then sign the
      // user in with confirmationResult.confirm(code).
      window.confirmationResult = confirmationResult;
      // ...
    });
  } catch (error) {
    console.log(error);
    ShowToast("Something went wrong, Please try again later !");
  }
};

export {
  firebaseSignup,
  firebaseLogin,
  firebaseLogout,
  firebaseGetUser,
  firebaseDeleteUser,
  updateUser,
  firebaseGoogleSignIn,
  sendVerificationEmail,
  generateRecaptcha,
  firebaseSendOTP,
  firebaseVerifyOTP,
  firebaseLinkPhone,
};
