import { type FormEvent, useState } from 'react';
import { sendContactMessage } from '../api/client';
import type { Profile } from '../types';
import { SectionHeader } from './SectionHeader';

interface Props {
  profile: Profile;
}

export function ContactSection({ profile }: Props) {
  const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);
    const payload = {
      name: (formData.get('name') || '') as string,
      email: (formData.get('email') || '') as string,
      message: (formData.get('message') || '') as string,
    };

    try {
      setStatus('sending');
      await sendContactMessage(payload);
      setStatus('success');
      setMessage('Thanks for reaching out. I will get back soon.');
      form.reset();
    } catch (error) {
      console.error(error);
      setStatus('error');
      setMessage('Something went wrong. Please try again later.');
    }
  };

  return (
    <section className="section" id="contact">
      <SectionHeader
        eyebrow="Contact"
        title="Let's build something"
        description={
          <>
            Prefer email? <a href={`mailto:${profile.email}`}>{profile.email}</a>
          </>
        }
      />
      <div className="contact-wrapper">
        <form className="contact-form" onSubmit={handleSubmit}>
          <label>
            Name
            <input type="text" name="name" placeholder="Your name" required minLength={2} />
          </label>
          <label>
            Email
            <input type="email" name="email" placeholder="your@email.com" required />
          </label>
          <label>
            Message
            <textarea
              name="message"
              placeholder="Tell me about the challenge you're tackling"
              required
              minLength={10}
            />
          </label>
          <button type="submit" disabled={status === 'sending'}>
            {status === 'sending' ? 'Sending...' : 'Send message'}
          </button>
          {status !== 'idle' && <p className={`contact-status ${status}`}>{message}</p>}
        </form>
        <aside className="contact-meta">
          <h3>Stay in touch</h3>
          <ul>
            {profile.linkedin && (
              <li>
                <a href={profile.linkedin} target="_blank" rel="noreferrer">
                  LinkedIn
                </a>
              </li>
            )}
            {profile.github && (
              <li>
                <a href={profile.github} target="_blank" rel="noreferrer">
                  GitHub
                </a>
              </li>
            )}
            {profile.phone && <li>Phone: {profile.phone}</li>}
          </ul>
        </aside>
      </div>
    </section>
  );
}
