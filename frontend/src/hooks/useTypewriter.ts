import { useEffect, useState } from 'react';

export function useTypewriter(words: string[], speed = 80, pause = 1600) {
  const [index, setIndex] = useState(0);
  const [displayed, setDisplayed] = useState('');
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (words.length === 0) {
      return;
    }

    const currentWord = words[index % words.length];
    const nextCharCount = deleting ? displayed.length - 1 : displayed.length + 1;
    const isWordComplete = !deleting && nextCharCount === currentWord.length;
    const isWordEmpty = deleting && nextCharCount === 0;

    const timeout = setTimeout(() => {
      setDisplayed(currentWord.slice(0, nextCharCount));

      if (isWordComplete) {
        setTimeout(() => setDeleting(true), pause);
      } else if (isWordEmpty) {
        setDeleting(false);
        setIndex((prev) => prev + 1);
      }
    }, deleting ? speed / 1.6 : speed);

    return () => clearTimeout(timeout);
  }, [words, index, displayed, deleting, speed, pause]);

  return displayed || words[0] || '';
}
