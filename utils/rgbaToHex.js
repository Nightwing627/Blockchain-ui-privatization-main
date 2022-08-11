const toHex = function toHex(val) {
  const hex = val.toString(16);
  return hex.length === 1 ? `0${hex}` : hex;
};

export default function getHex(rgba) {
  const arr = rgba.match(new RegExp('[\\d\\.]+', 'g')).slice(0, 3);
  return `#${arr.map(item => toHex(Number(item))).join('')}`;
}
