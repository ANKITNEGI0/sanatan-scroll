/* ScrollVerse, live site.
   A direct port of the space's actual UI code: the React app in
   ~/workspace/ts-spaces/sanatan-scroll/client/src (App.tsx, Feed.tsx,
   StudySheet.tsx, AudioSheet.tsx, Paywall.tsx, screens.tsx, i18n.ts,
   theme.css, lib/google.ts), rebuilt in plain JavaScript because the
   space is a full app with a server part and cannot be published as a
   static page. Same tokens, same layout, same components, same strings.
   Verse text is real and bundled in data/corpus.json; the Sivananda
   commentary is data/gita-comm.json, copied from the space.
   Saves, likes, streak, plan progress and Pro live in localStorage on
   this device (the space keeps them server side on the reader's
   account). Study explanations are composed on device from the bundled
   meanings and word meanings, the space generates them once per verse
   with AI and caches them on its server.
   Google sign-in is the space's real GIS OAuth token flow with the
   app's pre-configured Client ID (lib/config.ts in the space): tapping
   Sign in opens Google's own account chooser, and signing in unlocks
   Pro and resumes each text on the verse after the last one read.
   Audio: Gita Chapter 1 in all three recorded voices, as in the space.
   No em dashes are used anywhere in this file, by Ankit's rule. */

"use strict";

/* ---------- Icons, copied from the space's icons.tsx (stroke 1.8) ---------- */
function icon(paths, filled) {
  return '<svg viewBox="0 0 24 24" fill="' + (filled ? "currentColor" : "none") +
    '" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
    paths + "</svg>";
}
var I = {
  heart: icon('<path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/>'),
  heartFilled: icon('<path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/>', true),
  bookmark: icon('<path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>'),
  bookmarkFilled: icon('<path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>', true),
  share: icon('<circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path d="m8.59 13.51 6.83 3.98M15.41 6.51l-6.82 3.98"/>'),
  book: icon('<path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>'),
  flame: icon('<path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/>'),
  lock: icon('<rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>'),
  search: icon('<circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>'),
  x: icon('<path d="M18 6 6 18M6 6l12 12"/>'),
  check: icon('<path d="M20 6 9 17l-5-5"/>'),
  chevron: icon('<path d="m9 18 6-6-6-6"/>'),
  sparkle: icon('<path d="M12 3l1.9 5.8a2 2 0 0 0 1.3 1.3L21 12l-5.8 1.9a2 2 0 0 0-1.3 1.3L12 21l-1.9-5.8a2 2 0 0 0-1.3-1.3L3 12l5.8-1.9a2 2 0 0 0 1.3-1.3L12 3Z"/>'),
  scroll: icon('<path d="M8 21h12a2 2 0 0 0 2-2v-2H10v2a2 2 0 1 1-4 0V5a2 2 0 1 0-4 0v3h4"/><path d="M19 17V5a2 2 0 0 0-2-2H4"/>'),
  compass: icon('<circle cx="12" cy="12" r="10"/><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"/>'),
  calendar: icon('<path d="M8 2v4M16 2v4"/><rect width="18" height="18" x="3" y="4" rx="2"/><path d="M3 10h18"/>'),
  user: icon('<path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>'),
  play: icon('<path d="M6 4.5v15l13-7.5-13-7.5Z"/>', true),
  pause: icon('<rect x="6" y="4" width="4" height="16" rx="1"/><rect x="14" y="4" width="4" height="16" rx="1"/>', true),
  headphones: icon('<path d="M3 14v-2a9 9 0 0 1 18 0v2"/><path d="M3 14h3a1 1 0 0 1 1 1v4a1 1 0 0 1-1 1H5a2 2 0 0 1-2-2v-4Z"/><path d="M21 14h-3a1 1 0 0 0-1 1v4a1 1 0 0 0 1 1h1a2 2 0 0 0 2-2v-4Z"/>'),
  skipBack: icon('<path d="M19 20 9 12l10-8v16Z"/><path d="M5 19V5"/>'),
  skipForward: icon('<path d="m5 4 10 8-10 8V4Z"/><path d="M19 5v14"/>'),
  stop: icon('<rect x="6" y="6" width="12" height="12" rx="2"/>', true),
  sun: icon('<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/>'),
  moon: icon('<path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/>')
};
var GOOGLE_MARK =
  '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="#4285F4" d="M23.5 12.27c0-.85-.08-1.66-.22-2.45H12v4.64h6.45a5.52 5.52 0 0 1-2.39 3.58v2.97h3.87c2.26-2.09 3.57-5.16 3.57-8.74z"/><path fill="#34A853" d="M12 24c3.24 0 5.96-1.07 7.94-2.91l-3.87-2.97c-1.07.72-2.45 1.15-4.07 1.15-3.13 0-5.78-2.11-6.73-4.96H1.29v3.07A12 12 0 0 0 12 24z"/><path fill="#FBBC05" d="M5.27 14.31A7.2 7.2 0 0 1 4.89 12c0-.8.14-1.58.38-2.31V6.62H1.29a12 12 0 0 0 0 10.76l3.98-3.07z"/><path fill="#EA4335" d="M12 4.74c1.76 0 3.34.61 4.58 1.8l3.44-3.44A11.98 11.98 0 0 0 12 0 12 12 0 0 0 1.29 6.62l3.98 3.07C6.22 6.85 8.87 4.74 12 4.74z"/></svg>';

/* ---------- Strings, copied from the space's i18n.ts ---------- */
var STR = {
  en: {
    scroll: "Scroll", discover: "Discover", plans: "Plans", saved: "Saved", profile: "Profile",
    pro: "Pro", goPro: "Go Pro", verseOfDay: "Verse of the Day", dayStreak: "day streak",
    versesRead: "verses read", daysRead: "days read", today: "today", readNow: "Read now",
    howDoYouFeel: "What do you need today?", chapters: "Chapters & Sections",
    searchPlaceholder: "Search a word or verse…", searchTitle: "Search the texts",
    noResults: "No verses found for that search.",
    savedEmpty: "Nothing saved yet. Tap the bookmark on any verse and it will wait for you here.",
    meaning: "Meaning", hindiMeaning: "Hindi meaning", englishMeaning: "English meaning",
    tapToUnderstand: "Tap to understand in easy language", exampleLabel: "A real-life example",
    meaningRetry: "Meaning didn't load, tap to retry", loadingMeaning: "Preparing the meaning…",
    study: "Study", explain: "Explain Simply", deepStudy: "Deep Study", wordByWord: "Word by Word",
    related: "Related Verses", commentary: "Commentary", lockedPro: "A Pro study tool",
    unlockPro: "Unlock with Pro",
    aiNote: "Study aid composed on this device from the verse's own translation and word meanings, read it with the Sanskrit alongside. It can be imperfect.",
    commentaryBy: "Swami Sivananda (public domain)",
    translationBy: "English: Shri Purohit Swami (1935, public domain)",
    applyToday: "For today", markDayDone: "Mark day complete", dayDone: "Completed", day: "Day",
    backToText: "Back to the full text", share: "Share", save: "Save", like: "Like",
    yourJourney: "Your journey", textSize: "Verse text size", language: "Language",
    appearance: "Appearance", darkMode: "Dark mode", lightMode: "Light mode", account: "Account",
    notSignedIn: "Not signed in", previewReader: "Preview reader", signInWithGoogle: "Sign in with Google",
    signedInWithGoogle: "Signed in with Google", signOut: "Sign Out",
    googleTiedNote: "Your streak, saved verses, likes, plan progress and Pro are tied to this Google account, on your phone and desktop alike.",
    proTiedGoogle: "Pro will be tied to your Google account once you are signed in.",
    proTiedSignedIn: "Pro will be tied to your Google account",
    signIn: "Sign in",
    tagline: "Learn your tradition",
    proViaGoogle: "Unlocked with your Google sign-in",
    signInFailed: "Google sign-in did not complete. Please try again.",
    legal: "Legal", privacyPolicy: "Privacy Policy", termsConditions: "Terms and Conditions", refundPolicy: "Refund Policy",
    about: "About & sources",
    aboutBody: "ScrollVerse is a verse-by-verse scroll through India's sacred texts, one shloka per screen, in canonical order, never an algorithmic feed. The Sanskrit texts are public domain. Gita English translation: Shri Purohit Swami (1935). Word meanings and commentary: Swami Sivananda. Mahabharata text: BORI Critical Edition. Ramayana and Hanuman Chalisa texts come from open datasets of the public-domain originals. Study aids marked AI are generated once per verse and stored; treat them as a reading companion, not a guru.",
    cancelPro: "Cancel Pro", proActive: "Pro is active", proUntil: "Renews / ends", planLabel: "Plan",
    trialNote: "7-day free trial, then", perMonth: "/month", perYear: "/year", perDay: "/day",
    mostPopular: "Most popular", bestValue: "Best value",
    proFeatures: [
      "Audio chanting, hear every shloka chanted in Sanskrit",
      "Listen in Hindi & English, meanings read aloud, chant + meaning together",
      "Play All, a whole chapter or the full Chalisa, hands-free",
      "Deep Study for every verse, meaning, context, and how it applies",
      "Related Verses that connect the teaching across the text",
      "Scripture itself stays free, always, Pro pays for the study & listening layer"
    ],
    startTrial: "Start 7-day free trial", subscribe: "Subscribe",
    checkoutNote: "Web preview, checkout is simulated here, no real charge. In the app this is UPI Autopay.",
    welcomeTitle: "Scroll the shlokas, not the feed.",
    welcomeBody: "One verse per screen. Sanskrit first, meaning one tap away. What brings you here?",
    goals: ["Peace of mind", "Focus", "Wisdom", "A daily habit"], skip: "Skip",
    verses: "verses", shareFailed: "Could not create the share card.",
    copiedCard: "Card image downloaded, share it anywhere.", managePro: "Manage Pro",
    notProYet: "You are on the free scroll. Every verse is free; Pro unlocks the study tools.",
    fontSmall: "A−", fontBig: "A+", close: "Close", listen: "Listen", listenTitle: "Listen & Chant",
    modeChant: "Sanskrit chant", modeHindi: "Hindi meaning", modeEnglish: "English meaning",
    modeChantHindi: "Chant + Hindi", modeChantEnglish: "Chant + English",
    playVerse: "Play this verse", playAll: "Play all", pause: "Pause", resume: "Resume", stop: "Stop",
    nextVerse: "Next verse", prevVerse: "Previous verse", speed: "Speed", slow: "Slow chant",
    normalSpeed: "Normal", voiceLabel: "Voice", voiceDeepMale: "Deep male recitation, pandit-style",
    voiceOnDevice: "on this device", voiceServerTitle: "Recorded server voices, deep male",
    voiceServerDetail: "Sanskrit · Google Chirp 3 HD Charon · Hindi · Google Neural2 male · English · Google Neural2 male (American)",
    audioNoteServer: "The Gita plays as real recordings, made with Google's Chirp and Neural2 deep male voices and streamed from the server, not your phone's built-in voice. Only the verse you play is downloaded. Best with headphones.",
    audioNote: "The voice comes from your own device, Google on Android, Microsoft on Windows, Apple on iPhone/Mac. ScrollVerse picks the deepest male voice it finds there and pitches it lower still, for a resonant, pandit-style recitation. Sanskrit is chanted slowly with the Hindi voice, which reads Devanagari clearly. Best with headphones.",
    audioUnsupported: "Audio isn't available on this device or browser.",
    audioFreeNote: "Sanskrit chanting for a single verse is free. Hindi & English narration, chant + meaning and hands-free Play All are Pro.",
    audioLockedTitle: "Listening in Hindi & English is Pro",
    audioLockedBody: "Hear the meaning read aloud in Hindi or English, chant + meaning together, and play a whole chapter hands-free.",
    listenSectionTitle: "Listen & Chant", listenSectionSub: "Close your eyes and listen, chanting and meanings read aloud.",
    nowPlaying: "Now playing", verseWord: "verse", audioLoading: "Getting the voice ready…",
    audioRetry: "Retry",
    audioErrorFailed: "The voice couldn't play this verse. Check the volume and silent mode, then tap Retry.",
    audioErrorSilent: "No sound started on this device. Check the volume and silent mode, then tap Retry.",
    audioErrorNoHindiVoice: "No Hindi voice is installed on this device, so the Sanskrit and Hindi can't be read aloud yet. Add a Hindi voice in your device's speech / text-to-speech settings, then tap Retry.",
    chooseText: "Choose a text", daysWord: "days", markDoneShort: "Mark done",
    keepGoing: "Keep going, verse after verse, hands-free", freeWord: "Free",
    proGitaNote: "Deep Study, Related Verses and listening in Hindi & English are now open on every verse. Tap the headphones on any verse to listen."
  },
  hi: {
    scroll: "स्क्रॉल", discover: "खोजें", plans: "योजनाएँ", saved: "सहेजे हुए", profile: "प्रोफ़ाइल",
    pro: "प्रो", goPro: "प्रो लें", verseOfDay: "आज का श्लोक", dayStreak: "दिन की श्रृंखला",
    versesRead: "श्लोक पढ़े", daysRead: "दिन पढ़ा", today: "आज", readNow: "अभी पढ़ें",
    howDoYouFeel: "आज आपको क्या चाहिए?", chapters: "अध्याय और खण्ड",
    searchPlaceholder: "कोई शब्द या श्लोक खोजें…", searchTitle: "ग्रन्थों में खोजें",
    noResults: "इस खोज के लिए कोई श्लोक नहीं मिला।",
    savedEmpty: "अभी कुछ सहेजा नहीं है। किसी भी श्लोक पर बुकमार्क दबाएँ, वह यहाँ मिलेगा।",
    meaning: "अर्थ", hindiMeaning: "हिन्दी अर्थ", englishMeaning: "अंग्रेज़ी अर्थ",
    tapToUnderstand: "आसान भाषा में समझने के लिए दबाएँ", exampleLabel: "रोज़मर्रा का उदाहरण",
    meaningRetry: "अर्थ नहीं आया, फिर कोशिश के लिए दबाएँ", loadingMeaning: "अर्थ तैयार हो रहा है…",
    study: "अध्ययन", explain: "सरल अर्थ", deepStudy: "गहन अध्ययन", wordByWord: "शब्दार्थ",
    related: "सम्बन्धित श्लोक", commentary: "टीका", lockedPro: "यह प्रो अध्ययन साधन है",
    unlockPro: "प्रो से खोलें",
    aiNote: "यह अध्ययन सहायक इसी डिवाइस पर श्लोक के अपने अनुवाद और शब्दार्थ से बनाया गया है, इसे संस्कृत के साथ पढ़िए। इसमें त्रुटि हो सकती है।",
    commentaryBy: "स्वामी शिवानन्द (सार्वजनिक डोमेन)",
    translationBy: "अंग्रेज़ी: श्री पुरोहित स्वामी (1935, सार्वजनिक डोमेन)",
    applyToday: "आज के लिए", markDayDone: "दिन पूर्ण करें", dayDone: "पूर्ण", day: "दिन",
    backToText: "पूरे ग्रन्थ पर वापस", share: "साझा करें", save: "सहेजें", like: "पसंद",
    yourJourney: "आपकी यात्रा", textSize: "श्लोक का अक्षर आकार", language: "भाषा",
    appearance: "रूप", darkMode: "डार्क मोड", lightMode: "लाइट मोड", account: "खाता",
    notSignedIn: "साइन इन नहीं है", previewReader: "पूर्वावलोकन पाठक", signInWithGoogle: "Google से साइन इन करें",
    signedInWithGoogle: "Google से साइन इन है", signOut: "साइन आउट",
    googleTiedNote: "आपकी स्ट्रीक, सहेजे हुए श्लोक, लाइक, योजना की प्रगति और प्रो इस Google खाते से जुड़े हैं, फ़ोन हो या डेस्कटॉप।",
    proTiedGoogle: "साइन इन करने के बाद प्रो आपके Google खाते से जुड़ेगा।",
    proTiedSignedIn: "प्रो आपके Google खाते से जुड़ेगा",
    signIn: "साइन इन",
    tagline: "अपनी परम्परा को जानिए",
    proViaGoogle: "आपके Google साइन इन से खुला है",
    signInFailed: "Google साइन इन पूरा नहीं हुआ। कृपया फिर कोशिश करें।",
    legal: "कानूनी जानकारी", privacyPolicy: "गोपनीयता नीति", termsConditions: "नियम और शर्तें", refundPolicy: "रिफ़ंड नीति",
    about: "परिचय और स्रोत",
    aboutBody: "स्क्रॉलवर्स भारत के पवित्र ग्रन्थों की श्लोक-दर-श्लोक यात्रा है, एक स्क्रीन पर एक श्लोक, मूल क्रम में, कोई एल्गोरिद्म फ़ीड नहीं। संस्कृत मूल पाठ सार्वजनिक डोमेन में है। गीता का अंग्रेज़ी अनुवाद: श्री पुरोहित स्वामी (1935)। शब्दार्थ और टीका: स्वामी शिवानन्द। महाभारत पाठ: भण्डारकर समीक्षित संस्करण। रामायण और हनुमान चालीसा के पाठ सार्वजनिक डोमेन मूल के खुले डेटासेट से हैं। AI चिह्नित अध्ययन सामग्री हर श्लोक के लिए एक बार बनाकर सहेजी जाती है; इसे गुरु नहीं, पठन-साथी समझिए।",
    cancelPro: "प्रो रद्द करें", proActive: "प्रो सक्रिय है", proUntil: "नवीनीकरण / समाप्ति", planLabel: "योजना",
    trialNote: "7 दिन निःशुल्क, फिर", perMonth: "/माह", perYear: "/वर्ष", perDay: "/दिन",
    mostPopular: "सबसे लोकप्रिय", bestValue: "सबसे किफ़ायती",
    proFeatures: [
      "ध्वनि पाठ, हर श्लोक संस्कृत में सुनें",
      "हिन्दी व अंग्रेज़ी में सुनें, अर्थ आवाज़ में, पाठ + अर्थ एक साथ",
      "Play All, पूरा अध्याय या पूरी चालीसा, बिना हाथ लगाए",
      "हर श्लोक का गहन अध्ययन, अर्थ, प्रसंग और आज के जीवन में उपयोग",
      "सम्बन्धित श्लोक जो पूरे ग्रन्थ की शिक्षा को जोड़ते हैं",
      "शास्त्र सदा निःशुल्क रहेगा, प्रो केवल अध्ययन व श्रवण साधनों के लिए है"
    ],
    startTrial: "7 दिन का निःशुल्क परीक्षण शुरू करें", subscribe: "सदस्यता लें",
    checkoutNote: "वेब पूर्वावलोकन, यहाँ भुगतान अनुकरण मात्र है, कोई वास्तविक शुल्क नहीं। ऐप में यह UPI ऑटोपे होगा।",
    welcomeTitle: "फ़ीड नहीं, श्लोक स्क्रॉल कीजिए।",
    welcomeBody: "एक स्क्रीन, एक श्लोक। पहले संस्कृत, अर्थ एक दबाव पर। आप यहाँ क्यों आए हैं?",
    goals: ["मन की शांति", "एकाग्रता", "ज्ञान", "रोज़ की आदत"], skip: "छोड़ें",
    verses: "श्लोक", shareFailed: "साझा कार्ड नहीं बन सका।",
    copiedCard: "कार्ड छवि डाउनलोड हो गई, कहीं भी साझा कीजिए।", managePro: "प्रो प्रबन्धन",
    notProYet: "आप निःशुल्क स्क्रॉल पर हैं। हर श्लोक निःशुल्क है; प्रो अध्ययन साधन खोलता है।",
    fontSmall: "A−", fontBig: "A+", close: "बन्द करें", listen: "सुनें", listenTitle: "सुनें और जप करें",
    modeChant: "संस्कृत पाठ", modeHindi: "हिन्दी अर्थ सुनें", modeEnglish: "अंग्रेज़ी अर्थ सुनें",
    modeChantHindi: "पाठ + हिन्दी अर्थ", modeChantEnglish: "पाठ + अंग्रेज़ी अर्थ",
    playVerse: "यह श्लोक सुनें", playAll: "सभी सुनें", pause: "रोकें", resume: "जारी रखें", stop: "बन्द करें",
    nextVerse: "अगला श्लोक", prevVerse: "पिछला श्लोक", speed: "गति", slow: "धीमा पाठ",
    normalSpeed: "सामान्य", voiceLabel: "आवाज़", voiceDeepMale: "गहरी पुरुष आवाज़, पण्डित-शैली पाठ",
    voiceOnDevice: "इस डिवाइस पर", voiceServerTitle: "रिकॉर्ड की हुई सर्वर आवाज़ें, गहरी पुरुष आवाज़",
    voiceServerDetail: "संस्कृत · Google Chirp 3 HD Charon · हिन्दी · Google Neural2 पुरुष · अंग्रेज़ी · Google Neural2 पुरुष (अमेरिकी)",
    audioNoteServer: "गीता असली रिकॉर्डिंग में सुनाई देती है, Google की Chirp और Neural2 गहरी पुरुष आवाज़ों से बनी, सर्वर से स्ट्रीम होती है, आपके फ़ोन की बिल्ट-इन आवाज़ नहीं। सिर्फ़ वही श्लोक डाउनलोड होता है जो आप चलाते हैं। हेडफ़ोन से सबसे अच्छा सुनाई देगा।",
    audioNote: "आवाज़ आपके अपने डिवाइस से आती है, Android पर Google, Windows पर Microsoft, iPhone/Mac पर Apple। स्क्रॉलवर्स वहाँ मिलने वाली सबसे गहरी पुरुष आवाज़ चुनता है और उसे और गहरा करके पण्डित-शैली का गम्भीर पाठ बनाता है। संस्कृत का पाठ धीरे-धीरे हिन्दी आवाज़ में होता है, जो देवनागरी स्पष्ट पढ़ती है। हेडफ़ोन से सबसे अच्छा सुनाई देगा।",
    audioUnsupported: "इस डिवाइस या ब्राउज़र पर ध्वनि उपलब्ध नहीं है।",
    audioFreeNote: "एक श्लोक का संस्कृत पाठ निःशुल्क है। हिन्दी व अंग्रेज़ी वाचन, पाठ + अर्थ और पूरे अध्याय का Play All प्रो में है।",
    audioLockedTitle: "हिन्दी व अंग्रेज़ी में सुनना प्रो में है",
    audioLockedBody: "अर्थ हिन्दी या अंग्रेज़ी में सुनें, पाठ + अर्थ एक साथ सुनें, और पूरा अध्याय बिना हाथ लगाए सुनें।",
    listenSectionTitle: "सुनें और जप करें", listenSectionSub: "आँखें बन्द करके सुनें, पाठ और अर्थ, आवाज़ में।",
    nowPlaying: "अभी चल रहा है", verseWord: "श्लोक", audioLoading: "आवाज़ तैयार हो रही है…",
    audioRetry: "फिर कोशिश करें",
    audioErrorFailed: "आवाज़ यह श्लोक नहीं सुना पाई। वॉल्यूम और साइलेंट मोड जाँचकर फिर कोशिश करें।",
    audioErrorSilent: "इस डिवाइस पर आवाज़ शुरू नहीं हुई। वॉल्यूम और साइलेंट मोड जाँचकर फिर कोशिश करें।",
    audioErrorNoHindiVoice: "इस डिवाइस पर हिन्दी आवाज़ नहीं है, इसलिए संस्कृत और हिन्दी अभी सुनाए नहीं जा सकते। डिवाइस की स्पीच / टेक्स्ट-टू-स्पीच सेटिंग में हिन्दी आवाज़ जोड़कर फिर कोशिश करें।",
    chooseText: "ग्रन्थ चुनें", daysWord: "दिन", markDoneShort: "पूर्ण करें",
    keepGoing: "एक के बाद एक, अपने आप आगे बढ़े", freeWord: "निःशुल्क",
    proGitaNote: "गहन अध्ययन, सम्बन्धित श्लोक और हिन्दी-अंग्रेज़ी में सुनना अब हर श्लोक पर खुला है। किसी भी श्लोक पर हेडफ़ोन दबाकर सुनें।"
  }
};
function t() { return STR[state.lang] || STR.en; }

