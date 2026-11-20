// Text-to-Speech AI Voice Synthesizer
function speakText(text, onEnd) {
  if (typeof window === 'undefined' || !window.speechSynthesis) {
    if (onEnd) onEnd();
    return;
  }
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.rate = 1.05;
  utterance.pitch = 1.0;
  
  const voices = window.speechSynthesis.getVoices();
  const enVoice = voices.find(v => v.lang && v.lang.startsWith('en') && (v.name.includes('Natural') || v.name.includes('Google') || v.name.includes('Samantha') || v.name.includes('David')));
  if (enVoice) utterance.voice = enVoice;
  
  utterance.onend = () => { if (onEnd) onEnd(); };
  utterance.onerror = () => { if (onEnd) onEnd(); };
  window.speechSynthesis.speak(utterance);
}

function stopSpeaking() {
  if (typeof window !== 'undefined' && window.speechSynthesis) {
    window.speechSynthesis.cancel();
  }
}

if (typeof window !== 'undefined') {
  window.FC = window.FC || {};
  window.FC.speakText = speakText;
  window.FC.stopSpeaking = stopSpeaking;
}
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { speakText, stopSpeaking };
}
