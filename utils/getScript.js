export default function getScript(url) {
  const promise = new Promise((resolve, reject) => {
    const script = document.createElement('script');
    const head = document.querySelector('head');
    script.onload = () => {
      resolve();
    };
    script.onerror = (err) => {
      reject(err);
    };
    script.src = url;
    head.appendChild(script);
  });
  return promise;
}
