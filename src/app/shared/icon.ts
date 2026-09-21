import { Component, Input } from '@angular/core';

/** Iconos SVG en línea: evita añadir una librería externa al prototipo. */
const PATHS: Record<string, string> = {
  home: 'M3 10.5 12 3l9 7.5M5.5 9.5V20h13V9.5M9.5 20v-6h5v6',
  community: 'M7 9h10M7 13h6M21 12a8 8 0 0 1-11.6 7.1L4 20.5l1.4-5.4A8 8 0 1 1 21 12Z',
  resources: 'M4 5.5A1.5 1.5 0 0 1 5.5 4H11v16H5.5A1.5 1.5 0 0 1 4 18.5v-13ZM11 4h7.5A1.5 1.5 0 0 1 20 5.5v13a1.5 1.5 0 0 1-1.5 1.5H11',
  tutors: 'm12 4 9 4.5-9 4.5-9-4.5L12 4Zm6.5 7v5c0 1.7-2.9 3-6.5 3s-6.5-1.3-6.5-3v-5',
  messages: 'M4 6.5A1.5 1.5 0 0 1 5.5 5h13A1.5 1.5 0 0 1 20 6.5v9a1.5 1.5 0 0 1-1.5 1.5H9l-5 4v-4h-.5',
  star: 'm12 3.6 2.6 5.3 5.9.9-4.3 4.1 1 5.8-5.2-2.7-5.2 2.7 1-5.8L3.5 9.8l5.9-.9L12 3.6Z',
  profile: 'M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm-7 8a7 7 0 0 1 14 0',
  search: 'M11 18a7 7 0 1 0 0-14 7 7 0 0 0 0 14Zm10 3-5-5',
  bell: 'M6 9a6 6 0 1 1 12 0c0 4 1.5 5.5 1.5 5.5h-15S6 13 6 9Zm4 9.5a2.2 2.2 0 0 0 4 0',
  sun: 'M12 16.5a4.5 4.5 0 1 0 0-9 4.5 4.5 0 0 0 0 9ZM12 2v2.5M12 19.5V22M2 12h2.5M19.5 12H22M4.9 4.9l1.8 1.8M17.3 17.3l1.8 1.8M19.1 4.9l-1.8 1.8M6.7 17.3l-1.8 1.8',
  moon: 'M20 14.5A8.5 8.5 0 0 1 9.5 4a8.5 8.5 0 1 0 10.5 10.5Z',
  menu: 'M4 7h16M4 12h16M4 17h16',
  close: 'M18 6 6 18M6 6l12 12',
  check: 'm5 13 4.5 4.5L19 7',
  arrowLeft: 'M19 12H5m0 0 6-6m-6 6 6 6',
  arrowRight: 'M5 12h14m0 0-6-6m6 6-6 6',
  calendar: 'M4 8.5A1.5 1.5 0 0 1 5.5 7h13A1.5 1.5 0 0 1 20 8.5v10a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 4 18.5v-10ZM8 4v4M16 4v4M4 11.5h16',
  clock: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Zm0-14v5l3.5 2',
  logout: 'M15 17.5V20a1.5 1.5 0 0 1-1.5 1.5h-8A1.5 1.5 0 0 1 4 20V4a1.5 1.5 0 0 1 1.5-1.5h8A1.5 1.5 0 0 1 15 4v2.5M10 12h11m0 0-3.5-3.5M21 12l-3.5 3.5',
  send: 'M4.5 12 20 4.5 15 20l-3.5-5.5L4.5 12Z',
  download: 'M12 4v11m0 0 4-4m-4 4-4-4M4.5 19.5h15',
  heart: 'M12 20s-7.5-4.6-7.5-9.4A4.1 4.1 0 0 1 12 8a4.1 4.1 0 0 1 7.5 2.6C19.5 15.4 12 20 12 20Z',
  reply: 'M9 8 4 12l5 4M4 12h9a6 6 0 0 1 6 6v1',
  spark: 'M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5 18 18M18 6l-2.5 2.5M8.5 15.5 6 18',
  shield: 'M12 3 5 6v6c0 4.5 3 7.5 7 9 4-1.5 7-4.5 7-9V6l-7-3Zm-2.5 9 2 2 4-4',
  users: 'M9 12a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Zm-6 8a6 6 0 0 1 12 0m1.5-14.7a3.5 3.5 0 0 1 0 6.9M17 20a6 6 0 0 0-1.5-4',
  video: 'M4 7.5A1.5 1.5 0 0 1 5.5 6h9A1.5 1.5 0 0 1 16 7.5v9a1.5 1.5 0 0 1-1.5 1.5h-9A1.5 1.5 0 0 1 4 16.5v-9Zm12.5 3 3.5-2.5v8L16.5 13.5',
  mic: 'M12 4a3 3 0 0 0-3 3v5a3 3 0 0 0 6 0V7a3 3 0 0 0-3-3Zm-6.5 8a6.5 6.5 0 0 0 13 0M12 18.5V21',
  micOff: 'M15.5 12.5a3.5 3.5 0 0 1-7 0V12M8.7 8.7a3.5 3.5 0 0 1 5.8 2.7v1M6 17 19 5M12 18.5V21M12 15.5v3M4.5 12a7.5 7.5 0 0 0 2 5M21 12h-1.5M4.5 12H6',
  callEnd: 'M22 16.8c-1.9-4.4-5.8-6.8-10-6.8S3.9 12.4 2 16.8l1.6 1c.8 1.9 2.4 1.9 3.3-.3l.7-2a9.6 9.6 0 0 1 8.8 0l.7 2c.9 2.2 2.5 2.2 3.3.3l1.6-1Z',
  eye: 'M2 12s3.5-6.5 10-6.5S22 12 22 12s-3.5 6.5-10 6.5S2 12 2 12Zm10-2a2 2 0 1 0 0 4 2 2 0 0 0 0-4Z',
  upload: 'M12 3.5V15m0-11.5 4 4m-4-4L8 7.5M5 16.5v2A1.5 1.5 0 0 0 6.5 20h11a1.5 1.5 0 0 0 1.5-1.5v-2',
  flame: 'M12 3c.3 3-1.9 5-3.6 7S6 14 6 16a6 6 0 0 0 12 0c0-1.8-.8-3.3-2.1-4.8C14.6 9.6 13 6.9 12 3Zm-2.2 12.4a2.4 2.4 0 0 0 1.6 2.8',
  book: 'M5 4.5A1.5 1.5 0 0 1 6.5 3H18v17H6.5A1.5 1.5 0 0 1 5 18.5v-14ZM5 18.5A1.5 1.5 0 0 1 6.5 17H18',
  lightbulb: 'M9 18.5h6M10.5 21h3M8 15a6 6 0 1 1 8 0c-.9.8-1.4 1.7-1.6 2.6H9.6c-.2-.9-.7-1.8-1.6-2.6Z',
  award: 'M12 15a6 6 0 1 0 0-12 6 6 0 0 0 0 12Zm-6.6 5 1.4-4.2M18.6 20l-1.4-4.2m-2.8 4.2-1-4.4m-2.8 4.4 1-4.4',
  trophy: 'M8 4h8v4.5a4 4 0 1 1-8 0V4ZM8 5.5H5.5a2 2 0 0 0 2 2H10M16 5.5h2.5a2 2 0 0 1-2 2H14M12 12.5V17m0 0h-3m3 0h3',
};

@Component({
  selector: 'app-icon',
  template: `
    <svg
      [attr.width]="size"
      [attr.height]="size"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      [attr.stroke-width]="strokeWidth"
      stroke-linecap="round"
      stroke-linejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      <path [attr.d]="path" />
    </svg>
  `,
  styles: [':host{display:inline-grid;place-items:center;line-height:0}'],
})
export class IconComponent {
  @Input({ required: true }) name!: string;
  @Input() size = 20;
  @Input() strokeWidth = 1.9;

  get path(): string {
    return PATHS[this.name] ?? '';
  }
}