/* ---------- Texts, moods, plans, pricing: from the space's corpus.ts ---------- */
var TEXT_ORDER = ["gita", "ramayana", "mahabharata", "chalisa"];
var TEXT_META = {
  gita: { name: "Bhagavad Gita", nameHi: "भगवद्गीता", taglineEn: "The full Gita, verse by verse", taglineHi: "पूरी गीता, एक-एक श्लोक" },
  ramayana: { name: "Ramayana", nameHi: "रामायण", taglineEn: "Curated scroll · openings of the seven Kandas", taglineHi: "चुना हुआ संग्रह · सातों काण्डों के आरम्भ" },
  mahabharata: { name: "Mahabharata", nameHi: "महाभारत", taglineEn: "Curated scroll · Critical Edition text", taglineHi: "चुना हुआ संग्रह · समीक्षित संस्करण" },
  chalisa: { name: "Hanuman Chalisa", nameHi: "हनुमान चालीसा", taglineEn: "Tulsidas's forty verses, complete", taglineHi: "तुलसीदास के चालीस पद, सम्पूर्ण" }
};
var RAMA_SEC_HI = { "kanda-1": "बाल काण्ड", "kanda-2": "अयोध्या काण्ड", "kanda-3": "अरण्य काण्ड", "kanda-4": "किष्किन्धा काण्ड", "kanda-5": "सुन्दर काण्ड", "kanda-6": "युद्ध काण्ड", "kanda-7": "उत्तर काण्ड" };
var MB_SECTIONS = [
  { id: "adi-opening", name: "Adi Parva, The Opening", nameHi: "आदि पर्व, आरम्भ" },
  { id: "yaksha", name: "Yaksha Prashna, The Questions at the Lake", nameHi: "यक्ष प्रश्न, सरोवर के प्रश्न" }
];
var MOODS = [
  { id: "anxiety", nameEn: "Anxiety", nameHi: "चिंता", keys: ["gita:2:47", "gita:2:48", "gita:2:62", "gita:2:63", "gita:6:5", "gita:18:66"] },
  { id: "focus", nameEn: "Focus", nameHi: "एकाग्रता", keys: ["gita:2:41", "gita:2:44", "gita:6:12", "gita:6:25", "gita:6:26", "gita:18:63"] },
  { id: "anger", nameEn: "Anger", nameHi: "क्रोध", keys: ["gita:2:62", "gita:2:63", "gita:3:37", "gita:3:39", "gita:16:21", "gita:5:26"] },
  { id: "courage", nameEn: "Courage", nameHi: "साहस", keys: ["gita:2:3", "gita:2:31", "gita:2:37", "gita:11:33", "gita:18:66", "gita:4:42"] },
  { id: "grief", nameEn: "Grief & Loss", nameHi: "शोक", keys: ["gita:2:11", "gita:2:13", "gita:2:20", "gita:2:22", "gita:2:27", "gita:8:5"] },
  { id: "decisions", nameEn: "Decisions", nameHi: "निर्णय", keys: ["gita:2:47", "gita:3:35", "gita:18:63", "gita:18:64", "gita:2:41", "gita:6:5"] },
  { id: "devotion", nameEn: "Devotion", nameHi: "भक्ति", keys: ["gita:9:22", "gita:9:26", "gita:9:34", "gita:12:8", "gita:18:65", "gita:18:66"] },
  { id: "calm", nameEn: "Calm & Sleep", nameHi: "शांति", keys: ["gita:2:66", "gita:2:71", "gita:5:29", "gita:6:15", "gita:12:12", "gita:2:70"] }
];
var PLAN_PRICES = { daily: { INR: 29, USD: 2 }, monthly: { INR: 99, USD: 9 }, yearly: { INR: 599, USD: 59 } };
var PLAN_DEFS = [
  { id: "daily", per: "perDay" },
  { id: "monthly", per: "perMonth", badge: "mostPopular" },
  { id: "yearly", per: "perYear", badge: "bestValue" }
];
var AUDIO_LANGS = ["sanskrit", "hindi", "english"];
var AUDIO_SET = {};
(function () {
  for (var v = 1; v <= 47; v++) for (var l = 0; l < 3; l++) AUDIO_SET["gita-1-" + v + "-" + AUDIO_LANGS[l]] = true;
})();
var GOAL_KEYS = ["Peace of mind", "Focus", "Wisdom", "A daily habit"];

