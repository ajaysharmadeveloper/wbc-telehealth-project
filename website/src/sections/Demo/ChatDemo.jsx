import { useEffect, useRef, useState } from 'react';
import { Repeat } from '../../components/icons';

const SCRIPT = [
  {
    role: 'user',
    text: "I've been feeling extremely thirsty and tired for the past 3 days, and urinating more than usual.",
  },
  {
    role: 'ai',
    text: 'Thanks for sharing that. A few quick follow-ups: Do you have a known diabetes diagnosis? Have you noticed any blurred vision or numbness in your hands or feet?',
  },
  {
    role: 'user',
    text: 'No diabetes diagnosis. I did notice some blurred vision this morning.',
  },
  {
    role: 'ai',
    text: 'Understood. Do you have a glucometer to check your blood glucose? Also, any recent changes in diet or significant stress?',
  },
  {
    role: 'user',
    text: "No glucometer. I've been eating more sugary food and work has been very stressful lately.",
  },
  {
    role: 'triage',
    text: 'YELLOW - Book an Appointment\n\nYour symptoms (excessive thirst, frequent urination, fatigue, blurred vision) suggest you should see a doctor soon.\n\nPlease schedule a clinic visit within 1–2 days. Avoid sugary foods, stay hydrated, and watch for worsening symptoms.',
  },
];

export default function ChatDemo() {
  const [step, setStep] = useState(0);
  const [typing, setTyping] = useState(false);
  const [messages, setMessages] = useState([]);
  const [isVisible, setIsVisible] = useState(false);
  const containerRef = useRef(null);
  const chatScrollRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.3 }
    );
    if (containerRef.current) observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!isVisible || step >= SCRIPT.length) return;
    const cur = SCRIPT[step];
    const delay = step === 0 ? 700 : 1000;
    const t = setTimeout(() => {
      if (cur.role === 'ai' || cur.role === 'triage') {
        setTyping(true);
        setTimeout(() => {
          setTyping(false);
          setMessages((m) => [...m, cur]);
          setStep((s) => s + 1);
        }, 1800);
      } else {
        setMessages((m) => [...m, cur]);
        setStep((s) => s + 1);
      }
    }, delay);
    return () => clearTimeout(t);
  }, [step, isVisible]);

  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.style.scrollBehavior = 'smooth';
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [messages, typing]);

  const restart = () => {
    setStep(0);
    setMessages([]);
    setTyping(false);
  };

  return (
    <div className="demo-wrap" ref={containerRef}>
      <div className="demo-chat" ref={chatScrollRef}>
        {messages.map((m, i) =>
          m.role === 'triage' ? (
            <div key={i} className="demo-triage">
              {m.text}
            </div>
          ) : (
            <div
              key={i}
              className={`demo-msg ${m.role === 'user' ? 'demo-msg-user' : 'demo-msg-ai'}`}
            >
              {m.text}
            </div>
          )
        )}
        {typing && (
          <div className="typing">
            <span />
            <span />
            <span />
          </div>
        )}
      </div>
      {step >= SCRIPT.length && (
        <div style={{ textAlign: 'center' }}>
          <button type="button" className="demo-restart" onClick={restart}>
            <Repeat size={14} /> Replay Demo
          </button>
        </div>
      )}
    </div>
  );
}
