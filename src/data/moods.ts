export interface Mood {
  id: string;
  name: string;
  description: string;
  palette: string[]; // hex colors
  isModern: boolean;
}

export const MOOD_LIST: Mood[] = [
  {
    id: 'thanh-lich',
    name: 'Thanh lịch (Classic)',
    description: 'Sử dụng các gam màu truyền thống nhã nhặn, tôn trọng tối đa nguyên bản.',
    palette: ['#F5F5DC', '#333333', '#8B0000', '#556B2F'],
    isModern: false,
  },
  {
    id: 'pha-cach',
    name: 'Phá cách (Modern)',
    description: 'Phối màu táo bạo, sử dụng các gam màu tương phản cao, hiện đại hóa.',
    palette: ['#FF007F', '#00FFFF', '#FFD700', '#1A1A1A'],
    isModern: true,
  },
  {
    id: 'moc-mac',
    name: 'Mộc mạc (Rustic)',
    description: 'Các tông màu đất, tự nhiên và ấm áp.',
    palette: ['#8B4513', '#A0522D', '#CD853F', '#DEB887'],
    isModern: false,
  },
  {
    id: 'diu-dang',
    name: 'Dịu dàng (Gentle)',
    description: 'Bảng màu pastel nhẹ nhàng, ngọt ngào.',
    palette: ['#FFC0CB', '#E6E6FA', '#FFF0F5', '#E0FFFF'],
    isModern: true, // pastel colors are often considered modern interpretations for some traditional clothes
  }
];
