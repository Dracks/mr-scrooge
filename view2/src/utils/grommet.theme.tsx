import { ThemeType } from 'grommet';

/**
 * Theme colors changed from
 * https://theme-designer.grommet.io/List
 */
export const MyTheme: ThemeType = {
    global: {
        colors: {
            brand: {
                dark: '#0077cc',
                light: '#0066cc',
            },
            background: {
                dark: '#111111',
                light: '#FFFFFF',
            },
            'background-back': {
                dark: '#111111',
                light: '#EEEEEE',
            },
            'background-front': {
                dark: '#222222',
                light: '#FFFFFF',
            },
            'background-contrast': {
                dark: '#FFFFFF11',
                light: '#11111111',
            },
            text: {
                dark: '#EEEEEE',
                light: '#333333',
            },
            'text-strong': {
                dark: '#FFFFFF',
                light: '#000000',
            },
            'text-weak': {
                dark: '#CCCCCC',
                light: '#444444',
            },
            'text-xweak': {
                dark: '#999999',
                light: '#666666',
            },
            border: {
                dark: '#444444',
                light: '#CCCCCC',
            },
            control: 'brand',
            'active-background': 'background-contrast',
            'active-text': 'text-strong',
            'selected-background': 'brand',
            'selected-text': 'text-strong',
            'status-critical': '#FF4040',
            'status-warning': '#FFAA15',
            'status-ok': '#00C781',
            'status-unknown': '#CCCCCC',
            'status-disabled': '#CCCCCC',
            'graph-0': 'brand',
            'graph-1': 'status-warning',
            focus: '#00cc66',
            'nav-background': {
                dark: '#0033aa',
                light: '#6688FF',
            },
            'nav-background!': '',
        },
        font: {
            family: 'Helvetica',
        },
        active: {
            background: 'active-background',
            color: 'active-text',
        },
        hover: {
            background: 'active-background',
            color: 'active-text',
        },
        selected: {
            background: 'selected-background',
            color: 'selected-text',
        },
    },
    chart: {},
    diagram: {
        line: {},
    },
    meter: {},
    layer: {
        background: {
            dark: '#111111',
            light: '#FFFFFF',
        },
    },
};
