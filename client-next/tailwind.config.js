function withOpacity(themeVariable) {
  return ({ opacityVariable, opacityValue }) => {
    if (opacityValue !== undefined) {
      return `rgba(var(${themeVariable}), ${opacityValue})`
    }
    if (opacityVariable !== undefined) {
      return `rgba(var(${themeVariable}), var(${opacityVariable}, 1))`
    }
    return `rgb(var(${themeVariable}))`
  }
}

module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    fontFamily: {
      'sans': ['Rubik'],
      'rubik': ['Rubik'],
    },
    extend: {
      screens: {
        '3xl': '1900px',
      },
      colors: {
        primary: withOpacity('--color-primary'),
        'primary-hover': withOpacity('--color-primary-hover'),
        'on-primary': withOpacity('--color-on-primary'),
        'on-primary-hover': withOpacity('--color-on-primary-hover'),

        accent: withOpacity('--color-accent'),
        'accent-hover': withOpacity('--color-accent-hover'),

        success: withOpacity('--color-success'),
        warning: withOpacity('--color-warning'),
        danger: withOpacity('--color-danger'),
        'danger-hover': withOpacity('--color-danger-hover'),

        'surface': withOpacity('--color-surface'),
        'surface-secondary': withOpacity('--color-surface-secondary'),
        'on-surface': withOpacity('--color-on-surface'),

        background: withOpacity('--color-background'),
        'background-secondary': withOpacity('--color-background-secondary'),

        paragraph: withOpacity('--color-paragraph'),
        'paragraph-variant': withOpacity('--color-paragraph-variant'),
      },
    },
  },
  plugins: [],
}