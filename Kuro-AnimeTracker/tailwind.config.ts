import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  
    darkMode: "class",
    theme: {
      extend: {
        "colors": {
          "secondary-fixed": "#e1e0ff",
          "on-tertiary-fixed-variant": "#005236",
          "surface-container-lowest": "#ffffff",
          "tertiary": "#000000",
          "on-primary": "#ffffff",
          "surface-container-low": "#f4f2fd",
          "surface-variant": "#e3e1ec",
          "surface-container-high": "#e8e7f1",
          "primary-fixed": "#e4e1e6",
          "primary-fixed-dim": "#c8c5ca",
          "on-secondary-container": "#fffbff",
          "primary": "#000000",
          "on-secondary-fixed": "#07006c",
          "on-background": "#1a1b22",
          "background": "#fbf8ff",
          "on-secondary": "#ffffff",
          "on-error-container": "#93000a",
          "on-error": "#ffffff",
          "tertiary-fixed": "#6ffbbe",
          "error-container": "#ffdad6",
          "on-primary-container": "#858387",
          "on-primary-fixed-variant": "#47464a",
          "on-tertiary-container": "#009668",
          "primary-container": "#1b1b1e",
          "secondary": "#4648d4",
          "tertiary-fixed-dim": "#4edea3",
          "surface-container": "#eeedf7",
          "on-tertiary-fixed": "#002113",
          "surface-container-highest": "#e3e1ec",
          "on-surface": "#1a1b22",
          "inverse-primary": "#c8c5ca",
          "inverse-on-surface": "#f1effa",
          "outline-variant": "#c8c5cb",
          "secondary-container": "#6063ee",
          "inverse-surface": "#2f3038",
          "surface-dim": "#dad9e3",
          "secondary-fixed-dim": "#c0c1ff",
          "on-tertiary": "#ffffff",
          "surface": "#fbf8ff",
          "tertiary-container": "#002113",
          "on-secondary-fixed-variant": "#2f2ebe",
          "error": "#ba1a1a",
          "surface-bright": "#fbf8ff",
          "outline": "#77767b",
          "on-surface-variant": "#47464b",
          "surface-tint": "#5f5e61",
          "on-primary-fixed": "#1b1b1e"
        },
        "borderRadius": {
          "DEFAULT": "0.125rem",
          "lg": "0.25rem",
          "xl": "0.5rem",
          "full": "0.75rem"
        },
        "spacing": {
          "margin": "3rem",
          "space-sm": "0.5rem",
          "margin-mobile": "1rem",
          "space-xs": "0.25rem",
          "space-md": "1rem",
          "space-lg": "1.5rem",
          "gutter": "1.5rem",
          "space-xl": "2.5rem",
          "gutter-mobile": "0.75rem"
        },
        "fontFamily": {
          "headline-lg": [
            "Manrope"
          ],
          "headline-lg-mobile": [
            "Manrope"
          ],
          "headline-md": [
            "Manrope"
          ],
          "body-sm": [
            "Plus Jakarta Sans"
          ],
          "headline-xl": [
            "Manrope"
          ],
          "caption": [
            "Plus Jakarta Sans"
          ],
          "headline-xl-mobile": [
            "Manrope"
          ],
          "label-md": [
            "Plus Jakarta Sans"
          ],
          "body-md": [
            "Plus Jakarta Sans"
          ],
          "label-mono": [
            "JetBrains Mono"
          ],
          "body-lg": [
            "Plus Jakarta Sans"
          ],
          "headline-sm": [
            "Manrope"
          ]
        },
        "fontSize": {
          "headline-lg": [
            "28px",
            {
              "lineHeight": "36px",
              "letterSpacing": "-0.02em",
              "fontWeight": "600"
            }
          ],
          "headline-lg-mobile": [
            "24px",
            {
              "lineHeight": "32px",
              "letterSpacing": "-0.01em",
              "fontWeight": "600"
            }
          ],
          "headline-md": [
            "20px",
            {
              "lineHeight": "28px",
              "letterSpacing": "-0.01em",
              "fontWeight": "500"
            }
          ],
          "body-sm": [
            "13px",
            {
              "lineHeight": "20px",
              "fontWeight": "400"
            }
          ],
          "headline-xl": [
            "40px",
            {
              "lineHeight": "48px",
              "letterSpacing": "-0.03em",
              "fontWeight": "600"
            }
          ],
          "caption": [
            "11px",
            {
              "lineHeight": "14px",
              "letterSpacing": "0.02em",
              "fontWeight": "400"
            }
          ],
          "headline-xl-mobile": [
            "30px",
            {
              "lineHeight": "38px",
              "letterSpacing": "-0.02em",
              "fontWeight": "600"
            }
          ],
          "label-md": [
            "12px",
            {
              "lineHeight": "16px",
              "letterSpacing": "0.01em",
              "fontWeight": "500"
            }
          ],
          "body-md": [
            "14px",
            {
              "lineHeight": "22px",
              "fontWeight": "400"
            }
          ],
          "label-mono": [
            "12px",
            {
              "lineHeight": "16px",
              "letterSpacing": "0.02em",
              "fontWeight": "500"
            }
          ],
          "body-lg": [
            "16px",
            {
              "lineHeight": "26px",
              "fontWeight": "400"
            }
          ],
          "headline-sm": [
            "16px",
            {
              "lineHeight": "24px",
              "letterSpacing": "-0.01em",
              "fontWeight": "600"
            }
          ]
        }
      },
    },
  
};
export default config;