/* ---------- State (localStorage, this device only) ---------- */
var STORE_KEY = "sanatan-scroll-web-v1";
var THEME_KEY = "sanatan-scroll-theme";
var state = loadState();
function loadState() {
  var d = {
    lang: "en", goal: null, likes: [], saves: [], positions: {}, readDays: {},
    totalVerses: 0, planDone: {}, pro: null, trialUsed: false, fontScale: 1
  };
  try {
    var raw = localStorage.getItem(STORE_KEY);
    if (raw) {
      var p = JSON.parse(raw);
      for (var k in d) if (typeof p[k] !== "undefined") d[k] = p[k];
    }
  } catch (e) { /* private mode, defaults */ }
  return d;
}
function saveState() {
  try { localStorage.setItem(STORE_KEY, JSON.stringify(state)); } catch (e) { /* ignore */ }
}
function themeMode() {
  try { return localStorage.getItem(THEME_KEY) === "light" ? "light" : "dark"; }
  catch (e) { return "dark"; }
}
function setTheme(mode) {
  document.documentElement.setAttribute("data-theme", mode);
  try { localStorage.setItem(THEME_KEY, mode); } catch (e) { /* ignore */ }
  renderHeader();
}
function isPro() {
  if (!state.pro) return false;
  if (state.pro.expiresAt && Date.now() > state.pro.expiresAt) { state.pro = null; saveState(); return false; }
  return true;
}
function detectCurrency() {
  try {
    var tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (tz === "Asia/Kolkata" || tz === "Asia/Calcutta") return "INR";
    var lg = (navigator.language || "").toLowerCase();
    if (lg.indexOf("en-in") === 0 || lg.indexOf("hi") === 0) return "INR";
  } catch (e) { /* fall through */ }
  return "USD";
}
var currency = detectCurrency();
function formatPrice(n) { return currency === "INR" ? "₹" + n : "$" + n; }
function istToday() { return new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" }); }
function streakInfo() {
  var days = Object.keys(state.readDays).sort();
  var totalDays = days.length;
  var totalVerses = 0, k;
  for (k in state.readDays) totalVerses += state.readDays[k].length;
  var current = 0;
  var d = new Date();
  for (var i = 0; i < 366; i++) {
    var key = d.toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" });
    if (state.readDays[key]) { current++; d.setDate(d.getDate() - 1); }
    else if (i === 0) { d.setDate(d.getDate() - 1); }
    else break;
  }
  var todayKey = istToday();
  return {
    current: current, totalDays: totalDays, totalVerses: totalVerses,
    versesToday: state.readDays[todayKey] ? state.readDays[todayKey].length : 0
  };
}

/* ---------- Google sign-in (the space's lib/google.ts + lib/config.ts) ----------
   Real Google sign-in via Google Identity Services (GIS), OAuth 2.0
   token flow. Tapping Sign in opens Google's own account chooser: the
   reader picks one of their Google accounts, Google returns an access
   token, and the app reads the profile (name, email, picture) from
   Google's userinfo endpoint. There is no Client Secret anywhere in
   this flow, and the reader is never asked for a Client ID: the OAuth
   Client ID is pre-configured for the app, the same value as
   GOOGLE_CLIENT_ID in the space's client/src/lib/config.ts. A host may
   override it by assigning window.SANATAN_GOOGLE_CLIENT_ID before the
   app loads. The Client ID's authorised JavaScript origins in Google
   Cloud Console must include this site's origin.
   The Google session is stored on this device. While a session
   exists, Pro is unlocked (a paid plan is never touched by signing in
   or out) and each text resumes on the verse after the last one read. */
var GOOGLE_CLIENT_ID = "342264556763-u76gmthiil99ahh3f20rvbivokjb9qp6.apps.googleusercontent.com";
var GOOGLE_USER_KEY = "sanatan-scroll-google-user";
function googleClientId() {
  if (typeof window.SANATAN_GOOGLE_CLIENT_ID === "string" && window.SANATAN_GOOGLE_CLIENT_ID.trim()) {
    return window.SANATAN_GOOGLE_CLIENT_ID.trim();
  }
  return GOOGLE_CLIENT_ID.trim();
}
function loadGoogleUser() {
  try {
    var raw = localStorage.getItem(GOOGLE_USER_KEY);
    if (!raw) return null;
    var p = JSON.parse(raw);
    if (typeof p.name === "string" && p.name && typeof p.email === "string" && p.email) {
      return { name: p.name, email: p.email, picture: typeof p.picture === "string" ? p.picture : undefined };
    }
  } catch (e) { /* corrupt or unavailable storage: signed out */ }
  return null;
}
var googleUser = loadGoogleUser();
function setGoogleUser(user) {
  googleUser = user;
  try {
    if (user) localStorage.setItem(GOOGLE_USER_KEY, JSON.stringify(user));
    else localStorage.removeItem(GOOGLE_USER_KEY);
  } catch (e) { /* storage unavailable: the session lasts in memory only */ }
  if (user) linkGooglePro(); else unlinkGooglePro();
}
function linkGooglePro() {
  // Signing in unlocks Pro. A paid plan (daily, monthly, yearly,
  // trial) is never overwritten by linking.
  if (isPro()) return;
  state.pro = { plan: "google", expiresAt: null };
  saveState();
}
function unlinkGooglePro() {
  // Signing out ends the Google unlock only; a paid plan stays.
  if (state.pro && state.pro.plan === "google") {
    state.pro = null;
    saveState();
  }
}
var gisScriptPromise = null;
function loadGisScript() {
  if (window.google && window.google.accounts && window.google.accounts.oauth2) return Promise.resolve();
  if (gisScriptPromise) return gisScriptPromise;
  gisScriptPromise = new Promise(function (resolve, reject) {
    var script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    script.onload = function () { resolve(); };
    script.onerror = function () {
      gisScriptPromise = null;
      reject(new Error("Google sign-in script failed to load"));
    };
    document.head.appendChild(script);
  });
  return gisScriptPromise;
}
function signInWithGoogle() {
  var clientId = googleClientId();
  if (!clientId) return Promise.reject(new Error("Google sign-in is not available yet."));
  return loadGisScript().then(function () {
    var oauth2 = window.google && window.google.accounts && window.google.accounts.oauth2;
    if (!oauth2) throw new Error("Google sign-in did not complete.");
    return new Promise(function (resolve, reject) {
      var client = oauth2.initTokenClient({
        client_id: clientId,
        scope: "openid email profile",
        callback: function (resp) {
          if (resp.access_token) resolve(resp.access_token);
          else reject(new Error(resp.error || "Google sign-in was cancelled."));
        },
        error_callback: function (err) {
          reject(new Error((err && (err.message || err.type)) || "Google sign-in was blocked."));
        }
      });
      client.requestAccessToken({ prompt: "select_account" });
    });
  }).then(function (accessToken) {
    return fetch("https://openidconnect.googleapis.com/v1/userinfo", {
      headers: { Authorization: "Bearer " + accessToken }
    });
  }).then(function (infoResp) {
    if (!infoResp.ok) throw new Error("Google sign-in did not complete.");
    return infoResp.json();
  }).then(function (info) {
    var name = typeof info.name === "string" ? info.name : "";
    var email = typeof info.email === "string" ? info.email : "";
    if (!name || !email) throw new Error("Google sign-in did not complete.");
    var user = { name: name, email: email, picture: typeof info.picture === "string" ? info.picture : undefined };
    setGoogleUser(user);
    return user;
  });
}
function signOutGoogle() {
  setGoogleUser(null);
  try { if (window.google) window.google.accounts.id.disableAutoSelect(); } catch (e) { /* GIS not loaded */ }
  renderAllChrome();
  if (screen === "profile") renderProfile();
}
function startGoogleSignIn() {
  signInWithGoogle().then(function () {
    renderAllChrome();
    if (screen === "profile") renderProfile();
    closePaywall();
  }).catch(function () {
    showNotice(t().signInFailed);
  });
}
function googleButtonHtml() {
  var tt = t();
  return '<button type="button" class="googlebtn" data-google-signin="1">' + GOOGLE_MARK + esc(tt.signInWithGoogle) + "</button>";
}
function wireGoogleButtons(root) {
  root.querySelectorAll("[data-google-signin]").forEach(function (b) {
    b.addEventListener("click", function () {
      b.disabled = true;
      startGoogleSignIn();
      setTimeout(function () { b.disabled = false; }, 1200);
    });
  });
}

/* ---------- Corpus ---------- */
var corpus = null;       // raw data/corpus.json
var commentary = null;   // data/gita-comm.json, loaded lazily
var TEXTS = {};          // built verse lists, space Verse shape
var VERSE_BY_KEY = {};
var PLANS = [];

function buildTexts() {
  var gitaCh = {};
  corpus.gita.chapters.forEach(function (c) { gitaCh[c.n] = c; });
  var gitaVerses = corpus.gita.verses.map(function (v) {
    var ch = gitaCh[v.c] || {};
    return {
      key: v.key, textKey: "gita", ref: "Bhagavad Gita " + v.c + "." + v.v, refShort: v.c + "." + v.v,
      section: "Chapter " + v.c + " · " + (ch.meaningEn || ""), sectionHi: "अध्याय " + v.c + " · " + (ch.meaningHi || ch.name || ""),
      sa: v.sa, hi: v.hi || undefined, en: v.en || undefined,
      words: v.words && v.words.length ? v.words : undefined, c: v.c, v: v.v
    };
  });
  var gitaSections = [], idx = 0;
  corpus.gita.chapters.forEach(function (c) {
    gitaSections.push({ id: "ch-" + c.n, name: "Chapter " + c.n + " · " + c.meaningEn, nameHi: "अध्याय " + c.n + " · " + (c.meaningHi || ""), startIndex: idx, count: c.count, summaryEn: c.summaryEn, summaryHi: c.summaryHi });
    idx += c.count;
  });
  TEXTS.gita = { key: "gita", verses: gitaVerses, sections: gitaSections };

  var ramaVerses = corpus.ramayana.verses.map(function (v) {
    return {
      key: v.key, textKey: "ramayana",
      ref: "Ramayana · " + v.sectionName + " " + v.sarga + "." + v.n, refShort: v.sarga + "." + v.n,
      section: v.sectionName, sectionHi: RAMA_SEC_HI[v.section] || v.sectionName,
      sa: v.sa, en: v.en || undefined, sectionId: v.section
    };
  });
  var ramaSections = corpus.ramayana.sections.map(function (s) {
    var start = ramaVerses.findIndex(function (v) { return v.sectionId === s.id; });
    return { id: s.id, name: s.name, nameHi: RAMA_SEC_HI[s.id] || s.name, startIndex: start < 0 ? 0 : start, count: s.count };
  });
  TEXTS.ramayana = { key: "ramayana", verses: ramaVerses, sections: ramaSections };

  var mbVerses = corpus.mahabharata.verses.map(function (v) {
    return {
      key: v.key, textKey: "mahabharata",
      ref: "Mahabharata · " + v.book + "." + v.chap + "." + v.n, refShort: v.chap + "." + v.n,
      section: (MB_SECTIONS.filter(function (s) { return s.id === v.section; })[0] || {}).name || v.section,
      sectionHi: (MB_SECTIONS.filter(function (s) { return s.id === v.section; })[0] || {}).nameHi || v.section,
      sa: v.sa, speaker: v.speaker || undefined, sectionId: v.section
    };
  });
  var mbSections = MB_SECTIONS.map(function (s) {
    var start = mbVerses.findIndex(function (v) { return v.sectionId === s.id; });
    var count = mbVerses.filter(function (v) { return v.sectionId === s.id; }).length;
    return { id: s.id, name: s.name, nameHi: s.nameHi, startIndex: start < 0 ? 0 : start, count: count };
  });
  TEXTS.mahabharata = { key: "mahabharata", verses: mbVerses, sections: mbSections };

  var chalVerses = corpus.chalisa.verses.map(function (v) {
    return {
      key: v.key, textKey: "chalisa",
      ref: v.type === "doha" ? "Hanuman Chalisa · Doha " + v.num : "Hanuman Chalisa · Chaupai " + v.num,
      refShort: v.type === "doha" ? "Doha " + v.num : "" + v.num,
      section: "Hanuman Chalisa", sectionHi: "हनुमान चालीसा",
      sa: v.sa, hi: v.hi || undefined, en: v.en || undefined
    };
  });
  TEXTS.chalisa = { key: "chalisa", verses: chalVerses, sections: [{ id: "chalisa", name: "Hanuman Chalisa", nameHi: "हनुमान चालीसा", startIndex: 0, count: chalVerses.length }] };

  TEXT_ORDER.forEach(function (k) {
    TEXTS[k].verses.forEach(function (v) { VERSE_BY_KEY[v.key] = v; });
  });
  PLANS = buildPlans();
}
function chunkPlan(id, nameEn, nameHi, descEn, descHi, textKey, totalDays, labelFn) {
  var verses = TEXTS[textKey].verses;
  var per = Math.ceil(verses.length / totalDays);
  var days = [];
  for (var d = 0; d < totalDays; d++) {
    var start = d * per;
    if (start >= verses.length) break;
    var slice = verses.slice(start, start + per);
    var lab = labelFn(slice[0], slice[slice.length - 1], d + 1);
    days.push({ day: d + 1, textKey: textKey, startIndex: start, count: slice.length, labelEn: lab[0], labelHi: lab[1] });
  }
  return { id: id, nameEn: nameEn, nameHi: nameHi, descEn: descEn, descHi: descHi, days: days };
}
function buildPlans() {
  var gita21 = chunkPlan("gita-21", "The Gita in 21 Days", "21 दिनों में गीता",
    "The whole Bhagavad Gita, about 34 verses a day.", "पूरी भगवद्गीता, रोज़ लगभग 34 श्लोक।",
    "gita", 21, function (from, to) { return [from.refShort + " – " + to.refShort, from.refShort + " – " + to.refShort]; });
  var ch2 = TEXTS.gita.verses.slice(47, 47 + 72);
  var per = Math.ceil(ch2.length / 7), sdays = [];
  for (var d = 0; d < 7; d++) {
    var slice = ch2.slice(d * per, d * per + per);
    if (!slice.length) break;
    sdays.push({ day: d + 1, textKey: "gita", startIndex: 47 + d * per, count: slice.length, labelEn: "Gita " + slice[0].refShort + " – " + slice[slice.length - 1].refShort, labelHi: "गीता " + slice[0].refShort + " – " + slice[slice.length - 1].refShort });
  }
  var sankhya = { id: "sankhya-7", nameEn: "Sankhya Yoga in 7 Days", nameHi: "7 दिनों में सांख्य योग", descEn: "Chapter 2, Krishna's core teaching, in a week.", descHi: "अध्याय 2, कृष्ण की मुख्य शिक्षा, एक सप्ताह में।", days: sdays };
  var chalisa40 = chunkPlan("chalisa-40", "40 Days of Chalisa", "40 दिन चालीसा",
    "One verse of the Hanuman Chalisa a day, the traditional 40-day practice.", "रोज़ एक पद, हनुमान चालीसा की पारम्परिक 40-दिन की साधना।",
    "chalisa", 40, function (from, to, day) { return ["Day " + day + " · " + from.ref, "दिन " + day + " · " + from.ref]; });
  return [gita21, sankhya, chalisa40];
}
function verseOfTheDay() {
  var now = new Date();
  var start = new Date(now.getFullYear(), 0, 0);
  var dayOfYear = Math.floor((now.getTime() - start.getTime()) / 86400000);
  var verses = TEXTS.gita.verses;
  return verses[dayOfYear % verses.length];
}
function searchVerses(query, limit) {
  var q = query.trim().toLowerCase();
  if (q.length < 2) return [];
  var out = [];
  for (var ti = 0; ti < TEXT_ORDER.length; ti++) {
    var list = TEXTS[TEXT_ORDER[ti]].verses;
    for (var i = 0; i < list.length; i++) {
      var v = list[i];
      var hay = (v.ref + " " + v.sa + " " + (v.en || "") + " " + (v.hi || "")).toLowerCase();
      if (hay.indexOf(q) !== -1) { out.push(v); if (out.length >= (limit || 40)) return out; }
    }
  }
  return out;
}
function loadCommentary(refShort, cb) {
  if (commentary) { cb(commentary[refShort] || null); return; }
  fetch("data/gita-comm.json").then(function (r) { return r.json(); }).then(function (d) {
    commentary = d; cb(d[refShort] || null);
  }).catch(function () { cb(null); });
}

/* ---------- Small helpers ---------- */
function el(id) { return document.getElementById(id); }
function esc(s) {
  return String(s == null ? "" : s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}
var toastTimer = null;
function showNotice(msg) {
  el("toastText").textContent = msg;
  el("toast").classList.remove("hidden");
  if (toastTimer) clearTimeout(toastTimer);
  toastTimer = setTimeout(function () { el("toast").classList.add("hidden"); }, 3600);
}
function recordRead(verse) {
  var day = istToday();
  var arr = state.readDays[day] || (state.readDays[day] = []);
  if (arr.indexOf(verse.key) === -1) arr.push(verse.key);
  var pos = state.positions[verse.textKey] || (state.positions[verse.textKey] = {});
  pos.verseKey = verse.key;
  pos.verseIndex = TEXTS[verse.textKey].verses.indexOf(verse);
  saveState();
  renderStreak();
}
function toggleIn(listName, key) {
  var list = state[listName];
  var i = list.indexOf(key);
  if (i === -1) list.push(key); else list.splice(i, 1);
  saveState();
}

/* ---------- App state ---------- */
var screen = "scroll";           // scroll | discover | plans | saved | profile
var textKey = "gita";
var spec = null;                 // { titleEn, titleHi, keys, planId?, planDay? }
var feedList = [];
var activeIdx = 0;
var lastRecordedKey = {};
var openPlanId = null;

var NAV = [
  { id: "scroll", icon: "scroll" },
  { id: "discover", icon: "compass" },
  { id: "plans", icon: "calendar" },
  { id: "saved", icon: "bookmark" },
  { id: "profile", icon: "user" }
];

/* ---------- Header (App.tsx top bar) ---------- */
function renderHeader() {
  var tt = t();
  var bar = el("textBar");
  bar.innerHTML = TEXT_ORDER.map(function (k) {
    var active = !spec && screen === "scroll" && textKey === k;
    var isCurrent = textKey === k;
    return '<button type="button" class="textchip' + (active || (isCurrent && screen !== "scroll") ? " active" : "") +
      '" data-text="' + k + '" aria-pressed="' + isCurrent + '">' +
      esc(state.lang === "hi" ? TEXT_META[k].nameHi : TEXT_META[k].name) + "</button>";
  }).join("");
  bar.querySelectorAll("[data-text]").forEach(function (b) {
    b.addEventListener("click", function () { selectText(b.getAttribute("data-text")); });
  });
  renderStreak();
  el("taglineEl").textContent = tt.tagline;
  var auth = el("authSlot");
  if (googleUser) {
    auth.innerHTML = '<button type="button" class="userchip" id="authChip" aria-label="' + esc(tt.account) + ": " + esc(googleUser.name) + '">' +
      (googleUser.picture
        ? '<img src="' + esc(googleUser.picture) + '" alt="" referrerpolicy="no-referrer">'
        : '<span class="initial">' + esc(googleUser.name.charAt(0).toUpperCase()) + "</span>") +
      '<span class="uname">' + esc(googleUser.name.split(" ")[0]) + "</span></button>";
    el("authChip").addEventListener("click", function () { setScreen("profile"); });
  } else {
    auth.innerHTML = '<button type="button" class="signinbtn" id="authSignIn">' + GOOGLE_MARK + esc(tt.signIn) + "</button>";
    el("authSignIn").addEventListener("click", function () {
      var b = el("authSignIn");
      b.disabled = true;
      signInWithGoogle().then(function () {
        renderAllChrome();
        if (screen === "profile") renderProfile();
      }).catch(function () {
        showNotice(tt.signInFailed);
      }).then(function () {
        var b2 = el("authSignIn");
        if (b2) b2.disabled = false;
      });
    });
  }
  el("langToggle").querySelectorAll("[data-lang]").forEach(function (b) {
    var on = b.getAttribute("data-lang") === state.lang;
    b.classList.toggle("active", on);
    b.setAttribute("aria-pressed", on ? "true" : "false");
  });
  var mode = themeMode();
  el("themeToggle").querySelectorAll("[data-theme-choice]").forEach(function (b) {
    var choice = b.getAttribute("data-theme-choice");
    b.innerHTML = choice === "light" ? I.sun : I.moon;
    b.classList.toggle("active", choice === mode);
    b.setAttribute("aria-pressed", choice === mode ? "true" : "false");
    b.setAttribute("aria-label", choice === "light" ? tt.lightMode : tt.darkMode);
  });
  var proBtn = el("proBtn");
  if (isPro()) { proBtn.classList.add("hidden"); }
  else {
    proBtn.classList.remove("hidden");
    proBtn.innerHTML = I.sparkle + esc(tt.pro);
  }
}
function renderStreak() {
  var s = streakInfo();
  el("streakPill").innerHTML = I.flame + s.current;
  el("streakPill").setAttribute("aria-label", s.current + " " + t().dayStreak);
}

/* ---------- Rails and bottom nav ---------- */
function renderNavs() {
  var tt = t();
  var labels = { scroll: tt.scroll, discover: tt.discover, plans: tt.plans, saved: tt.saved, profile: tt.profile };
  el("railNav").innerHTML = NAV.map(function (n) {
    return '<button type="button" data-screen="' + n.id + '"' + (screen === n.id ? ' aria-current="page"' : "") +
      ' class="' + (screen === n.id ? "active" : "") + '">' + I[n.icon] + esc(labels[n.id]) + "</button>";
  }).join("");
  el("bottomNav").innerHTML = '<div class="grid">' + NAV.map(function (n) {
    return '<button type="button" data-screen="' + n.id + '"' + (screen === n.id ? ' aria-current="page"' : "") +
      ' class="' + (screen === n.id ? "active" : "") + '">' + I[n.icon] + esc(labels[n.id]) + "</button>";
  }).join("") + "</div>";
  [el("railNav"), el("bottomNav")].forEach(function (nav) {
    nav.querySelectorAll("[data-screen]").forEach(function (b) {
      b.addEventListener("click", function () { setScreen(b.getAttribute("data-screen")); });
    });
  });
  renderRailChapters();
  renderRightRail();
}
function renderRailChapters() {
  var tt = t();
  var meta = TEXT_META[textKey];
  el("railHead").textContent = (state.lang === "hi" ? meta.nameHi : meta.name) + " · " + tt.chapters;
  el("railList").innerHTML = TEXTS[textKey].sections.slice(0, 18).map(function (s, i) {
    return '<li><button type="button" data-sec="' + i + '">' + esc(state.lang === "hi" ? s.nameHi : s.name) + "</button></li>";
  }).join("");
  el("railList").querySelectorAll("[data-sec]").forEach(function (b) {
    b.addEventListener("click", function () {
      var s = TEXTS[textKey].sections[Number(b.getAttribute("data-sec"))];
      var v = TEXTS[textKey].verses[s.startIndex];
      if (v) jumpToVerse(v);
    });
  });
}
function renderRightRail() {
  var rail = el("rightRail");
  if (screen !== "scroll") { rail.innerHTML = ""; rail.style.display = "none"; return; }
  rail.style.display = "";
  var tt = t();
  var vod = verseOfTheDay();
  var s = streakInfo();
  var statsLine = state.lang === "hi"
    ? s.totalVerses + " श्लोक पढ़े · " + s.totalDays + " दिन पढ़ा"
    : s.totalVerses + " " + (s.totalVerses === 1 ? "verse" : "verses") + " read · " + s.totalDays + " " + (s.totalDays === 1 ? "day" : "days") + " read";
  var html = '<section class="railcard"><p class="kicker">' + esc(tt.verseOfDay) + '</p>' +
    '<p class="vodsa font-deva">' + esc(vod.sa) + '</p>' +
    '<button type="button" class="readnow" id="railVod">' + esc(vod.ref) + " · " + esc(tt.readNow) + " →</button></section>";
  html += '<section class="railcard"><p class="streakbig">' + I.flame + s.current + " <span>" + esc(tt.dayStreak) + '</span></p>' +
    '<p class="dimline">' + esc(statsLine) + "</p></section>";
  if (!isPro()) {
    html += '<section class="railcard pro"><p class="protitle">' + I.sparkle + ' ScrollVerse Pro</p>' +
      '<p class="dimline">' + esc(tt.proFeatures[0]) + '</p>' +
      '<button type="button" class="probtn2" id="railPro">' + esc(tt.goPro) + " · " + formatPrice(PLAN_PRICES.monthly[currency]) + esc(tt.perMonth) + "</button></section>";
  }
  rail.innerHTML = html;
  var vb = el("railVod");
  if (vb) vb.addEventListener("click", function () { jumpToVerse(vod); });
  var pb = el("railPro");
  if (pb) pb.addEventListener("click", openPaywall);
}

/* ---------- Navigation ---------- */
function setScreen(s) {
  screen = s;
  el("feedView").classList.toggle("hidden", s !== "scroll");
  el("panelView").classList.toggle("hidden", s === "scroll");
  renderNavs();
  renderHeader();
  if (s === "discover") renderDiscover();
  if (s === "plans") renderPlans();
  if (s === "saved") renderSaved();
  if (s === "profile") renderProfile();
}
function selectText(k) {
  textKey = k;
  spec = null;
  screen = "scroll";
  el("feedView").classList.remove("hidden");
  el("panelView").classList.add("hidden");
  startFeed(TEXTS[k].verses, positionFor(k));
  renderAllChrome();
}
function setScreenSilent(s) { screen = s; }
function positionFor(k) {
  // The saved position is the index of the last verse the reader saw;
  // resuming means opening on the NEXT verse (saved + 1), clamped to
  // the end of the text. No saved position means the reader has not
  // started this text, so it opens at the first verse.
  var pos = state.positions[k];
  if (!pos) return 0;
  var last = TEXTS[k].verses.length - 1;
  return Math.min((pos.verseIndex || 0) + 1, Math.max(0, last));
}
function jumpToVerse(v) {
  textKey = v.textKey;
  spec = null;
  closeSheets();
  setScreenSilent("scroll");
  el("feedView").classList.remove("hidden");
  el("panelView").classList.add("hidden");
  screen = "scroll";
  startFeed(TEXTS[v.textKey].verses, TEXTS[v.textKey].verses.indexOf(v));
  renderAllChrome();
}
function openSpec(s) {
  spec = s;
  setScreenSilent("scroll");
  el("feedView").classList.remove("hidden");
  el("panelView").classList.add("hidden");
  screen = "scroll";
  var list = s.keys.map(function (k) { return VERSE_BY_KEY[k]; }).filter(Boolean);
  startFeed(list, 0);
  renderAllChrome();
}
function closeSpec() {
  spec = null;
  startFeed(TEXTS[textKey].verses, positionFor(textKey));
  renderAllChrome();
}
function renderAllChrome() { renderHeader(); renderNavs(); renderSpecBar(); }

/* ---------- Feed (Feed.tsx + VerseCard) ---------- */
var WINDOW = 2;
function currentFeedList() { return feedList; }
function startFeed(list, initialIndex) {
  feedList = list;
  activeIdx = Math.max(0, Math.min(initialIndex || 0, list.length - 1));
  renderFeed();
  var feed = el("feed");
  requestAnimationFrame(function () {
    feed.scrollTo({ top: activeIdx * feed.clientHeight, behavior: "instant" });
  });
  updateFeedChrome();
  var first = feedList[activeIdx];
  if (first) handleVisible(first);
}
function renderFeed() {
  var feed = el("feed");
  feed.setAttribute("aria-label", spec ? (state.lang === "hi" ? spec.titleHi : spec.titleEn) : textKey);
  feed.innerHTML = feedList.map(function (v, i) {
    return '<div class="feed-card" data-index="' + i + '">' +
      (Math.abs(i - activeIdx) <= WINDOW ? verseCardHtml(v) : "") + "</div>";
  }).join("");
  wireCards(feed);
  observeCards(feed);
}
function wireCards(feed) {
  feed.querySelectorAll(".verse").forEach(function (card) {
    if (card.dataset.wired) return;
    card.dataset.wired = "1";
    var key = card.getAttribute("data-key");
    var verse = VERSE_BY_KEY[key];
    if (!verse) return;
    var tap = card.querySelector(".verse-tap");
    tap.addEventListener("click", function () { openStudy(verse); });
    tap.addEventListener("keydown", function (e) {
      if (e.key === "Enter" || e.key === " ") { e.preventDefault(); openStudy(verse); }
    });
    card.querySelectorAll("[data-act]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var act = btn.getAttribute("data-act");
        if (act === "like") { toggleIn("likes", verse.key); refreshCardActions(card, verse); }
        if (act === "save") { toggleIn("saves", verse.key); refreshCardActions(card, verse); }
        if (act === "share") shareVerse(verse, btn);
        if (act === "study") openStudy(verse);
        if (act === "listen") openAudio(feedList, feedList.indexOf(verse));
      });
    });
  });
}
function refreshCardActions(card, verse) {
  var tt = t();
  var liked = state.likes.indexOf(verse.key) !== -1;
  var saved = state.saves.indexOf(verse.key) !== -1;
  var likeBtn = card.querySelector('[data-act="like"]');
  var saveBtn = card.querySelector('[data-act="save"]');
  likeBtn.setAttribute("aria-pressed", liked ? "true" : "false");
  likeBtn.innerHTML = liked ? '<span class="on">' + I.heartFilled + "</span>" : I.heart;
  saveBtn.setAttribute("aria-pressed", saved ? "true" : "false");
  saveBtn.innerHTML = saved ? '<span class="on">' + I.bookmarkFilled + "</span>" : I.bookmark;
  likeBtn.setAttribute("aria-label", tt.like + ", " + verse.ref);
  saveBtn.setAttribute("aria-label", tt.save + ", " + verse.ref);
}
var feedObserver = null;
function observeCards(feed) {
  if (feedObserver) feedObserver.disconnect();
  feedObserver = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (!e.isIntersecting) return;
      var idx = Number(e.target.getAttribute("data-index"));
      if (isNaN(idx)) return;
      if (idx !== activeIdx) {
        activeIdx = idx;
        renderFeedWindow();
        updateFeedChrome();
      }
      var v = feedList[idx];
      if (v) handleVisible(v);
    });
  }, { root: feed, threshold: 0.55 });
  feed.querySelectorAll("[data-index]").forEach(function (c) { feedObserver.observe(c); });
}
function renderFeedWindow() {
  var feed = el("feed");
  feed.querySelectorAll("[data-index]").forEach(function (wrap) {
    var idx = Number(wrap.getAttribute("data-index"));
    var has = !!wrap.querySelector(".verse");
    var want = Math.abs(idx - activeIdx) <= WINDOW;
    if (want && !has) { wrap.innerHTML = verseCardHtml(feedList[idx]); wireCards(wrap.parentElement); }
    if (!want && has) { wrap.innerHTML = ""; }
  });
}
function updateFeedChrome() {
  var pct = feedList.length ? ((activeIdx + 1) / feedList.length) * 100 : 0;
  el("progressFill").style.width = pct + "%";
  el("feedCounter").textContent = feedList.length ? (activeIdx + 1) + " / " + feedList.length : "";
}
function handleVisible(verse) {
  if (lastRecordedKey[verse.textKey] === verse.key) return;
  lastRecordedKey[verse.textKey] = verse.key;
  recordRead(verse);
}
function verseCardHtml(verse) {
  var tt = t();
  var liked = state.likes.indexOf(verse.key) !== -1;
  var saved = state.saves.indexOf(verse.key) !== -1;
  var size = (1.55 * state.fontScale).toFixed(3);
  var html = '<article class="verse" data-key="' + esc(verse.key) + '" aria-label="' + esc(verse.ref) + '">' +
    '<div class="verse-inner">' +
    '<div class="verse-tap" role="button" tabindex="0" aria-label="' + esc(tt.tapToUnderstand) + ", " + esc(verse.ref) + '">' +
    '<p class="section' + (state.lang === "hi" ? "" : " tracked") + '">' + esc(state.lang === "hi" ? verse.sectionHi : verse.section) + "</p>" +
    (verse.speaker ? '<p class="speaker">' + esc(verse.speaker) + "</p>" : "") +
    '<p class="sa" style="font-size:' + size + 'rem">' + esc(verse.sa) + "</p>" +
    '<div class="meanings">' + meaningBlock("hi", verse) + meaningBlock("en", verse) + "</div>" +
    '<p class="tappill">' + I.book + esc(tt.tapToUnderstand) + "</p>" +
    "</div>" +
    '<p class="ref">' + esc(verse.ref) + "</p>" +
    '<div class="actionrow">' +
    '<button type="button" class="actionbtn" data-act="like" aria-label="' + esc(tt.like) + ", " + esc(verse.ref) + '" aria-pressed="' + liked + '">' + (liked ? '<span class="on">' + I.heartFilled + "</span>" : I.heart) + "</button>" +
    '<button type="button" class="actionbtn" data-act="save" aria-label="' + esc(tt.save) + ", " + esc(verse.ref) + '" aria-pressed="' + saved + '">' + (saved ? '<span class="on">' + I.bookmarkFilled + "</span>" : I.bookmark) + "</button>" +
    '<button type="button" class="actionbtn" data-act="share" aria-label="' + esc(tt.share) + ", " + esc(verse.ref) + '">' + I.share + "</button>" +
    '<button type="button" class="actionbtn solid-accent" data-act="study" aria-label="' + esc(tt.study) + ", " + esc(verse.ref) + '">' + I.book + "</button>" +
    '<button type="button" class="actionbtn solid-gold" data-act="listen" aria-label="' + esc(tt.listen) + ", " + esc(verse.ref) + '">' + I.headphones + "</button>" +
    "</div>" +
    '<p class="listencaption">' + esc(tt.listen) + " · " + esc(tt.modeChant) + "</p>" +
    "</div></article>";
  return html;
}
function meaningBlock(which, verse) {
  var tt = t();
  if (which === "hi") {
    if (!verse.hi) {
      if (verse.textKey === "ramayana" || verse.textKey === "mahabharata") {
        return '<div><p class="meaning-label">' + esc(tt.hindiMeaning) + '</p><p class="missing">' + esc(tt.loadingMeaning) + "</p></div>";
      }
      return "";
    }
    return '<div><p class="meaning-label">' + esc(tt.hindiMeaning) + '</p><p class="hi-text">' + esc(verse.hi) + "</p></div>";
  }
  if (!verse.en) {
    if (verse.textKey === "mahabharata") {
      return '<div><p class="meaning-label upper">' + esc(tt.englishMeaning) + '</p><p class="missing">' + esc(tt.loadingMeaning) + "</p></div>";
    }
    return "";
  }
  return '<div><p class="meaning-label upper">' + esc(tt.englishMeaning) + '</p><p class="en-text">' + esc(verse.en) + "</p></div>";
}
function renderSpecBar() {
  var bar = el("specBar");
  var tt = t();
  if (!spec) { bar.classList.add("hidden"); bar.innerHTML = ""; return; }
  bar.classList.remove("hidden");
  var done = spec.planId && spec.planDay && state.planDone[spec.planId + ":" + spec.planDay];
  bar.innerHTML = '<p class="title">' + (spec.planId ? esc(tt.planLabel) + " · " : "") + esc(state.lang === "hi" ? spec.titleHi : spec.titleEn) + "</p>" +
    (spec.planId && spec.planDay && !done
      ? '<button type="button" class="donebtn" id="specDone">' + I.check + esc(tt.markDayDone) + "</button>"
      : spec.planId && spec.planDay && done
        ? '<span class="donetag">' + I.check + esc(tt.dayDone) + "</span>"
        : "") +
    '<button type="button" class="closebtn" id="specClose" aria-label="' + esc(tt.backToText) + '">' + I.x + "</button>";
  var db = el("specDone");
  if (db) db.addEventListener("click", function () {
    state.planDone[spec.planId + ":" + spec.planDay] = true;
    saveState();
    renderSpecBar();
  });
  el("specClose").addEventListener("click", closeSpec);
}

