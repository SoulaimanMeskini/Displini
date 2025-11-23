import tailwindcss from 'tailwindcss';
import autoprefixer from 'autoprefixer';

export default {
  plugins: [
    tailwindcss,
    autoprefixer,
    ...(process.env.NODE_ENV === 'production' 
      ? [require('cssnano')({ preset: 'default' })] 
      : []
    ),
  ],
}
