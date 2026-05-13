export type EyeglassesProduct = {
  brand: string;
  model: string;
  price: string;
  image: string;
  colors: string[];
  badge?: string;
};

export type EyeglassesByOption = {
  label: string;
  selected?: boolean;
};

export type EyeglassesShape = {
  label: string;
  image: string;
};

export type EyeglassesAccordionSection = {
  title: string;
};

export const EYEGLASSES_PRODUCTS: EyeglassesProduct[] = [
  {
    brand: 'Gucci',
    model: 'Braddy',
    price: 'Rp 5.200.000',
    image: '/landing/kacamata/Brady Sea Glass Grey.png',
    colors: ['#d9d9d9', '#5a6570', '#0b1420', '#69412e', '#a9bcc8'],
  },
  {
    brand: 'Gucci',
    model: 'Ketty',
    price: 'Rp 3.000.000',
    image: '/landing/kacamata/image.png',
    colors: ['#6d0f19', '#0e0e0e'],
  },
  {
    brand: 'Prada',
    model: 'Mel',
    price: 'Rp 7.450.000',
    image: '/landing/kacamata/image copy.png',
    colors: ['#b46a1e', '#223e86'],
  },
  {
    brand: 'Ic! berlin',
    model: 'Elias',
    price: 'Rp 2.100.000',
    image: '/landing/kacamata/Brady Sea Glass Grey.png',
    colors: ['#4a5c44', '#693524', '#b9cad2'],
  },
  {
    brand: 'Gucci',
    model: 'Murrow',
    price: 'Rp 3.000.000',
    image: '/landing/kacamata/image.png',
    colors: ['#67410f', '#ece8e2', '#4a7898'],
  },
  {
    brand: 'Burberry',
    model: 'Dominic',
    price: 'Rp 3.080.000',
    image: '/landing/kacamata/image copy.png',
    colors: ['#5a3712', '#ece9e5', '#406887'],
  },
  {
    brand: 'Prada',
    model: 'Spiers',
    price: 'Rp 6.000.000',
    image: '/landing/kacamata/image copy.png',
    colors: ['#522228', '#ddd8ce', '#efc879'],
  },
  {
    brand: 'Mont Blanc',
    model: 'Olin',
    price: 'Rp 2.732.000',
    image: '/landing/kacamata/Brady Sea Glass Grey.png',
    colors: ['#e5e5e3', '#f1d496', '#99531f', '#e7d9bf'],
    badge: 'For Rx -4 to +4',
  },
  {
    brand: 'Ic! berlin',
    model: 'Carson',
    price: 'Rp 1.300.000',
    image: '/landing/kacamata/image.png',
    colors: ['#6e3500', '#eadab0'],
  },
];

export const EYEGLASSES_FILTER_CHIPS = ['New Collections', 'Reset'];

export const EYEGLASSES_BY_OPTIONS: EyeglassesByOption[] = [
  { label: 'Bestsellers' },
  { label: 'Trending: 90s minimalism' },
  { label: 'Good for progressives' },
  { label: 'New arrivals', selected: true },
];

export const EYEGLASSES_SHAPES: EyeglassesShape[] = [
  { label: 'Square', image: '/landing/kacamata/image.png' },
  { label: 'Rectangle', image: '/landing/kacamata/Brady Sea Glass Grey.png' },
  { label: 'Round', image: '/landing/kacamata/image copy.png' },
  { label: 'Oval', image: '/landing/kacamata/image.png' },
  { label: 'Cat-eye', image: '/landing/kacamata/image copy.png' },
  { label: 'Geometric', image: '/landing/kacamata/image.png' },
  { label: 'Aviator', image: '/landing/kacamata/Brady Sea Glass Grey.png' },
];

export const EYEGLASSES_ACCORDION_SECTIONS: EyeglassesAccordionSection[] = [
  { title: 'Gender' },
  { title: 'Frame width' },
  { title: 'Color' },
  { title: 'Material' },
  { title: 'Frame price' },
  { title: 'Prescription' },
  { title: 'Features' },
  { title: 'Nose bridge' },
];