/* ---------- Share card (the space's share.ts, canvas card) ---------- */
function shareVerse(verse, btn) {
  var tt = t();
  if (btn) btn.disabled = true;
  var translation = verse.hi || verse.en || "";
  drawShareCard(verse, translation).then(function (done) {
    if (btn) btn.disabled = false;
    if (done === "downloaded") showNotice(tt.copiedCard);
    else if (done === "failed") showNotice(tt.shareFailed);
  });
}
function drawShareCard(verse, translation) {
  return new Promise(function (resolve) {
    try {
      var W = 1080, H = 1350;
      var canvas = document.createElement("canvas");
      canvas.width = W; canvas.height = H;
      var ctx = canvas.getContext("2d");
      var dark = themeMode() !== "light";
      ctx.fillStyle = dark ? "#16110b" : "#faf5ea";
      ctx.fillRect(0, 0, W, H);
      ctx.strokeStyle = dark ? "#e8a33d" : "#b45309";
      ctx.lineWidth = 6;
      ctx.strokeRect(36, 36, W - 72, H - 72);
      ctx.textAlign = "center";
      ctx.fillStyle = dark ? "#e8a33d" : "#b45309";
      ctx.font = "600 34px Georgia, serif";
      ctx.fillText("॥ ॐ ॥", W / 2, 140);
      ctx.fillStyle = dark ? "#f3ead8" : "#1c1917";
      var y = wrapText(ctx, verse.sa, W / 2, 260, W - 220, 64, "42px 'Tiro Devanagari Serif', serif");
      if (translation) {
        ctx.fillStyle = dark ? "#a89880" : "#7a6f5f";
        y = wrapText(ctx, translation, W / 2, y + 70, W - 220, 46, "30px Georgia, serif");
      }
      ctx.fillStyle = dark ? "#e59a6d" : "#7c2d12";
      ctx.font = "600 32px Georgia, serif";
      ctx.fillText(verse.ref, W / 2, H - 150);
      ctx.fillStyle = dark ? "#a89880" : "#7a6f5f";
      ctx.font = "26px Georgia, serif";
      ctx.fillText("ScrollVerse", W / 2, H - 100);
      if (canvas.toBlob) {
        canvas.toBlob(function (blob) {
          if (!blob) { resolve("failed"); return; }
          var file = null;
          try { file = new File([blob], "sanatan-scroll.png", { type: "image/png" }); } catch (e) { /* older browser */ }
          if (file && navigator.canShare && navigator.canShare({ files: [file] })) {
            navigator.share({ files: [file] }).then(function () { resolve("shared"); }).catch(function () { resolve("shared"); });
            return;
          }
          var a = document.createElement("a");
          a.href = URL.createObjectURL(blob);
          a.download = "sanatan-scroll-" + verse.key.replace(/:/g, "-") + ".png";
          document.body.appendChild(a);
          a.click();
          a.remove();
          setTimeout(function () { URL.revokeObjectURL(a.href); }, 4000);
          resolve("downloaded");
        }, "image/png");
      } else resolve("failed");
    } catch (e) { resolve("failed"); }
  });
}
function wrapText(ctx, text, x, y, maxWidth, lineHeight, font) {
  ctx.font = font;
  var words = String(text).replace(/\n/g, " \n ").split(" ");
  var line = "", cy = y;
  function flush() { if (line.trim()) { ctx.fillText(line.trim(), x, cy); cy += lineHeight; } line = ""; }
  words.forEach(function (w) {
    if (w === "\n") { flush(); return; }
    var test = line ? line + " " + w : w;
    if (ctx.measureText(test).width > maxWidth && line) { flush(); line = w; }
    else line = test;
  });
  flush();
  return cy;
}

