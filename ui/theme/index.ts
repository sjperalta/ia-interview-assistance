import { extendTheme } from 'native-base';

export const theme = extendTheme({
  colors: {
    primary: {
      50: '#eef4ff',
      100: '#d9e7ff',
      200: '#88adff', // primary from mockup
      300: '#719eff',
      400: '#5890ff',
      500: '#0f6ef0', // primary-dim from mockup
      600: '#0059c9',
      700: '#004399',
      800: '#002b69',
      900: '#002052',
    },
    surface: {
      50: '#f0f2f5',
      100: '#e1e4e9',
      200: '#c3c9d2',
      300: '#a3aac4',
      400: '#6d758c',
      500: '#192540', // surface-variant
      600: '#141f38', // surface-container-high
      700: '#0f1930', // surface-container
      800: '#091328', // surface-container-low
      900: '#060e20', // surface / background
    },
    tertiary: {
      50: '#fdf4ff',
      100: '#f9e8ff',
      200: '#f3d0ff',
      300: '#ebaaff',
      400: '#e17eff',
      500: '#fab0ff', // tertiary from mockup
      600: '#d946ef',
      700: '#a21caf',
      800: '#701a75',
      900: '#4a044e',
    },
  },
  config: {
    initialColorMode: 'dark',
  },
  fonts: {
    heading: 'Manrope',
    body: 'Inter',
    mono: 'Inter',
  },
  components: {
    Text: {
      baseStyle: {
        color: 'surface.300',
        fontFamily: 'body',
      },
    },
    Heading: {
      baseStyle: {
        color: 'primary.200',
        fontFamily: 'heading',
        fontWeight: 'bold',
      },
    },
    Button: {
      baseStyle: {
        rounded: 'xl',
        _text: {
          fontWeight: 'bold',
          letterSpacing: 0.5,
        },
      },
      variants: {
        premium: {
          bg: {
            linearGradient: {
              colors: ['primary.200', 'primary.500'],
              start: [0, 0],
              end: [1, 1],
            },
          },
          _text: {
            color: 'white',
          },
        },
      },
    },
  },
});

export type CustomThemeType = typeof theme;

declare module 'native-base' {
  interface ICustomTheme extends CustomThemeType {}
}
