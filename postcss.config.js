import tailwindcss from 'tailwindcss';
import autoprefixer from 'autoprefixer';

export default (ctx = {}) => {
  const options = ctx?.options || {};
  const plugins = [
    tailwindcss,
    autoprefixer,
  ];
  
  // Only add cssnano if available (optional for production minification)
  if (process.env.NODE_ENV === 'production') {
    try {
      const cssnano = require('cssnano');
      plugins.push(cssnano({ preset: 'default' }));
    } catch (e) {
      // cssnano not available, skip minification
      console.warn('cssnano not found, skipping CSS minification');
    }
  }
  
  return {
    map: options.map || false,
    plugins,
  };
}