/* ---------- Discover (screens.tsx) ---------- */
function resultRowHtml(v) {
  var tr = state.lang === "hi" ? (v.hi || v.en) : v.en;
  return '<li><button type="button" class="resultrow" data-jump="' + esc(v.key) + '">' +
    '<span class="main"><span class="ref">' + esc(v.ref) + '</span>' +
    '<span class="sa">' + esc(v.sa) + "</span>" +
    (tr ? '<span class="tr">' + esc(tr) + "</span>" : "") + "</span>" + I.chevron + "</button></li>";
}
function wireJumps(root) {
  root.querySelectorAll("[data-jump]").forEach(function (b) {
    b.addEventListener("click", function () {
      var v = VERSE_BY_KEY[b.getAttribute("data-jump")];
      if (v) jumpToVerse(v);
    });
  });
}
function renderDiscover() {
  var tt = t();
  var panel = el("panelView");
  var vod = verseOfTheDay();
  var text = TEXTS[textKey];
  var collections = [
    { id: "chalisa-full", titleEn: "Hanuman Chalisa, full chant", titleHi: "हनुमान चालीसा, पूरा पाठ", subEn: "All 43 verses, chanted verse by verse", subHi: "सभी 43 पद, एक-एक करके पाठ", verses: TEXTS.chalisa.verses },
    { id: "gita-ch2", titleEn: "Gita Chapter 2, Sankhya Yoga", titleHi: "गीता अध्याय 2, सांख्य योग", subEn: "72 verses, Krishna's core teaching, to listen end to end", subHi: "72 श्लोक, कृष्ण की मुख्य शिक्षा, शुरू से अन्त तक सुनें", verses: TEXTS.gita.verses.slice(47, 47 + 72) },
    { id: "gita-ch12", titleEn: "Gita Chapter 12, Bhakti Yoga", titleHi: "गीता अध्याय 12, भक्ति योग", subEn: "20 verses on devotion, a gentle morning listen", subHi: "भक्ति पर 20 श्लोक, सुबह सुनने के लिए शान्त", verses: TEXTS.gita.verses.slice(TEXTS.gita.sections[11].startIndex, TEXTS.gita.sections[11].startIndex + TEXTS.gita.sections[11].count) }
  ];
  panel.innerHTML = '<div class="screen">' +
    '<section aria-label="' + esc(tt.verseOfDay) + '"><p class="kicker">' + esc(tt.verseOfDay) + "</p>" +
    '<button type="button" class="vodcard" id="vodCard"><p class="sa">' + esc(vod.sa) + "</p>" +
    (vod.en ? '<p class="en">' + esc(vod.en) + "</p>" : "") +
    '<p class="readnow">' + esc(vod.ref) + " · " + esc(tt.readNow) + " →</p></button></section>" +

    '<section class="sectionblock" aria-label="' + esc(tt.listenSectionTitle) + '"><h2>' + I.headphones + esc(tt.listenSectionTitle) + "</h2>" +
    '<p class="sub">' + esc(tt.listenSectionSub) + "</p>" +
    collections.map(function (c, i) {
      return '<div class="listenrow"><span class="badge">' + I.headphones + '</span><span class="main">' +
        '<span class="t">' + esc(state.lang === "hi" ? c.titleHi : c.titleEn) + "</span>" +
        '<span class="s">' + esc(state.lang === "hi" ? c.subHi : c.subEn) + "</span>" +
        '<span class="m">' + c.verses.length + " " + esc(tt.verses) + " · " + esc(tt.modeChant) + (!isPro() ? " · " + esc(tt.modeHindi) + " / " + esc(tt.modeEnglish) + ", Pro" : "") + "</span></span>" +
        '<button type="button" class="listenbtn" data-coll="' + i + '">' + esc(tt.listen) + "</button>" +
        (!isPro() ? '<button type="button" class="lockbtn" data-paywall="1" aria-label="' + esc(tt.unlockPro) + '">' + I.lock + "</button>" : "") +
        "</div>";
    }).join("") + "</section>" +

    '<section class="sectionblock" aria-label="' + esc(tt.howDoYouFeel) + '"><h2>' + esc(tt.howDoYouFeel) + '</h2><div class="moodrow">' +
    MOODS.map(function (m, i) {
      return '<button type="button" class="moodchip" data-mood="' + i + '">' + esc(state.lang === "hi" ? m.nameHi : m.nameEn) + "</button>";
    }).join("") + "</div></section>" +

    '<section class="sectionblock" aria-label="' + esc(tt.searchTitle) + '"><h2>' + esc(tt.searchTitle) + "</h2>" +
    '<label class="searchlabel">' + I.search + '<span class="sronly">' + esc(tt.searchTitle) + '</span>' +
    '<input type="search" id="searchBox" placeholder="' + esc(tt.searchPlaceholder) + '" aria-label="' + esc(tt.searchTitle) + '"></label>' +
    '<ul class="resultlist" id="searchResults"></ul></section>' +

    '<section class="sectionblock" aria-label="' + esc(tt.chapters) + '"><h2>' + esc(tt.chooseText) + '</h2><div class="textgrid">' +
    TEXT_ORDER.map(function (k) {
      var meta = TEXT_META[k];
      return '<button type="button" class="textcard' + (k === textKey ? " active" : "") + '" data-seltext="' + k + '" aria-pressed="' + (k === textKey) + '">' +
        '<span class="name">' + esc(state.lang === "hi" ? meta.nameHi : meta.name) + "</span>" +
        '<span class="tag">' + esc(state.lang === "hi" ? meta.taglineHi : meta.taglineEn) + " · " + TEXTS[k].verses.length + " " + esc(tt.verses) + "</span></button>";
    }).join("") + "</div></section>" +

    '<section class="sectionblock" aria-label="' + esc(tt.chapters) + '"><h2>' + esc(state.lang === "hi" ? TEXT_META[textKey].nameHi : TEXT_META[textKey].name) + " · " + esc(tt.chapters) + '</h2>' +
    '<ul class="dividerlist">' + text.sections.map(function (s) {
      var v = text.verses[s.startIndex];
      return '<li><button type="button" class="resultrow" data-jump="' + esc(v.key) + '"><span class="main">' +
        '<span class="name">' + esc(state.lang === "hi" ? s.nameHi : s.name) + "</span>" +
        ((s.summaryEn || s.summaryHi) ? '<span class="sum">' + esc(state.lang === "hi" ? (s.summaryHi || s.summaryEn) : s.summaryEn) + "</span>" : "") +
        '<span class="cnt">' + s.count + " " + esc(tt.verses) + "</span></span>" + I.chevron + "</button></li>";
    }).join("") + "</ul></section></div>";

  el("vodCard").addEventListener("click", function () { jumpToVerse(vod); });
  panel.querySelectorAll("[data-coll]").forEach(function (b) {
    b.addEventListener("click", function () {
      var c = collections[Number(b.getAttribute("data-coll"))];
      openAudio(c.verses, 0, c.verses);
    });
  });
  panel.querySelectorAll("[data-paywall]").forEach(function (b) {
    b.addEventListener("click", openPaywall);
  });
  panel.querySelectorAll("[data-mood]").forEach(function (b) {
    b.addEventListener("click", function () {
      var m = MOODS[Number(b.getAttribute("data-mood"))];
      openSpec({ titleEn: m.nameEn, titleHi: m.nameHi, keys: m.keys.filter(function (k) { return VERSE_BY_KEY[k]; }) });
    });
  });
  panel.querySelectorAll("[data-seltext]").forEach(function (b) {
    b.addEventListener("click", function () { selectText(b.getAttribute("data-seltext")); });
  });
  wireJumps(panel);
  var box = el("searchBox");
  box.addEventListener("input", function () {
    var results = searchVerses(box.value);
    var ul = el("searchResults");
    if (box.value.trim().length < 2) { ul.innerHTML = ""; return; }
    ul.innerHTML = results.length === 0
      ? '<li class="emptyline">' + esc(tt.noResults) + "</li>"
      : results.map(resultRowHtml).join("");
    wireJumps(ul);
  });
}

