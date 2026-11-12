import { SpeechRecognition } from "@capacitor-community/speech-recognition";

// Register the Capacitor community plugin through its bundled native bridge.
// The HTML app reads this stable global for both Kural and Better Call.
window.AuraNativeSpeechRecognition = SpeechRecognition;
