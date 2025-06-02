export const COLORS = {
  white: '#FFFFFF',

  black: '#000000',
  darkGray: '#686868',
  gray: '#878787',
  lightGray: '#D7D9E6',
  softGray: '#d7d9e676',
  
  darkGreen: '#4B8F8D',
  green: '#74B6B4',
  lightGreen: '#9FC9C4',
  brightGreen: '#75A47F',

  yellowGradient: ['#FEF4EB', '#FFFFFF'] as readonly [string, string], 
  yellow: '#EBB970',
  lightYellow: '#FEF4EB',

  red: '#F55050',
};

export const LIST_COLORS = [
  '#c599b6',
  '#fcdc94',
  '#8eaccd',
  '#c8cfa0',
];

export const FONTSIZE = {
  xLarge: 37,
  huge: 25,
  large: 20,
  medium: 18,
  small: 15,
  tiny: 12,
  micro: 10,
};

export const TEMPERATURE_LEVELS = [
  { label: 'Very Hot', value: 40 },
  { label: 'Hot', value: 35 },
  { label: 'Warm', value: 30 },
  { label: 'Mild', value: 25 },
  { label: 'Cool', value: 20 },
  { label: 'Cold', value: 15 },
  { label: 'Freezing', value: 0 },
  { label: 'Scorching', value: Infinity },
];

export const HUMIDITY_LEVELS = [
  { label: 'Very Humid', value: 100 },
  { label: 'Humid', value: 80 },
  { label: 'Normal', value: 60 },
  { label: 'Dry', value: 40 },
  { label: 'Very Dry', value: 20 },
];