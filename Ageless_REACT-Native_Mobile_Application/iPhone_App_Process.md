# iPhone App Migration & App Store Submission Process

This document outlines the complete roadmap for converting the current Next.js web application into a native iOS application using React Native and Expo, culminating in the Apple App Store submission.

## Phase 1: Technical Migration

### 1. UI & Styling Migration
**Estimated Time to Completion:** 3-5 Days

*   **The Task:** Create a parallel `mobile-app` directory. Port existing React components to React Native. Replace HTML elements (`div`, `span`, `h1`) with Native components (`View`, `Text`).
*   **Styling:** Migrate Tailwind CSS classes to `NativeWind` to ensure 100% visual fidelity while using native rendering.
*   **Goal:** Ensure the app looks and feels exactly like the web version but performs with native smoothness (60fps).

### 2. Navigation & Routing
**Estimated Time to Completion:** 1-2 Days

*   **Context:** Next.js uses file-system routing. React Native does not have a URL bar.
*   **The Task:** Implement **Expo Router**.
*   **Why:** Expo Router works almost exactly like the Next.js App Router. We can replicate your folder structure (`app/(dashboard)/...`) to keep the navigation logic identical.

### 3. Local Storage & Offline Logic
**Estimated Time to Completion:** 2 Days

*   **Context:** Your `useOfflineQueue` hook currently uses the browser's `localStorage`. Mobile apps don't have `localStorage`.
*   **The Task:** Refactor `useOfflineQueue` to use **AsyncStorage** or **Expo SQLite**.
*   **Preserving Logic:** The logic (queueing, syncing, retrying) remains exactly the same. Only the specific line of code that saves to disk changes.

### 4. Authentication & Security
**Estimated Time to Completion:** 2-3 Days

*   **Context:** Cookies (which NextAuth uses by default) are tricky in mobile apps.
*   **The Task:**
    *   **Server:** Keep the existing NextAuth setup but ensure it can issue **JWTs (JSON Web Tokens)** to the mobile app.
    *   **Mobile:** Store the user's session token in **Expo SecureStore** (encrypted storage on the device) instead of a browser cookie.
    *   **Face ID:** Replace the "simulated" Face ID animation with **Real Face ID** integration using the `expo-local-authentication` library.

---

## Phase 2: App Store Compliance & Submission

### 5. App Store Compliance & Submission Process
**Estimated Time to Completion:** 3-7 Days (including review time)

Apple has strict guidelines. Below is the detailed process for getting your app onto the App Store.

#### 1. Preparation (Before Submission)
*   **Apple Developer Account:** You must enroll in the Apple Developer Program ($99/year). This is mandatory.
*   **App Store Connect:** This is the portal where you manage your app. You will need to create a new App entry here.
*   **Assets Required:**
    *   **App Icon:** 1024x1024px.
    *   **Screenshots:** You need specific sizes for different iPhones (6.5" display, 5.5" display, etc.). We can generate these from the simulator.
    *   **Privacy Policy URL:** A link to a webpage explaining how you handle user data (since you store health data, this is critical).
    *   **Support URL:** A link where users can contact you.

#### 2. The Build & Upload
*   **Archive:** We create a "Production Build" of your React Native app (`.ipa` file).
*   **Upload:** We use a tool called Transporter (or Xcode) to upload this build to App Store Connect.
*   **TestFlight (Optional but Recommended):** Before submitting for review, you can release the app on "TestFlight". This allows you and your team to download the real app on your real iPhones to test it exactly as a user would.

#### 3. The Review Submission
Once you are happy with the TestFlight build, you click "Submit for Review". You will need to provide:
*   **Demo Account:** A username/password for the Apple Reviewer to log in and test the app.
*   **Notes:** Instructions on how to test specific features (e.g., "Go to Dashboard to see the offline sync").

#### 4. The Review Process (The "Black Box")
*   **Timing:** Reviews typically take 24 to 48 hours.
*   **What they check:**
    *   **Crashes:** Does it open?
    *   **Broken Links:** Do the "Privacy Policy" and "Support" links work?
    *   **Content:** Is there offensive content?
    *   **Completeness:** No "Lorem Ipsum" text or placeholder images.
    *   **Data Privacy:** Since you collect health data, they will check if you ask for permission correctly.
    *   **"App-ness":** This is the tricky one. Apple rejects apps that just look like a website wrapped in an app. This is why our UI & Styling Migration phase is so important—it ensures the app feels "native."

#### 5. Outcome
*   ✅ **Approved:** You get an email saying "Ready for Sale". You can then release it immediately or schedule a date.
*   ❌ **Rejected:** You get a message explaining exactly why (e.g., "Guideline 2.1 - Performance").
    *   **Don't Panic:** Rejections are normal. We fix the specific issue they pointed out and resubmit. It usually takes 1-2 days to get re-reviewed.

---

## Work Completed Checklist

### Phase 1: Technical Migration
- [x] **Environment Setup**: Initialize Expo project in `mobile-app` folder.
- [x] **UI Migration**: Port Dashboard components to React Native.
- [x] **UI Migration**: Port History/Modal components to React Native.
- [x] **Styling**: Configure NativeWind and migrate Tailwind classes.
- [x] **Navigation**: Implement Expo Router structure.
- [x] **Storage**: Refactor `useOfflineQueue` to use AsyncStorage.
- [x] **Auth**: Configure NextAuth for JWT support.
- [x] **Auth**: Implement SecureStore for token management.
- [x] **Auth**: Implement Biometric Auth (Face ID).

### Phase 2: Submission
- [ ] **Assets**: Generate App Icons and Splash Screens.
- [ ] **Assets**: Generate App Store Screenshots.
- [ ] **Config**: Update `app.json` with bundle identifiers and version numbers.
- [ ] **Build**: Create production build (`.ipa`).
- [ ] **TestFlight**: Upload to TestFlight and verify on device.
- [ ] **Submission**: Submit to App Store Review.
