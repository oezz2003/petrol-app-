/**
 * Color palette for drilling operations & HSE mobile app
 * Designed for high visibility in field conditions
 */

const tintColorLight = '#0066CC'; // Primary blue
const tintColorDark = '#4A9EFF';

export const Colors = {
    light: {
        text: '#1A1A1A',
        background: '#F5F5F5',
        tint: tintColorLight,
        icon: '#666666',
        tabIconDefault: '#999999',
        tabIconSelected: tintColorLight,

        // Card and surface colors
        card: '#FFFFFF',
        border: '#E0E0E0',

        // Status colors
        success: '#28A745',
        warning: '#FFC107',
        danger: '#DC3545',
        info: '#17A2B8',

        // Operations specific
        wellInProgress: '#FF9800',
        wellCompleted: '#4CAF50',
        wellDraft: '#9E9E9E',

        // HSE specific
        hazardHigh: '#D32F2F',
        hazardMedium: '#F57C00',
        hazardLow: '#FDD835',
        taskOverdue: '#B71C1C',
        taskPending: '#757575',
        taskInProgress: '#1976D2',
        taskCompleted: '#388E3C',
    },
    dark: {
        text: '#E8E8E8',
        background: '#121212',
        tint: tintColorDark,
        icon: '#A0A0A0',
        tabIconDefault: '#808080',
        tabIconSelected: tintColorDark,

        // Card and surface colors
        card: '#1E1E1E',
        border: '#333333',

        // Status colors
        success: '#2ECC40',
        warning: '#FFDC00',
        danger: '#FF4136',
        info: '#0074D9',

        // Operations specific
        wellInProgress: '#FFB74D',
        wellCompleted: '#66BB6A',
        wellDraft: '#BDBDBD',

        // HSE specific
        hazardHigh: '#EF5350',
        hazardMedium: '#FB8C00',
        hazardLow: '#FFEE58',
        taskOverdue: '#E57373',
        taskPending: '#9E9E9E',
        taskInProgress: '#42A5F5',
        taskCompleted: '#66BB6A',
    },
};
