import { useEffect } from 'react';

export default function Utteranc(): JSX.Element {
  useEffect(() => {
    const script = document.createElement('script');
    const anchor = document.getElementById('inject-comments-for-uterances');
    script.setAttribute('src', 'https://utteranc.es/client.js');
    script.setAttribute('crossorigin', 'anonymous');
    script.setAttribute('async', 'true');
    script.setAttribute('repo', 'luiz-gustavo0/desafio05-reactjs');
    script.setAttribute('issue-term', 'pathname');
    script.setAttribute('theme', 'github-dark');
    script.setAttribute('label', 'Utterances-comment');
    anchor.appendChild(script);
  }, []);

  return <div id="inject-comments-for-uterances" />;
}