/* ---------- Plans (screens.tsx) ---------- */
function renderPlans() {
  var tt = t();
  var panel = el("panelView");
  if (!openPlanId && PLANS.length) openPlanId = PLANS[0].id;
  panel.innerHTML = '<div class="screen"><h2 class="sronly">' + esc(tt.plans) + "</h2>" +
    PLANS.map(function (plan) {
      var doneCount = plan.days.filter(function (d) { return state.planDone[plan.id + ":" + d.day]; }).length;
      var open = openPlanId === plan.id;
      var html = '<section class="plancard"><button type="button" class="planhead" data-plan="' + plan.id + '" aria-expanded="' + open + '">' +
        '<span class="row1"><span class="name">' + esc(state.lang === "hi" ? plan.nameHi : plan.nameEn) + '</span>' +
        '<span class="count">' + doneCount + "/" + plan.days.length + " " + (state.lang === "hi" ? "दिन" : "days") + "</span></span>" +
        '<span class="desc">' + esc(state.lang === "hi" ? plan.descHi : plan.descEn) + "</span>" +
        '<span class="track"><span style="width:' + (plan.days.length ? (doneCount / plan.days.length) * 100 : 0) + '%"></span></span></button>';
      if (open) {
        html += '<ul class="daylist">' + plan.days.map(function (d) {
          var isDone = !!state.planDone[plan.id + ":" + d.day];
          return '<li><button type="button" class="dayopen" data-day="' + plan.id + ":" + d.day + '">' +
            '<span class="daynum' + (isDone ? " done" : "") + '">' + (isDone ? I.check : d.day) + "</span>" +
            '<span class="daylabel">' + esc(state.lang === "hi" ? d.labelHi : d.labelEn) + "</span></button>" +
            (!isDone ? '<button type="button" class="markbtn" data-mark="' + plan.id + ":" + d.day + '">' + esc(state.lang === "hi" ? tt.markDoneShort : "Mark done") + "</button>" : "") +
            "</li>";
        }).join("") + "</ul>";
      }
      return html + "</section>";
    }).join("") + "</div>";
  panel.querySelectorAll("[data-plan]").forEach(function (b) {
    b.addEventListener("click", function () {
      var id = b.getAttribute("data-plan");
      openPlanId = openPlanId === id ? null : id;
      renderPlans();
    });
  });
  panel.querySelectorAll("[data-day]").forEach(function (b) {
    b.addEventListener("click", function () {
      var parts = b.getAttribute("data-day").split(":");
      var plan = PLANS.filter(function (p) { return p.id === parts[0]; })[0];
      var d = plan.days.filter(function (x) { return x.day === Number(parts[1]); })[0];
      var keys = TEXTS[d.textKey].verses.slice(d.startIndex, d.startIndex + d.count).map(function (v) { return v.key; });
      textKey = d.textKey;
      openSpec({
        titleEn: plan.nameEn + " · Day " + d.day, titleHi: plan.nameHi + " · दिन " + d.day,
        keys: keys, planId: plan.id, planDay: d.day
      });
    });
  });
  panel.querySelectorAll("[data-mark]").forEach(function (b) {
    b.addEventListener("click", function () {
      state.planDone[b.getAttribute("data-mark")] = true;
      saveState();
      renderPlans();
    });
  });
}

/* ---------- Saved (screens.tsx) ---------- */
function renderSaved() {
  var tt = t();
  var panel = el("panelView");
  var savedVerses = state.saves.map(function (k) { return VERSE_BY_KEY[k]; }).filter(Boolean);
  panel.innerHTML = '<div class="screen"><h2 class="sronly">' + esc(tt.saved) + "</h2>" +
    (savedVerses.length === 0
      ? '<p class="savedempty">' + esc(tt.savedEmpty) + "</p>"
      : '<ul class="dividerlist">' + savedVerses.map(function (v) {
          var tr = state.lang === "hi" ? (v.hi || v.en) : v.en;
          return '<li><div class="savedrow"><button type="button" class="main" data-jump="' + esc(v.key) + '">' +
            '<span class="ref">' + esc(v.ref) + '</span><span class="sa">' + esc(v.sa) + "</span>" +
            (tr ? '<span class="tr">' + esc(tr) + "</span>" : "") + "</button>" +
            '<button type="button" class="unsavebtn" data-unsave="' + esc(v.key) + '" aria-label="' + esc(tt.save) + ", " + esc(v.ref) + '" aria-pressed="true">' + I.bookmarkFilled + "</button></div></li>";
        }).join("") + "</ul>") + "</div>";
  wireJumps(panel);
  panel.querySelectorAll("[data-unsave]").forEach(function (b) {
    b.addEventListener("click", function () {
      toggleIn("saves", b.getAttribute("data-unsave"));
      renderSaved();
    });
  });
}

/* ---------- Profile (screens.tsx) ---------- */
function renderProfile() {
  var tt = t();
  var panel = el("panelView");
  var s = streakInfo();
  var pro = isPro();
  var googlePlan = pro && state.pro && state.pro.plan === "google";
  var proLine = pro
    ? googlePlan
      ? tt.proActive + " · " + tt.proViaGoogle
      : tt.proActive + (state.pro.expiresAt ? " · " + tt.proUntil + " " + new Date(state.pro.expiresAt).toLocaleDateString() : "")
    : tt.notProYet;
  var accountHtml = googleUser
    ? '<div class="row">' +
      (googleUser.picture
        ? '<img class="avatarimg" src="' + esc(googleUser.picture) + '" alt="" referrerpolicy="no-referrer">'
        : '<span class="avatar accent">' + esc(googleUser.name.charAt(0).toUpperCase()) + "</span>") +
      '<div class="who"><p class="n">' + esc(googleUser.name) + '</p><p class="s">' + esc(googleUser.email) + "</p></div>" +
      '<span class="statuspill on"><span class="dot"></span>' + esc(tt.signedInWithGoogle) + "</span></div>" +
      '<p class="note">' + esc(tt.googleTiedNote) + "</p>" +
      '<div class="signout"><button type="button" class="pillbtn2" id="signOutBtn">' + esc(tt.signOut) + "</button></div>"
    : '<div class="row">' +
      '<span class="avatar">' + I.user + '</span><div class="who"><p class="n">' + esc(tt.notSignedIn) + '</p><p class="s">' + esc(tt.previewReader) + "</p></div>" +
      '<span class="statuspill"><span class="dot"></span>' + esc(tt.notSignedIn) + "</span></div>" +
      '<div style="margin-top:16px">' + googleButtonHtml() + "</div>";
  var stats = [
    { label: tt.dayStreak, value: s.current, flame: true },
    { label: tt.versesRead, value: s.totalVerses },
    { label: tt.daysRead, value: s.totalDays },
    { label: tt.versesRead + " · " + tt.today, value: s.versesToday }
  ];
  panel.innerHTML = '<div class="screen"><h2 class="title">' + esc(tt.yourJourney) + '</h2>' +
    '<div class="statgrid">' + stats.map(function (st) {
      return '<div class="statcard"><p class="v">' + (st.flame ? I.flame : "") + st.value + '</p><p class="l">' + esc(st.label) + "</p></div>";
    }).join("") + "</div>" +

    '<section class="profilecard" aria-label="' + esc(tt.account) + '">' + accountHtml + "</section>" +

    '<section class="profilecard" aria-label="' + esc(tt.managePro) + '"><div class="row">' +
    '<span class="avatar gold">' + I.sparkle + '</span><div class="who"><p class="n">ScrollVerse Pro</p><p class="s">' + esc(proLine) + "</p></div>" +
    (googlePlan
      ? ""
      : pro
        ? '<button type="button" class="pillbtn2" id="cancelPro">' + esc(tt.cancelPro) + "</button>"
        : '<button type="button" class="pillbtn2 accent" id="goProBtn">' + esc(tt.goPro) + "</button>") +
    "</div></section>" +

    '<section class="profilecard"><div class="fontrow"><p class="lab">' + esc(tt.textSize) + '</p>' +
    '<div class="fontbtns"><button type="button" id="fontDown" aria-label="' + esc(tt.textSize) + ' −">' + esc(tt.fontSmall) + '</button>' +
    '<button type="button" id="fontUp" aria-label="' + esc(tt.textSize) + ' +">' + esc(tt.fontBig) + "</button></div></div>" +
    '<div class="langrow"><p class="lab">' + esc(tt.language) + '</p><div class="segmented" role="group" aria-label="' + esc(tt.language) + '">' +
    ["en", "hi"].map(function (l) {
      return '<button type="button" data-plang="' + l + '" aria-pressed="' + (state.lang === l) + '" class="' + (state.lang === l ? "active" : "") + '">' + (l === "en" ? "English" : "हिन्दी") + "</button>";
    }).join("") + "</div></div></section>" +

    '<section class="profilecard" aria-label="' + esc(tt.about) + '"><p class="n" style="font-weight:600">' + esc(tt.about) + '</p>' +
    '<p class="aboutbody">' + esc(tt.aboutBody) + "</p></section>" +

    '<section class="profilecard legalcard" aria-label="' + esc(tt.legal) + '"><ul class="legallist">' +
    [["/privacy-policy", tt.privacyPolicy], ["/terms", tt.termsConditions], ["/refund-policy", tt.refundPolicy]].map(function (r) {
      return '<li><a href="' + r[0] + '">' + esc(r[1]) + '<span class="chev" aria-hidden="true">›</span></a></li>';
    }).join("") + "</ul></section></div>";

  wireGoogleButtons(panel);
  var so = el("signOutBtn");
  if (so) so.addEventListener("click", signOutGoogle);
  var gp = el("goProBtn");
  if (gp) gp.addEventListener("click", openPaywall);
  var cp = el("cancelPro");
  if (cp) cp.addEventListener("click", function () {
    state.pro = null;
    saveState();
    renderProfile();
    renderAllChrome();
  });
  el("fontDown").addEventListener("click", function () {
    state.fontScale = Math.max(0.9, Math.round((state.fontScale - 0.05) * 100) / 100);
    saveState();
    renderFeed();
  });
  el("fontUp").addEventListener("click", function () {
    state.fontScale = Math.min(1.3, Math.round((state.fontScale + 0.05) * 100) / 100);
    saveState();
    renderFeed();
  });
  panel.querySelectorAll("[data-plang]").forEach(function (b) {
    b.addEventListener("click", function () { setLanguage(b.getAttribute("data-plang")); });
  });
}
function setLanguage(l) {
  state.lang = l;
  saveState();
  renderAllChrome();
  renderFeed();
  setScreen(screen);
}

