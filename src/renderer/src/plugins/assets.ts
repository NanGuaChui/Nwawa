import 'normalize.css';
import '@renderer/assets/css/main.scss';

/** Tailwind's Preflight Style Override */
function naiveStyleOverride() {
  // const meta = document.createElement('meta');
  // meta.name = 'naive-ui-style';
  // document.head.appendChild(meta);
}

function setupAssets() {
  naiveStyleOverride();
}

export default setupAssets;
