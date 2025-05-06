export const COLORS = {
  white: '#FFFFFF',

  black: '#000000',
  gray: '#878787',
  lightGray: '#D7D9E6',
  
  darkGreen: '#4B8F8D',
  green: '#74B6B4',
  lightGreen: '#9FC9C4',

  yellowGradient: ['#FEF4EB', '#FFFFFF'] as readonly [string, string], 
  yellow: '#EBB970',
  lightYellow: '#FEF4EB',

  red: '#F55050',
};

export const FONTSIZE = {
  xLarge: 38,
  huge: 25,
  large: 20,
  medium: 18,
  small: 15,
  tiny: 12,
};

export const TEMPERATURE_LEVELS = [
  { label: 'Freezing', value: 0 },
  { label: 'Cold', value: 15 },
  { label: 'Cool', value: 20 },
  { label: 'Mild', value: 25 },
  { label: 'Warm', value: 30 },
  { label: 'Hot', value: 35 },
  { label: 'Very Hot', value: 40 },
  { label: 'Scorching', value: Infinity },
];

export const HUMIDITY_LEVELS = [
  { label: 'Very Dry', value: 20 },
  { label: 'Dry', value: 40 },
  { label: 'Normal', value: 60 },
  { label: 'Humid', value: 80 },
  { label: 'Very Humid', value: 100 },
];