/* ---------- Study sheet (StudySheet.tsx) ---------- */
var studyVerse = null;
var studyTab = "explain";
function relatedCandidates(verse) {
  var all = TEXTS[verse.textKey].verses;
  var self = all.indexOf(verse);
  var picked = [], seen = {};
  seen[verse.key] = true;
  function push(v) { if (v && !seen[v.key] && picked.length < 36) { seen[v.key] = true; picked.push(v); } }
  for (var d = 2; d <= 14; d += 2) { push(all[self - d]); push(all[self + d]); }
  for (var i = 0; i < all.length && picked.length < 36; i += Math.max(1, Math.floor(all.length / 14))) push(all[i]);
  return picked;
}
function explainText(verse) {
  var base = state.lang === "hi" ? (verse.hi || verse.en) : (verse.en || verse.hi);
  if (base) return base;
  if (state.lang === "hi") return "इस श्लोक का अर्थ अभी इस पृष्ठ पर उपलब्ध नहीं है। संस्कृत को धीरे-धीरे, एक-एक पंक्ति पढ़िए और जो यह कह रहा है उस पर ठहरिए। गहन अध्ययन में इसका प्रसंग दिया गया है।";
  return "Read the Sanskrit slowly, one line at a time, and sit with what it points to. The bundled meaning for this verse is not on this page yet, Deep Study below gives the context the verse sits in.";
}
function deepContent(verse) {
  var section = state.lang === "hi" ? verse.sectionHi : verse.section;
  var meaning = state.lang === "hi" ? (verse.hi || verse.en || "") : (verse.en || verse.hi || "");
  var context, apply;
  if (state.lang === "hi") {
    context = "यह श्लोक " + section + " में आता है। इसे अकेला न पढ़कर उसी क्रम में पढ़िए जिसमें यह ग्रन्थ में रखा है, पिछले श्लोकों की बात को यह आगे बढ़ाता है।";
    apply = "आज इस एक श्लोक को अपने काम में उतारिए, जब भी मन भटके, इसकी एक पंक्ति याद करके फिर से वही काम शुरू कीजिए जो सामने है।";
  } else {
    context = "This verse sits in " + section + ". Read it in the order the text places it, it carries forward what the verses just before it set up, and it prepares the ground for what follows.";
    apply = "Take this one verse into the day. When the mind scatters, recall its line and return to the work in front of you, that is the practice this teaching points to.";
  }
  return { meaning: meaning, context: context, apply: apply };
}
function lockedPanelHtml() {
  var tt = t();
  return '<div class="lockedpanel"><span class="badge">' + I.lock + '</span>' +
    '<p class="t">' + esc(tt.lockedPro) + '</p><p class="s">' + esc(tt.notProYet) + "</p>" +
    '<button type="button" class="unlock" data-unlock="1">' + esc(tt.unlockPro) + "</button></div>";
}
function openStudy(verse) {
  studyVerse = verse;
  studyTab = "explain";
  renderStudy();
}
function renderStudy() {
  var verse = studyVerse;
  if (!verse) return;
  var tt = t();
  var slot = el("sheetSlot");
  var hasWords = (verse.words && verse.words.length) || verse.textKey === "gita";
  var tabs = [
    { id: "explain", label: tt.explain, show: true },
    { id: "deep", label: tt.deepStudy, pro: true, show: true },
    { id: "words", label: tt.wordByWord, show: !!hasWords },
    { id: "related", label: tt.related, pro: true, show: true }
  ];
  var body = "";
  if (studyTab === "explain") {
    body = '<p class="explain-text">' + esc(explainText(verse)) + "</p>" +
      '<div class="applybox"><p class="lab">' + esc(tt.exampleLabel) + '</p><p class="txt">' + esc(deepContent(verse).apply) + "</p></div>" +
      '<p class="ainote">' + esc(tt.aiNote) + "</p>";
  } else if (studyTab === "deep") {
    if (!isPro()) body = lockedPanelHtml();
    else {
      var dc = deepContent(verse);
      body = '<div><section class="studysec"><h3>' + esc(tt.meaning) + '</h3><p>' + esc(dc.meaning || tt.loadingMeaning) + "</p></section>" +
        '<section class="studysec"><h3>' + esc(tt.commentary) + '</h3><p>' + esc(dc.context) + "</p></section>" +
        '<section class="studysec"><h3>' + esc(tt.applyToday) + '</h3><p>' + esc(dc.apply) + "</p></section>" +
        '<p class="ainote">' + esc(tt.aiNote) + "</p></div>";
    }
  } else if (studyTab === "words") {
    var wordsHtml = "";
    if (verse.words && verse.words.length) {
      wordsHtml = '<dl class="wordlist">' + verse.words.map(function (w) {
        return '<div class="wrow"><dt>' + esc(w.w) + "</dt><dd>" + esc(w.m) + "</dd></div>";
      }).join("") + "</dl>";
    }
    body = '<div>' + wordsHtml + '<div id="commSlot"></div>' +
      (verse.textKey === "gita" && verse.en ? '<p class="smallnote">' + esc(tt.translationBy) + "</p>" : "") + "</div>";
  } else if (studyTab === "related") {
    if (!isPro()) body = lockedPanelHtml();
    else {
      var rel = relatedCandidates(verse);
      body = '<ul class="resultlist">' + rel.slice(0, 8).map(function (v) {
        return '<li><button type="button" class="resultrow" data-rel="' + esc(v.key) + '"><span class="main">' +
          '<span class="ref">' + esc(v.ref) + '</span>' +
          '<span class="tr">' + esc(state.lang === "hi" ? verse.sectionHi : verse.section) + '</span>' +
          '<span class="sa">' + esc(v.sa) + "</span></span>" + I.chevron + "</button></li>";
      }).join("") + "</ul>" + '<p class="ainote">' + esc(tt.aiNote) + "</p>";
    }
  }
  slot.innerHTML = '<div class="sheetback" role="dialog" aria-modal="true" aria-label="' + esc(tt.study) + ", " + esc(verse.ref) + '">' +
    '<div class="scrim" data-close="1"></div>' +
    '<div class="sheet"><div class="sheet-head"><div class="row"><div>' +
    '<p class="ref">' + esc(verse.ref) + '</p><p class="sa">' + esc(verse.sa) + "</p></div>" +
    '<button type="button" class="sheet-x" data-close="1" aria-label="' + esc(tt.close) + '">' + I.x + "</button></div>" +
    '<div class="tabrow no-scrollbar" role="tablist" aria-label="' + esc(tt.study) + '">' +
    tabs.filter(function (x) { return x.show; }).map(function (x) {
      return '<button type="button" role="tab" aria-selected="' + (studyTab === x.id) + '" class="tabpill' + (studyTab === x.id ? " active" : "") + '" data-tab="' + x.id + '">' +
        esc(x.label) + (x.pro && !isPro() ? I.lock : "") + "</button>";
    }).join("") + "</div></div>" +
    '<div class="sheet-body rail-scroll">' + body + "</div></div></div>";
  slot.querySelectorAll("[data-close]").forEach(function (b) {
    b.addEventListener("click", closeSheets);
  });
  slot.querySelectorAll("[data-tab]").forEach(function (b) {
    b.addEventListener("click", function () { studyTab = b.getAttribute("data-tab"); renderStudy(); });
  });
  slot.querySelectorAll("[data-unlock]").forEach(function (b) {
    b.addEventListener("click", openPaywall);
  });
  slot.querySelectorAll("[data-rel]").forEach(function (b) {
    b.addEventListener("click", function () {
      var v = VERSE_BY_KEY[b.getAttribute("data-rel")];
      if (v) jumpToVerse(v);
    });
  });
  if (studyTab === "words" && verse.textKey === "gita") {
    loadCommentary(verse.refShort, function (text) {
      var cs = el("commSlot");
      if (!cs || !text) return;
      cs.innerHTML = '<section class="studysec" style="margin-top:20px"><h3>' + esc(tt.commentary) + " · " + esc(tt.commentaryBy) + '</h3><p style="font-size:15.2px;color:color-mix(in srgb, var(--text) 90%, transparent)">' + esc(text) + "</p></section>";
    });
  }
}

/* ---------- Audio sheet (AudioSheet.tsx + lib/audio.ts) ---------- */
var AUDIO_MODES = ["chant", "hindi", "english", "chant-hindi", "chant-english"];
var SPEEDS = [0.8, 1, 1.2, 1.5];
var audio = null;
function modeIsPro(m) { return m !== "chant"; }
function audioFileFor(verse, lang) {
  if (verse.textKey !== "gita" || !verse.c) return null;
  var name = "gita-" + verse.c + "-" + verse.v + "-" + lang;
  return AUDIO_SET[name] ? "audio/gita/" + name + ".mp3" : null;
}
function hasServerAudio(verse) { return !!audioFileFor(verse, "sanskrit"); }
function openAudio(verses, index) {
  stopAudioEngine();
  audio = {
    verses: verses, idx: index, mode: "chant", speed: 1.2, continuous: false,
    status: "idle", errorKind: null, queue: [], qstep: 0, el: null, usingTts: false,
    engine: new Audio()
  };
  audio.el = audio.engine;
  audio.engine.addEventListener("ended", onStepEnded);
  audio.engine.addEventListener("error", function () {
    if (audio && audio.usingFile && audio.status !== "idle") { audio.status = "error"; audio.errorKind = "failed"; renderAudio(); }
  });
  renderAudio();
}
function audioVerse() { return audio.verses[audio.idx] || audio.verses[0]; }
function modeLabel(m) {
  var tt = t();
  return { chant: tt.modeChant, hindi: tt.modeHindi, english: tt.modeEnglish, "chant-hindi": tt.modeChantHindi, "chant-english": tt.modeChantEnglish }[m];
}
function closeAudio() { stopAudioEngine(); audio = null; el("sheetSlot").innerHTML = ""; }
function renderAudio() {
  var tt = t();
  var slot = el("sheetSlot");
  var verse = audioVerse();
  var pro = isPro();
  var lockedMode = modeIsPro(audio.mode) && !pro;
  var lockedContinuous = audio.continuous && !pro;
  var supported = ("speechSynthesis" in window) || hasServerAudio(verse);
  var isPlaying = audio.status === "playing";
  var isLoading = audio.status === "loading";
  var statusLine = isPlaying ? tt.nowPlaying + " · " + modeLabel(audio.mode)
    : isLoading ? tt.audioLoading
    : audio.status === "paused" ? tt.pause
    : tt.playVerse;
  var body = "";
  if (!supported) {
    body = '<p class="unsupported">' + esc(tt.audioUnsupported) + "</p>";
  } else if (lockedMode || lockedContinuous) {
    body = '<div class="lockedpanel"><span class="badge">' + I.lock + '</span>' +
      '<p class="t">' + esc(tt.audioLockedTitle) + '</p><p class="s">' + esc(tt.audioLockedBody) + "</p>" +
      '<button type="button" class="unlock" data-unlock="1">' + esc(tt.unlockPro) + "</button>" +
      '<button type="button" data-freechant="1" style="margin-top:8px;min-height:40px;padding:8px 16px;font-size:14px;font-weight:500;color:var(--accent)">' + esc(tt.modeChant) + " · " + esc(tt.freeWord) + "</button></div>";
  } else {
    var server = hasServerAudio(verse);
    body = "<div>" +
      '<div class="modegroup"><p class="grouplabel">' + esc(tt.listen) + '</p><div class="pills" role="group" aria-label="' + esc(tt.listen) + '">' +
      AUDIO_MODES.map(function (m) {
        return '<button type="button" class="modepill' + (audio.mode === m ? " active" : "") + '" data-mode="' + m + '" aria-pressed="' + (audio.mode === m) + '">' +
          esc(modeLabel(m)) + (modeIsPro(m) && !pro ? I.lock : "") + "</button>";
      }).join("") + "</div></div>" +
      '<div class="modegroup"><p class="grouplabel">' + esc(tt.speed) + '</p><div class="pills" role="group" aria-label="' + esc(tt.speed) + '">' +
      SPEEDS.map(function (s) {
        return '<button type="button" class="modepill' + (audio.speed === s ? " active" : "") + '" data-speed="' + s + '" aria-pressed="' + (audio.speed === s) + '">' +
          esc(s === 0.8 ? tt.slow : s === 1 ? tt.normalSpeed : "1.2×") + "</button>";
      }).join("") + "</div></div>" +
      '<div class="transport">' +
      '<button type="button" class="side" data-prev="1" aria-label="' + esc(tt.prevVerse) + '"' + (audio.idx <= 0 ? " disabled" : "") + ">" + I.skipBack + "</button>" +
      '<button type="button" class="play" data-play="1" aria-label="' + esc(isPlaying ? tt.pause : audio.status === "paused" ? tt.resume : tt.playVerse) + '"' + (isLoading ? " disabled" : "") + ">" +
      (isLoading ? '<span class="spinner"></span>' : isPlaying ? I.pause : I.play) + "</button>" +
      '<button type="button" class="side" data-next="1" aria-label="' + esc(tt.nextVerse) + '"' + (audio.idx >= audio.verses.length - 1 ? " disabled" : "") + ">" + I.skipForward + "</button>" +
      '<button type="button" class="side" data-stop="1" aria-label="' + esc(tt.stop) + '">' + I.stop + "</button></div>" +
      '<p class="playstatus" role="status">' + esc(statusLine) + "</p>" +
      (audio.status === "error" ? '<div class="audioerror" role="alert"><p>' + esc(audioErrorText()) + '</p><button type="button" data-retry="1">' + esc(tt.audioRetry) + "</button></div>" : "") +
      '<button type="button" class="playallbtn" data-playall="1">' + I.play + esc(tt.playAll) + " · " + audio.verses.length + " " + esc(tt.verseWord) + (pro ? "" : I.lock) + "</button>" +
      '<label class="contlabel"><input type="checkbox" data-cont="1"' + (audio.continuous && pro ? " checked" : "") + (pro ? "" : " disabled") + ">" + esc(tt.keepGoing) + (pro ? "" : I.lock) + "</label>" +
      '<div class="voicecard"><p class="lab">' + esc(tt.voiceLabel) + "</p>" +
      (server
        ? '<p class="t">' + esc(tt.voiceServerTitle) + '</p><p class="s">' + esc(tt.voiceServerDetail) + "</p>"
        : '<p class="t">' + esc(tt.voiceDeepMale) + '</p><p class="s">' + esc(deviceVoiceLine()) + "</p>") +
      "</div>" +
      '<p class="audionote">' + esc(server ? tt.audioNoteServer : tt.audioNote) + "</p>" +
      (!pro ? '<p class="audionote">' + esc(tt.audioFreeNote) + "</p>" : "") +
      "</div>";
  }
  slot.innerHTML = '<div class="sheetback" role="dialog" aria-modal="true" aria-label="' + esc(tt.listenTitle) + ", " + esc(verse.ref) + '">' +
    '<div class="scrim" data-aclose="1"></div>' +
    '<div class="sheet tall"><div class="sheet-head"><div class="row"><div class="who">' +
    '<span class="badge">' + I.headphones + '</span><div><p class="ref">' + esc(verse.ref) + '</p>' +
    '<p class="sub">' + (isPlaying ? esc(tt.nowPlaying) + " · " : "") + (audio.idx + 1) + " / " + audio.verses.length + "</p></div></div>" +
    '<button type="button" class="sheet-x" data-aclose="1" aria-label="' + esc(tt.close) + '">' + I.x + "</button></div>" +
    '<p class="sa center3">' + esc(verse.sa) + "</p></div>" +
    '<div class="sheet-body rail-scroll">' + body + "</div></div></div>";
  slot.querySelectorAll("[data-aclose]").forEach(function (b) { b.addEventListener("click", closeAudio); });
  slot.querySelectorAll("[data-mode]").forEach(function (b) {
    b.addEventListener("click", function () { stopAudioEngine(); audio.mode = b.getAttribute("data-mode"); audio.status = "idle"; renderAudio(); });
  });
  slot.querySelectorAll("[data-speed]").forEach(function (b) {
    b.addEventListener("click", function () {
      audio.speed = Number(b.getAttribute("data-speed"));
      if (audio.el && audio.usingFile) audio.el.playbackRate = audio.speed;
      renderAudio();
    });
  });
  var playBtn = slot.querySelector("[data-play]");
  if (playBtn) playBtn.addEventListener("click", togglePlay);
  var prev = slot.querySelector("[data-prev]");
  if (prev) prev.addEventListener("click", function () { stepVerseAudio(-1); });
  var next = slot.querySelector("[data-next]");
  if (next) next.addEventListener("click", function () { stepVerseAudio(1); });
  var stop = slot.querySelector("[data-stop]");
  if (stop) stop.addEventListener("click", function () { stopAudioEngine(); audio.status = "idle"; renderAudio(); });
  var retry = slot.querySelector("[data-retry]");
  if (retry) retry.addEventListener("click", function () { audio.status = "idle"; audio.errorKind = null; renderAudio(); playAudio(); });
  var pa = slot.querySelector("[data-playall]");
  if (pa) pa.addEventListener("click", function () {
    if (!isPro()) { openPaywall(); return; }
    audio.continuous = true;
    audio.idx = 0;
    renderAudio();
    playAudio();
  });
  var cont = slot.querySelector("[data-cont]");
  if (cont) cont.addEventListener("change", function () { audio.continuous = cont.checked; });
  slot.querySelectorAll("[data-unlock]").forEach(function (b) { b.addEventListener("click", openPaywall); });
  var fc = slot.querySelector("[data-freechant]");
  if (fc) fc.addEventListener("click", function () { audio.mode = "chant"; audio.continuous = false; audio.status = "idle"; renderAudio(); });
}
function audioErrorText() {
  var tt = t();
  if (audio.errorKind === "nohindi") return tt.audioErrorNoHindiVoice;
  if (audio.errorKind === "silent") return tt.audioErrorSilent;
  return tt.audioErrorFailed;
}
function deviceVoiceLine() {
  var tt = t();
  try {
    var voices = window.speechSynthesis ? window.speechSynthesis.getVoices() : [];
    var want = audio.mode === "english" ? "en" : "hi";
    var v = pickVoice(want, voices);
    return v ? v.name + " · " + tt.voiceOnDevice : tt.voiceOnDevice;
  } catch (e) { return tt.voiceOnDevice; }
}
function pickVoice(langPrefix, voices) {
  var matches = voices.filter(function (v) { return (v.lang || "").toLowerCase().indexOf(langPrefix) === 0; });
  if (!matches.length) return null;
  var male = matches.filter(function (v) { return /male|david|daniel|george|ravi|hemant|ryan|guy|christopher/i.test(v.name) && !/female/i.test(v.name); });
  return male[0] || matches[0];
}
function stepVerseAudio(dir) {
  var n = audio.idx + dir;
  if (n < 0 || n >= audio.verses.length) return;
  stopAudioEngine();
  audio.idx = n;
  audio.status = "idle";
  renderAudio();
}
function cleanForSpeech(s) {
  return String(s || "").replace(/[|।॥]/g, " ").replace(/\s+/g, " ").trim();
}
function buildQueue() {
  var verse = audioVerse();
  var langs = audio.mode === "chant" ? ["sanskrit"]
    : audio.mode === "hindi" ? ["hindi"]
    : audio.mode === "english" ? ["english"]
    : audio.mode === "chant-hindi" ? ["sanskrit", "hindi"] : ["sanskrit", "english"];
  var q = [];
  langs.forEach(function (lang) {
    var file = audioFileFor(verse, lang);
    if (file) { q.push({ type: "file", src: file }); return; }
    var text = lang === "sanskrit" ? cleanForSpeech(verse.sa)
      : lang === "hindi" ? cleanForSpeech(verse.hi || "")
      : cleanForSpeech(verse.en || "");
    if (text) q.push({ type: "tts", text: text, lang: lang });
  });
  return q;
}
function togglePlay() {
  if (!audio) return;
  if (audio.status === "playing") {
    if (audio.usingTts && "speechSynthesis" in window) window.speechSynthesis.pause();
    else if (audio.el) audio.el.pause();
    audio.status = "paused";
    renderAudio();
    return;
  }
  if (audio.status === "paused") {
    if (audio.usingTts && "speechSynthesis" in window) window.speechSynthesis.resume();
    else if (audio.el) audio.el.play().catch(function () {});
    audio.status = "playing";
    renderAudio();
    return;
  }
  playAudio();
}
function playAudio() {
  if (!audio) return;
  audio.queue = buildQueue();
  audio.qstep = 0;
  if (!audio.queue.length) { audio.status = "error"; audio.errorKind = "failed"; renderAudio(); return; }
  audio.status = "loading";
  renderAudio();
  playStep();
}
function playStep() {
  if (!audio) return;
  var step = audio.queue[audio.qstep];
  if (!step) { onQueueDone(); return; }
  if (step.type === "file") {
    audio.usingTts = false; audio.usingFile = true;
    audio.el.src = step.src;
    audio.el.playbackRate = audio.speed;
    audio.status = "playing";
    renderAudio();
    var p = audio.el.play();
    if (p) p.catch(function () {
      if (audio && audio.usingFile) { audio.status = "error"; audio.errorKind = "failed"; renderAudio(); }
    });
  } else {
    if (!("speechSynthesis" in window)) { audio.status = "error"; audio.errorKind = "failed"; renderAudio(); return; }
    var voices = window.speechSynthesis.getVoices();
    var prefix = step.lang === "english" ? "en" : "hi";
    if (step.lang !== "english" && voices.length && !voices.some(function (v) { return (v.lang || "").toLowerCase().indexOf("hi") === 0; })) {
      audio.status = "error"; audio.errorKind = "nohindi"; renderAudio(); return;
    }
    audio.usingTts = true; audio.usingFile = false;
    var u = new SpeechSynthesisUtterance(step.text);
    var v = pickVoice(prefix, voices);
    if (v) u.voice = v;
    u.lang = step.lang === "english" ? "en-US" : "hi-IN";
    u.rate = (step.lang === "sanskrit" ? 0.72 : 0.9) * audio.speed;
    u.pitch = 0.7;
    u.onend = function () { if (audio && audio.usingTts) onStepEnded(); };
    u.onerror = function () {
      if (audio && audio.usingTts) { audio.status = "error"; audio.errorKind = "silent"; renderAudio(); }
    };
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(u);
    audio.status = "playing";
    renderAudio();
  }
}
function onStepEnded() {
  if (!audio) return;
  audio.qstep++;
  if (audio.qstep < audio.queue.length) { playStep(); return; }
  onQueueDone();
}
function onQueueDone() {
  if (!audio) return;
  if (audio.continuous && audio.idx < audio.verses.length - 1) {
    audio.idx++;
    audio.queue = buildQueue();
    audio.qstep = 0;
    renderAudio();
    playStep();
    return;
  }
  audio.status = "idle";
  renderAudio();
}
function stopAudioEngine() {
  if (!audio) return;
  try { if ("speechSynthesis" in window) window.speechSynthesis.cancel(); } catch (e) { /* ignore */ }
  if (audio.el) { try { audio.el.pause(); } catch (e) { /* ignore */ } }
  audio.usingTts = false; audio.usingFile = false;
}

