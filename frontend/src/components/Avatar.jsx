import PropTypes from 'prop-types';

export default function Avatar({ src, name, size = 40, className = '' }) {
  const initials = (name || '')
    .split(' ')
    .map(n => n[0])
    .slice(0,2)
    .join('')
    .toUpperCase();

  if (src) {
    return <img src={src} alt={name} className={`rounded-full object-cover ${className}`} style={{ width: size, height: size }} />;
  }

  return (
    <div
      className={`rounded-full bg-gray-300 text-gray-700 flex items-center justify-center ${className}`}
      style={{ width: size, height: size, fontSize: Math.max(12, size / 2.5) }}
    >
      {initials || '?'}
    </div>
  );
}

Avatar.propTypes = {
  src: PropTypes.string,
  name: PropTypes.string,
  size: PropTypes.number,
  className: PropTypes.string,
};