/* ---------- Paywall (Paywall.tsx, centred modal) ---------- */
var paywallSel = "yearly";
var paywallStep = "plans";
function openPaywall() {
  paywallStep = "plans";
  renderPaywall();
}
function closePaywall() { el("modalSlot").innerHTML = ""; }
function renderPaywall() {
  var tt = t();
  var slot = el("modalSlot");
  var pro = isPro();
  var canTrial = paywallSel === "yearly" && !state.trialUsed;
  var price = PLAN_PRICES[paywallSel][currency];
  var planDef = PLAN_DEFS.filter(function (p) { return p.id === paywallSel; })[0];
  var inner = "";
  if (paywallStep === "done") {
    inner = '<div class="donewrap"><span class="badge big">' + I.sparkle + "</span>" +
      "<h2>" + esc(tt.proActive) + '</h2><p>' + esc(tt.proGitaNote) + "</p>" +
      '<button type="button" class="cta" data-pclose="1">' + esc(tt.readNow) + "</button></div>";
  } else if (paywallStep === "checkout") {
    inner = "<h2 style='font-size:18px;margin-top:0'>" + (currency === "INR" ? "UPI" : "Card") + "</h2>" +
      '<div class="checkoutbox"><div class="row"><span class="name">ScrollVerse Pro · ' + paywallSel + '</span>' +
      '<span class="amt">' + (canTrial ? formatPrice(0) : formatPrice(price)) + '<span class="per">' + esc(tt[planDef.per]) + "</span></span></div>" +
      (canTrial ? '<p class="trialnote">' + esc(tt.trialNote) + " " + formatPrice(price) + esc(tt.perYear) + "</p>" : "") + "</div>" +
      '<button type="button" class="cta" data-buy="1">' + (canTrial ? esc(tt.startTrial) : esc(tt.subscribe) + " · " + formatPrice(price)) + "</button>" +
      '<button type="button" class="backbtn" data-back="1">← ' + esc(tt.plans) + "</button>" +
      '<p class="fineprint">' + esc(tt.checkoutNote) + "</p>";
  } else {
    inner = '<span class="badge">' + I.sparkle + "</span><h2>ScrollVerse Pro</h2>" +
      '<ul class="features">' + tt.proFeatures.map(function (f) {
        return "<li>" + I.check + "<span>" + esc(f) + "</span></li>";
      }).join("") + "</ul>" +
      '<p class="planslab">' + esc(tt.plans) + '</p><div class="planlist" role="radiogroup" aria-label="' + esc(tt.plans) + '">' +
      PLAN_DEFS.map(function (pl) {
        var pr = PLAN_PRICES[pl.id][currency];
        return '<button type="button" role="radio" aria-checked="' + (paywallSel === pl.id) + '" class="planchoice' + (paywallSel === pl.id ? " sel" : "") + '" data-plan="' + pl.id + '">' +
          "<span><span class='price'>" + formatPrice(pr) + '<span class="per">' + esc(tt[pl.per]) + "</span></span>" +
          (pl.id === "yearly" && !state.trialUsed ? '<span class="trial">' + esc(tt.trialNote) + " " + formatPrice(PLAN_PRICES.yearly[currency]) + esc(tt.perYear) + "</span>" : "") + "</span>" +
          (pl.badge ? '<span class="pbadge">' + esc(tt[pl.badge]) + "</span>" : "") + "</button>";
      }).join("") + "</div>" +
      '<button type="button" class="cta" data-checkout="1">' + (canTrial ? esc(tt.startTrial) : esc(tt.subscribe)) + "</button>" +
      (googleUser
        ? '<p class="signedinline">' + esc(state.lang === "hi"
            ? googleUser.name + " के रूप में साइन इन है, " + tt.proTiedSignedIn
            : "Signed in as " + googleUser.name + ", " + tt.proTiedSignedIn) + "</p>"
        : '<div class="googlewrap">' + googleButtonHtml() +
          '<p class="fineprint">' + esc(tt.proTiedGoogle) + "</p></div>") +
      '<p class="fineprint">' + esc(tt.checkoutNote) + "</p>";
  }
  slot.innerHTML = '<div class="modalback" role="dialog" aria-modal="true" aria-label="' + esc(tt.goPro) + '">' +
    '<div class="scrim" data-pclose="1"></div><div class="paywall">' +
    '<button type="button" class="x" data-pclose="1" aria-label="' + esc(tt.close) + '">' + I.x + "</button>" + inner + "</div></div>";
  slot.querySelectorAll("[data-pclose]").forEach(function (b) {
    b.addEventListener("click", function () {
      closePaywall();
      if (paywallStep === "done") { renderAllChrome(); if (audio) renderAudio(); if (screen === "profile") renderProfile(); }
    });
  });
  slot.querySelectorAll("[data-plan]").forEach(function (b) {
    b.addEventListener("click", function () { paywallSel = b.getAttribute("data-plan"); renderPaywall(); });
  });
  var co = slot.querySelector("[data-checkout]");
  if (co) co.addEventListener("click", function () { paywallStep = "checkout"; renderPaywall(); });
  var back = slot.querySelector("[data-back]");
  if (back) back.addEventListener("click", function () { paywallStep = "plans"; renderPaywall(); });
  var buy = slot.querySelector("[data-buy]");
  if (buy) buy.addEventListener("click", function () {
    var days = paywallSel === "daily" ? 1 : paywallSel === "monthly" ? 30 : 365;
    state.pro = { plan: canTrial ? "trial" : paywallSel, expiresAt: Date.now() + (canTrial ? 7 : days) * 86400000 };
    if (canTrial) state.trialUsed = true;
    saveState();
    paywallStep = "done";
    renderPaywall();
    renderAllChrome();
  });
  wireGoogleButtons(slot);
  void pro;
}

/* ---------- Sheets, onboarding, init ---------- */
function closeSheets() {
  closeAudio();
  el("sheetSlot").innerHTML = "";
  studyVerse = null;
}
function maybeOnboarding() {
  if (state.goal !== null) return;
  var tt = t();
  var slot = el("modalSlot");
  slot.innerHTML = '<div class="onboard" role="dialog" aria-modal="true" aria-label="' + esc(tt.welcomeTitle) + '"><div class="card">' +
    '<p class="om">॥ ॐ ॥</p><h2>' + esc(tt.welcomeTitle) + '</h2><p class="body">' + esc(tt.welcomeBody) + "</p>" +
    '<div class="goals">' + GOAL_KEYS.map(function (g, i) {
      return '<button type="button" data-goal="' + esc(g) + '">' + esc(tt.goals[i]) + "</button>";
    }).join("") + "</div>" +
    '<div class="foot"><div class="segmented" role="group" aria-label="' + esc(tt.language) + '">' +
    ["en", "hi"].map(function (l) {
      return '<button type="button" data-olang="' + l + '" aria-pressed="' + (state.lang === l) + '" class="' + (state.lang === l ? "active" : "") + '">' + (l === "en" ? "English" : "हिन्दी") + "</button>";
    }).join("") + "</div>" +
    '<button type="button" class="skip" data-goal="Just exploring">' + esc(tt.skip) + "</button></div></div></div>";
  slot.querySelectorAll("[data-goal]").forEach(function (b) {
    b.addEventListener("click", function () {
      state.goal = b.getAttribute("data-goal");
      saveState();
      slot.innerHTML = "";
    });
  });
  slot.querySelectorAll("[data-olang]").forEach(function (b) {
    b.addEventListener("click", function () {
      setLanguage(b.getAttribute("data-olang"));
      maybeOnboarding();
    });
  });
}
function init() {
  el("feed").innerHTML = '<p class="loadmsg">॥ ॐ ॥</p>';
  el("langToggle").querySelectorAll("[data-lang]").forEach(function (b) {
    b.addEventListener("click", function () { setLanguage(b.getAttribute("data-lang")); });
  });
  el("themeToggle").querySelectorAll("[data-theme-choice]").forEach(function (b) {
    b.addEventListener("click", function () { setTheme(b.getAttribute("data-theme-choice")); });
  });
  el("proBtn").addEventListener("click", openPaywall);
  el("feed").addEventListener("keydown", function (e) {
    if (e.key !== "ArrowDown" && e.key !== "ArrowUp") return;
    e.preventDefault();
    var feed = el("feed");
    var next = Math.max(0, Math.min(feedList.length - 1, activeIdx + (e.key === "ArrowDown" ? 1 : -1)));
    feed.scrollTo({ top: next * feed.clientHeight, behavior: "smooth" });
  });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") { closeSheets(); closePaywall(); }
  });
  if ("speechSynthesis" in window) {
    try { window.speechSynthesis.getVoices(); } catch (e) { /* ignore */ }
  }
  fetch("data/corpus.json").then(function (r) { return r.json(); }).then(function (data) {
    corpus = data;
    buildTexts();
    // Keep the Google Pro unlock in step with the stored session: a
    // session signs Pro in, no session means no Google plan lingers.
    if (googleUser) linkGooglePro(); else unlinkGooglePro();
    renderAllChrome();
    el("feedView").classList.remove("hidden");
    el("panelView").classList.add("hidden");
    // Signed-in readers resume where they left off, on the verse
    // after the last one read; everyone else starts at verse 1.
    startFeed(TEXTS.gita.verses, googleUser ? positionFor("gita") : 0);
    maybeOnboarding();
  }).catch(function () {
    el("feed").innerHTML = '<p class="loadmsg">Could not load your library. Please reopen the app.</p>';
  });
}
init();
